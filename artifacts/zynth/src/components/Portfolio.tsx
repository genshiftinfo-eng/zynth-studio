import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasFallback, StaticPortfolioFallback } from "./SafeCanvas";

type Project = {
  client: string;
  service: string;
  year: string;
  scope: string;
  pattern: "grid" | "rings" | "stripes" | "dots" | "topo" | "mesh";
};

const projects: Project[] = [
  {
    client: "Maison Volterra",
    service: "Brand · Web · Editorial",
    year: "MMXXV",
    scope: "Bespoke wordmark, atelier site, and editorial system for a Florentine couture house.",
    pattern: "grid",
  },
  {
    client: "Obsidian Capital",
    service: "Web · Identity",
    year: "MMXXV",
    scope: "An investment platform built like a private vault — identity, web, and shareholder portal.",
    pattern: "rings",
  },
  {
    client: "Hokusai Distillery",
    service: "Brand · Packaging · Web",
    year: "MMXXIV",
    scope: "Single-malt rebrand, kinetic packaging system, and an immersive cellar tour.",
    pattern: "stripes",
  },
  {
    client: "Atelier Noir",
    service: "Web · Motion",
    year: "MMXXIV",
    scope: "An online gallery for a Parisian art-collector — silent, monolithic, weight-of-marble.",
    pattern: "dots",
  },
  {
    client: "Stratum Architects",
    service: "Identity · Web",
    year: "MMXXIV",
    scope: "Practice site and identity for a brutalist firm in Mexico City — concrete made digital.",
    pattern: "topo",
  },
  {
    client: "Helios Yachts",
    service: "Brand · Configurator",
    year: "MMXXIII",
    scope: "Custom yacht configurator with real-time WebGL hull rendering and bespoke brochure system.",
    pattern: "mesh",
  },
];

