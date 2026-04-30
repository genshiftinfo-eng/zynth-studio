import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, MeshTransmissionMaterial, Text3D } from "@react-three/drei";
import * as THREE from "three";
import { scrollToSection } from "@/hooks/useLenis";
import { CanvasFallback, StaticHeroFallback } from "./SafeCanvas";
import { useInView } from "../hooks/useInView";

function MonolithText() {
  const groupRef = useRef<THREE.Group | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const { mouse, viewport } = useThree();

  useFrame((state, dt) => {
    target.current.x = mouse.x * 0.5;
    target.current.y = mouse.y * 0.35;
    if (groupRef.current) {
      groupRef.current.rotation.y += (target.current.x - groupRef.current.rotation.y) * Math.min(1, dt * 4);
      groupRef.current.rotation.x += (-target.current.y - groupRef.current.rotation.x) * Math.min(1, dt * 4);
      const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.015;
      groupRef.current.position.y = breathe;
    }
  });

  // scale to viewport for responsiveness
  const scale = useMemo(() => {
    const w = viewport.width;
    if (w < 6) return 0.55;
    if (w < 9) return 0.85;
    return 1.05;
  }, [viewport.width]);

  return (
    <group ref={groupRef} scale={scale}>
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={2.0}
          height={0.65}
          curveSegments={18}
          bevelEnabled
          bevelThickness={0.06}
          bevelSize={0.025}
          bevelSegments={8}
          letterSpacing={-0.06}
        >
          ZYNTH
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={1.6}
            chromaticAberration={0.4}
            anisotropy={0.6}
            distortion={0.5}
            distortionScale={0.4}
            temporalDistortion={0.1}
            ior={1.45}
            roughness={0.05}
            transmission={1}
            color="#ffffff"
            attenuationColor="#ffffff"
            attenuationDistance={1.5}
            background={new THREE.Color("#000000")}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function FloatingShards() {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 36;
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 8,
        z: -2 - Math.random() * 8,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        s: 0.04 + Math.random() * 0.18,
        speed: 0.1 + Math.random() * 0.4,
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
            <MonolithText />
            <FloatingShards />
            <Environment preset="studio" />
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
