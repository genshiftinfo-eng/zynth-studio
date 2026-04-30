import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { scrollToSection } from "@/hooks/useLenis";
import { CanvasFallback, StaticHeroFallback } from "./SafeCanvas";
import { useInView } from "../hooks/useInView";

/**
 * Build a high-DPI canvas texture with the ZYNTH wordmark.
 * White glyph on black so the shader can displace luminance directly.
 */
function makeLogoTexture(): THREE.CanvasTexture {
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1);
  const W = 2048;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W * dpr;
  c.height = H * dpr;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Use the same display font stack as the rest of the site
  ctx.font = "900 380px 'Helvetica Neue', 'Inter', Arial, sans-serif";
  // Manual letter spacing because canvas2d's letterSpacing has spotty support
  const text = "ZYNTH";
  const tracking = -22;
  // measure with manual tracking
  const widths = text.split("").map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1);
  let x = (W - totalWidth) / 2;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x + widths[i] / 2, H / 2 + 8);
    x += widths[i] + tracking;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

const liquidVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const liquidFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uMouse;       // smoothed mouse in UV space
  uniform vec2 uMouseVel;    // velocity for trailing splash
  uniform float uTime;
  uniform float uHover;      // 0..1 — scales effect when cursor present
  uniform vec2 uAspect;      // (1.0, planeAspect) for circular falloff

  // 2D simplex-ish cheap noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;

    // Aspect-correct vector from mouse to fragment (circular falloff)
    vec2 d = (uv - uMouse) * uAspect;
    float dist = length(d);
    vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);

    // Influence radius — bigger on the long axis
    float radius = 0.28;
    // Soft falloff. cubic for that liquid bulge feel.
    float fall = smoothstep(radius, 0.0, dist) * uHover;
    float fall2 = fall * fall;

    // Concentric ripple traveling outward from the mouse
    float wave = sin(dist * 38.0 - uTime * 5.5) * fall;

    // Slow caustic-like noise on top so the surface looks alive
    float caustic = (noise(uv * 6.0 + uTime * 0.25) - 0.5) * 0.18 * fall;

    // Outward push (bulge) + ripple oscillation + ambient liquid wobble
    float push = fall2 * 0.10;       // pulled toward cursor
    float ripple = wave * 0.022;     // wavefronts
    vec2 displace = dir * (push + ripple) + vec2(caustic, -caustic);

    // Subtle drag-trail in the direction of mouse velocity
    displace += uMouseVel * fall * 0.20;

    vec2 sampUv = uv - displace;

    // Sample text mask (white = glyph, black = background)
    float L = texture2D(uTex, sampUv).r;

    // Inside the bulge add a soft luminance lift so the "fluid" picks up
    // light on the glyph, like a wet highlight.
    float highlight = pow(fall, 2.5) * 0.35;

    // Edge sheen: brighten where the wave crests meet the glyph contour
    float crest = smoothstep(0.45, 0.95, wave * 0.5 + 0.5) * fall * 0.25;

    float v = clamp(L + (highlight + crest) * L, 0.0, 1.0);

    // Outside the influence: pure original mask, perfectly static.
    gl_FragColor = vec4(vec3(v), 1.0);
  }
