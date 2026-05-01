import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasFallback, StaticTopologyFallback } from "./SafeCanvas";
import { useInView } from "../hooks/useInView";
import { useReveal } from "@/hooks/useReveal";

type Service = {
  index: string;
  title: string;
  short: string;
  body: string;
  capabilities: string[];
  scene: "wire" | "cloth" | "stream";
};

const services: Service[] = [
  {
    index: "I",
    title: "Web Engineering",
    short: "Brutalist architecture, surgical performance.",
    body:
      "Hand-engineered websites and web apps built like brutalist architecture — heavy, intentional, and unforgiving of waste. Every shader, every byte, every motion timing is justified.",
    capabilities: [
      "Bespoke React / Next.js",
      "Custom WebGL & Shader Pipelines",
      "GLSL",
      "GSAP",
      "Lenis",
      "DRACO",
      "KTX2",
      "Basis",
      "WebGL",
      "React Three Fiber",
      "Phaser Pipeline",
    ],
    scene: "wire",
  },
  {
    index: "II",
    title: "Graphic Design",
    short: "Identity systems with mass and gravity.",
    body:
      "Visual systems engineered like type foundries — bespoke wordmarks, kinetic identities, packaging that earns its shelf, and editorial layouts treated as architecture.",
    capabilities: [
      "Bespoke logotypes & wordmarks",
      "Variable type & kinetic identity",
      "Editorial & art direction",
      "Print, packaging, environmental",
    ],
    scene: "cloth",
  },
  {
    index: "III",
    title: "Digital Marketing",
    short: "Signal, not noise. Measured at the millimeter.",
    body:
      "Performance growth for ultra high-end brands — paid, organic, lifecycle, and creative production engineered to a single number. We say no, often.",
    capabilities: [
      "Performance creative",
      "Lifecycle & retention systems",
      "SEO architecture",
      "Attribution & analytics",
    ],
    scene: "stream",
  },
];

function WireScene() {
  const grp = useRef<THREE.Group | null>(null);
  useFrame((state) => {
    if (!grp.current) return;
    const t = state.clock.elapsedTime;
    grp.current.rotation.y = t * 0.18;
    grp.current.rotation.x = Math.sin(t * 0.3) * 0.2;
  });
  return (
    <group ref={grp}>
      {/* Nested wire frames - architectural assembly */}
      {[1, 1.6, 2.2, 2.8].map((r, i) => (
        <lineSegments key={i}>
          <edgesGeometry args={[new THREE.IcosahedronGeometry(r, 1)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.4 + i * 0.12} />
        </lineSegments>
      ))}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3.2, 3.2, 3.2)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.65} transparent />
      </lineSegments>
    </group>
  );
}

function ClothScene() {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const geom = useMemo(() => new THREE.PlaneGeometry(4.2, 4.2, 64, 64), []);
  const positions = useMemo(() => geom.attributes.position.array.slice() as Float32Array, [geom]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const arr = geom.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const wave =
        Math.sin(x * 1.4 + t * 0.9) * 0.32 +
        Math.cos(y * 1.6 + t * 0.7) * 0.28 +
        Math.sin((x + y) * 1.8 + t * 0.5) * 0.18;
      arr[i + 2] = wave;
    }
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();
    if (meshRef.current) {
      meshRef.current.rotation.x = -0.55;
      meshRef.current.rotation.z = Math.sin(t * 0.15) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geom}>
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.4}
          roughness={0.55}
          side={THREE.DoubleSide}
          flatShading
        />
      </mesh>
      <mesh geometry={geom} position={[0, 0, -0.15]}>
        <meshBasicMaterial color="#000000" wireframe />
      </mesh>
    </group>
  );
}