function makePatternTexture(pattern: Project["pattern"]) {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 2;
  switch (pattern) {
    case "grid": {
      const step = 64;
      ctx.lineWidth = 1;
      for (let i = 0; i <= size; i += step) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,.07)";
      ctx.fillRect(size * 0.32, size * 0.34, size * 0.36, size * 0.32);
      break;
    }
    case "rings": {
      ctx.lineWidth = 2;
      for (let r = 40; r < size * 0.7; r += 38) {
        ctx.beginPath(); ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(size / 2, size / 2, 22, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "stripes": {
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.translate(-size, -size);
      for (let y = 0; y < size * 2; y += 28) {
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.fillRect(0, y, size * 2, 8);
      }
      ctx.restore();
      break;
    }
    case "dots": {
      const step = 32;
      for (let x = step; x < size; x += step) {
        for (let y = step; y < size; y += step) {
          const r = 1.4 + (Math.sin(x * 0.02) + Math.cos(y * 0.025)) * 1.6;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "topo": {
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 28; i++) {
        ctx.beginPath();
        for (let x = 0; x <= size; x += 6) {
          const y =
            size / 2 +
            Math.sin((x + i * 60) * 0.012) * (40 + i * 10) +
            Math.sin(x * 0.03 + i) * 18;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case "mesh": {
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * size, Math.random() * size);
        ctx.lineTo(Math.random() * size, Math.random() * size);
        ctx.stroke();
      }
      break;
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

const slabVertex = /* glsl */ `
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vDisp;
  void main() {
    vUv = uv;
    vec3 p = position;
    float dx = (uv.x - uMouse.x) * 2.0;
    float dy = (uv.y - uMouse.y) * 2.0;
    float d = exp(-(dx*dx + dy*dy) * 3.0);
    float wave = sin(uv.x * 18.0 + uTime * 1.4) * 0.02 + cos(uv.y * 14.0 - uTime) * 0.02;
    float disp = d * 0.55 * uHover + wave * uHover;
    p.z += disp;
    vDisp = disp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const slabFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHover;
  varying vec2 vUv;
  varying float vDisp;

  void main() {
    vec2 uv = vUv;
    float aberr = 0.018 * uHover;
    float r = texture2D(uMap, uv + vec2(aberr, 0.0)).r;
    float g = texture2D(uMap, uv).g;
    float b = texture2D(uMap, uv - vec2(aberr, 0.0)).b;
    vec3 col = vec3(r, g, b);
    // Tint with displacement to suggest depth layers
    col += vec3(vDisp * 0.6);
    // Vignette
    float v = smoothstep(0.95, 0.3, distance(vUv, vec2(0.5)));
    col *= v;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Slab({
  position,
  texture,
  active,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  position: [number, number, number];
  texture: THREE.Texture;
  active: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const mat = useRef<THREE.ShaderMaterial | null>(null);
  const grp = useRef<THREE.Group | null>(null);
  const [mouse, setMouse] = useState<[number, number]>([0.5, 0.5]);
  const hover = useRef(0);

  useFrame((state, dt) => {
    hover.current += ((active ? 1 : 0) - hover.current) * Math.min(1, dt * 5);
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
      mat.current.uniforms.uHover.value = hover.current;
      mat.current.uniforms.uMouse.value.set(mouse[0], mouse[1]);
    }
    if (grp.current) {
      const tx = active ? 0 : position[0];
      const ty = active ? 0 : position[1];
      const tz = active ? 0.3 : position[2];
      grp.current.position.x += (tx - grp.current.position.x) * Math.min(1, dt * 4);
      grp.current.position.y += (ty - grp.current.position.y) * Math.min(1, dt * 4);
      grp.current.position.z += (tz - grp.current.position.z) * Math.min(1, dt * 4);
      const targetRotY = active ? 0 : (position[0] / 6) * 0.4;
      grp.current.rotation.y += (targetRotY - grp.current.rotation.y) * Math.min(1, dt * 4);
      grp.current.rotation.x += ((active ? 0 : -0.05) - grp.current.rotation.x) * Math.min(1, dt * 4);
    }
  });

  return (
    <group ref={grp} position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut();
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          if (e.uv) setMouse([e.uv.x, e.uv.y]);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <planeGeometry args={[2.6, 3.4, 96, 128]} />
        <shaderMaterial
          ref={mat}
          vertexShader={slabVertex}
          fragmentShader={slabFragment}
          uniforms={{
            uMap: { value: texture },
            uHover: { value: 0 },
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          }}
        />
      </mesh>
      {/* slab edge */}
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.6, 3.4)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

function PortfolioScene({
  active,
  setActive,
}: {
  active: number;
  setActive: (n: number) => void;
}) {
  const textures = useMemo(() => projects.map((p) => makePatternTexture(p.pattern)), []);
  const positions = useMemo(
    () =>
      projects.map((_, i) => {
        const span = 3.6;
        return [(i - (projects.length - 1) / 2) * span, 0, 0] as [number, number, number];
      }),
    [],
  );

  // Smooth camera follow
  const { camera } = useThree();
  useFrame((_, dt) => {
    const targetX = positions[active][0] * 0.35;
    camera.position.x += (targetX - camera.position.x) * Math.min(1, dt * 2);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 5]} intensity={0.9} />
      {projects.map((_, i) => (
        <Slab
          key={i}
          position={positions[i]}
          texture={textures[i]}
          active={active === i}
          onPointerOver={() => setActive(i)}
          onPointerOut={() => {}}
          onClick={() => setActive(i)}
        />
      ))}
    </>
  );
}

export function Portfolio() {
  const [active, setActive] = useState(0);
  const project = projects[active];

  return (
    <section
      id="proof"
      className="relative bg-black py-24 md:py-32 border-t border-white/10"
      data-testid="section-proof"
    >
      <div className="px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            <div>N° 005 / Proof</div>
            <div className="mt-2 text-white/35">— Selected works, MMXXIII–MMXXV</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[88px] leading-[0.92] font-black tracking-[-0.045em] text-white">
              Proof,
              <br />
              <span className="font-serif italic font-light">in the artifact.</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="relative h-[60svh] md:h-[68svh] w-full" data-cursor="Drag">
        <CanvasFallback fallback={<StaticPortfolioFallback />}>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 6.2], fov: 36 }}
            gl={{ antialias: true, alpha: false, failIfMajorPerformanceCaveat: false }}
          >
            <Suspense fallback={null}>
              <PortfolioScene active={active} setActive={setActive} />
            </Suspense>
          </Canvas>
        </CanvasFallback>
        {/* edge gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
      </div>

      <div className="px-6 md:px-10 mt-10 md:mt-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-white/10 pt-8">
          <div className="md:col-span-1 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </div>
          <div className="md:col-span-5">
            <h3 className="font-display text-[32px] md:text-[48px] font-black leading-[1] tracking-[-0.04em] text-white" data-testid="proof-active-client">
              {project.client}
            </h3>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
              {project.service} · {project.year}
            </div>
          </div>
          <div className="md:col-span-6">
            <p className="text-white/70 text-[15px] leading-[1.65] max-w-[58ch]" data-testid="proof-active-scope">
              {project.scope}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.client}
              onClick={() => setActive(i)}
              className={`group inline-flex items-center gap-3 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] transition ${
                active === i
                  ? "border-white text-white bg-white/10"
                  : "border-white/20 text-white/55 hover:text-white"
              }`}
              data-cursor="View"
              data-testid={`proof-thumb-${i}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 ${active === i ? "bg-white" : "bg-white/40"}`}
              />
              {p.client}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