`;

function LiquidLogo() {
  const { viewport } = useThree();
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const texture = useMemo(() => makeLogoTexture(), []);
  // Plane is sized 4:1 to match the texture ratio.
  const planeW = 8.4;
  const planeH = 2.1;

  // Mouse state (uv space). Default off-screen so no effect at rest.
  const target = useRef(new THREE.Vector2(-10, -10));
  const smooth = useRef(new THREE.Vector2(-10, -10));
  const lastSmooth = useRef(new THREE.Vector2(-10, -10));
  const vel = useRef(new THREE.Vector2(0, 0));
  const hoverTarget = useRef(0);
  const hover = useRef(0);

  const aspect = useMemo(() => new THREE.Vector2(1.0, planeH / planeW), []);

  // Responsive scale
  const scale = useMemo(() => {
    const w = viewport.width;
    if (w < 6) return 0.55;
    if (w < 9) return 0.78;
    return 1.0;
  }, [viewport.width]);

  useFrame((state, dt) => {
    // Smooth mouse with a high-quality lerp
    const k = 1 - Math.pow(0.001, dt);
    smooth.current.lerp(target.current, k);
    // Velocity for trail
    vel.current.set(
      smooth.current.x - lastSmooth.current.x,
      smooth.current.y - lastSmooth.current.y,
    );
    lastSmooth.current.copy(smooth.current);

    hover.current += (hoverTarget.current - hover.current) * Math.min(1, dt * 6);

    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uMouse.value.copy(smooth.current);
      u.uMouseVel.value.copy(vel.current);
      u.uHover.value = hover.current;
      u.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh
      scale={scale}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (e.uv) {
          target.current.set(e.uv.x, e.uv.y);
          hoverTarget.current = 1;
        }
      }}
      onPointerEnter={() => {
        hoverTarget.current = 1;
      }}
      onPointerLeave={() => {
        hoverTarget.current = 0;
        // park mouse off-screen so falloff fades cleanly
        target.current.set(-10, -10);
      }}
    >
      <planeGeometry args={[planeW, planeH, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={liquidVertex}
        fragmentShader={liquidFragment}
        transparent={false}
        uniforms={{
          uTex: { value: texture },
          uMouse: { value: new THREE.Vector2(-10, -10) },
          uMouseVel: { value: new THREE.Vector2(0, 0) },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uAspect: { value: aspect },
        }}
      />
    </mesh>
  );
}

function FloatingShards() {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 36;
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 18,
        y: (Math.random() - 0.5) * 10,
        // strictly behind the logo plane (which sits at z=0)
        z: -5 - Math.random() * 9,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        s: 0.04 + Math.random() * 0.14,
        speed: 0.08 + Math.random() * 0.35,
      })),
    [],
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      dummy.position.set(s.x, s.y + Math.sin(t * s.speed + i) * 0.4, s.z);
      dummy.rotation.set(s.rx + t * s.speed * 0.4, s.ry + t * s.speed * 0.3, 0);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.15} />
    </instancedMesh>
  );
}

export function Monolith() {
  const [sectionRef, inView] = useInView<HTMLElement>("400px");
  return (
    <section
      ref={sectionRef}
      id="monolith"
      className="relative h-[100svh] w-full overflow-hidden bg-black"
      data-testid="section-monolith"
    >
      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-6 top-24 md:left-10 md:top-28 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
          <div>N° 001 / Monolith</div>
          <div className="mt-1 text-white/35">Lat 37.7749 · Lon −122.4194</div>
        </div>
        <div className="absolute right-6 top-24 md:right-10 md:top-28 text-right font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
          <div>Bespoke · Avant-garde</div>
          <div className="mt-1 text-white/35">Awwwards · FWA · CSSDA</div>
        </div>
        <div className="absolute bottom-10 left-6 md:left-10 right-6 md:right-10 flex items-end justify-between">
          <div className="max-w-md">
            <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
              ◆ A studio for the uncompromising
            </div>
            <h2 className="mt-3 font-display text-[14px] md:text-[18px] leading-[1.25] text-white/85 max-w-[44ch]">
              We build digital monoliths — websites, brand systems, and growth engines
              forged from raw geometry and obsessive engineering.
            </h2>
          </div>
          <button
            onClick={() => scrollToSection("#arsenal")}
            data-cursor="Descend"
            className="pointer-events-auto group hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/70 hover:text-white"
            data-testid="hero-scroll-cta"
          >
            <span className="relative inline-block h-10 w-px bg-white/40 overflow-hidden">
              <span className="absolute inset-0 bg-white animate-[fall_1.6s_ease-in-out_infinite]" />
            </span>
            Scroll · Descend
          </button>
        </div>
      </div>

      {/* The 3D canvas */}
      <CanvasFallback fallback={<StaticHeroFallback />}>
        <Canvas
          dpr={[1, 1.4]}
          frameloop={inView ? "always" : "never"}
          camera={{ position: [0, 0, 7.5], fov: 38 }}
          gl={{ antialias: true, alpha: false, failIfMajorPerformanceCaveat: false, powerPreference: "high-performance" }}
          style={{ background: "#000" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#000000", 1);
          }}
        >
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.18} />
          <directionalLight position={[5, 6, 4]} intensity={1.6} color="#ffffff" />
          <directionalLight position={[-6, -2, 3]} intensity={0.7} color="#ffffff" />
          <Suspense fallback={null}>
            <LiquidLogo />
            <FloatingShards />
          </Suspense>
        </Canvas>
      </CanvasFallback>

      {/* fall animation */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </section>
  );
}