function StreamScene() {
  const ptsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const count = 90;

  const { positions, linePositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const linePositions = new Float32Array(count * 6);
    return { positions, linePositions };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ptsRef.current || !linesRef.current) return;
    const posAttr = ptsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = positions[i * 3 + 0] + Math.sin(t * 0.6 + i) * 0.18;
      arr[i * 3 + 1] = positions[i * 3 + 1] + Math.cos(t * 0.5 + i * 1.3) * 0.18;
      arr[i * 3 + 2] = positions[i * 3 + 2] + Math.sin(t * 0.4 + i * 0.7) * 0.18;
    }
    posAttr.needsUpdate = true;

    const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array;
    let li = 0;
    for (let i = 0; i < count; i++) {
      const ax = arr[i * 3];
      const ay = arr[i * 3 + 1];
      const az = arr[i * 3 + 2];
      // connect to nearest few
      for (let j = i + 1; j < count; j++) {
        const bx = arr[j * 3];
        const by = arr[j * 3 + 1];
        const bz = arr[j * 3 + 2];
        const d2 = (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;
        if (d2 < 1.4 && li < lineArr.length - 6) {
          lineArr[li++] = ax;
          lineArr[li++] = ay;
          lineArr[li++] = az;
          lineArr[li++] = bx;
          lineArr[li++] = by;
          lineArr[li++] = bz;
        }
      }
    }
    for (let z = li; z < lineArr.length; z++) lineArr[z] = 0;
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, li / 3);

    if (ptsRef.current) {
      ptsRef.current.rotation.y = t * 0.06;
      linesRef.current.rotation.y = t * 0.06;
    }
  });

  return (
    <group>
      <points ref={ptsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#ffffff" sizeAttenuation />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count * 2}
            array={linePositions}
            itemSize={3}
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.45} />
      </lineSegments>
    </group>
  );
}

function ServiceScene({ kind }: { kind: Service["scene"] }) {
  const [wrapRef, inView] = useInView<HTMLDivElement>("250px");
  return (
    <div ref={wrapRef} className="absolute inset-0">
    <CanvasFallback fallback={<StaticTopologyFallback kind={kind} />}>
      <Canvas
        dpr={[1, 1.25]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 0, 6.5], fov: 36 }}
        gl={{ antialias: true, alpha: false, failIfMajorPerformanceCaveat: false, powerPreference: "high-performance" }}
        style={{ background: "#000" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <directionalLight position={[-4, -2, 3]} intensity={0.4} />
        <Suspense fallback={null}>
          {kind === "wire" && <WireScene />}
          {kind === "cloth" && <ClothScene />}
          {kind === "stream" && <StreamScene />}
        </Suspense>
      </Canvas>
    </CanvasFallback>
    </div>
  );
}

export function Arsenal() {
  const [headRef, headRevealed] = useReveal<HTMLDivElement>();
  return (
    <section
      id="arsenal"
      className="relative bg-black py-24 md:py-32"
      data-testid="section-arsenal"
    >
      <div className="px-6 md:px-10">
        <div
          ref={headRef}
          className={`mb-16 md:mb-24 grid grid-cols-1 md:grid-cols-12 gap-8 reveal ${headRevealed ? "is-revealed" : ""}`}
        >
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            <div>N° 002 / Arsenal</div>
            <div className="mt-2 text-white/35">— Three disciplines, one studio</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[88px] leading-[0.92] font-black tracking-[-0.045em] text-white">
              Three disciplines.
              <br />
              <span className="font-serif italic font-light tracking-[-0.01em]">One uncompromising</span> studio.
            </h2>
            <p className="mt-8 max-w-[58ch] text-white/65 text-[15px] leading-[1.65]">
              ZYNTH operates as a single workshop with three bench positions — engineering, design, and growth.
              We do not assemble teams from elsewhere. Every line of code, every glyph, every campaign is shipped
              by people whose names you will know.
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10">
          {services.map((s, idx) => (
            <article
              key={s.index}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 border-b border-white/10 py-10 md:py-14"
              data-testid={`service-${s.scene}`}
            >
              <div className="md:col-span-1 font-mono text-[10px] tracking-[0.32em] uppercase text-white/45">
                {s.index}
              </div>

              <div className="md:col-span-4">
                <h3 className="font-display text-[36px] md:text-[56px] leading-[0.95] font-black tracking-[-0.04em] text-white">
                  {s.title}
                </h3>
                <p className="mt-4 text-white/70 text-[15px] leading-[1.55] max-w-[36ch]">{s.short}</p>
                <p className="mt-6 text-white/50 text-[13px] leading-[1.6] max-w-[42ch]">{s.body}</p>
                <ul className="mt-6 space-y-1.5">
                  {s.capabilities.map((c) => (
                    <li
                      key={c}
                      className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60"
                    >
                      <span className="inline-block h-px w-4 bg-white/40" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="md:col-span-7 relative h-[260px] md:h-[420px] border border-white/10 overflow-hidden"
                data-cursor="Inspect"
              >
                <ServiceScene kind={s.scene} />
                <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                  Topology · {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="pointer-events-none absolute right-4 bottom-4 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                  Live · WebGL
                </div>
                {/* corner brackets */}
                <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-white/60" />
                <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-white/60" />
                <span className="pointer-events-none absolute left-0 bottom-0 h-3 w-3 border-l border-b border-white/60" />
                <span className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b border-white/60" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
