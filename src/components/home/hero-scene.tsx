/**
 * "Distributed System Core" — the real 3D hero visualization.
 *
 * One central node (the service) connected to 5 satellite nodes (its
 * dependencies), with pulses traveling along the connections on a loop,
 * a slow idle rotation, mouse-parallax tilt, and a brighter pulse burst
 * on click. Built with @react-three/fiber, not a design-tool export, so
 * it lives entirely in code and has no watermark or paywall.
 *
 * This file is loaded lazily and client-only by hero-visual.tsx — never
 * import it directly from a server-rendered path.
 */
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#4ECDC4";
const CORE_COLOR = "#1a1a20";
const LINE_COLOR = "#3a3a42";

type SatelliteDef = {
  position: [number, number, number];
  shape: "sphere" | "octahedron";
  scale: number;
};

const SATELLITES: SatelliteDef[] = [
  { position: [2.2, 0.6, -0.4], shape: "sphere", scale: 0.45 },
  { position: [-2.0, 0.9, 0.6], shape: "sphere", scale: 0.45 },
  { position: [1.4, -1.2, 1.0], shape: "octahedron", scale: 0.5 },
  { position: [-1.6, -0.8, -0.9], shape: "sphere", scale: 0.45 },
  { position: [0.6, 1.8, -0.6], shape: "octahedron", scale: 0.5 },
];

/** Central service node — dark glass/metal sphere with a faint rim glow. */
function CoreNode() {
  return (
    <mesh>
      <icosahedronGeometry args={[1.2, 2]} />
      <meshPhysicalMaterial
        color={CORE_COLOR}
        roughness={0.15}
        metalness={0.6}
        reflectivity={0.4}
        emissive={ACCENT}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}

function Satellite({ def }: { def: SatelliteDef }) {
  const geometry =
    def.shape === "octahedron" ? (
      <octahedronGeometry args={[def.scale, 0]} />
    ) : (
      <sphereGeometry args={[def.scale, 32, 32]} />
    );
  return (
    <mesh position={def.position}>
      {geometry}
      <meshPhysicalMaterial
        color={CORE_COLOR}
        roughness={0.25}
        metalness={0.5}
        reflectivity={0.3}
        emissive={ACCENT}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

/** Thin dim line from the core to one satellite. */
function Connection({ to }: { to: [number, number, number] }) {
  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(...to),
    ]);
    const material = new THREE.LineBasicMaterial({
      color: LINE_COLOR,
      transparent: true,
      opacity: 0.6,
    });
    return new THREE.Line(geometry, material);
  }, [to]);

  // `primitive` avoids TS resolving the JSX tag against the DOM's SVGLineElement.
  return <primitive object={lineObject} />;
}

/**
 * Glowing particle traveling core -> satellite on a loop, offset per index
 * so pulses don't all fire in lockstep. `burst` (0..1, decaying) speeds the
 * cycle briefly and boosts brightness right after a click.
 */
function Pulse({
  to,
  offset,
  burstRef,
}: {
  to: [number, number, number];
  offset: number;
  burstRef: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const target = useMemo(() => new THREE.Vector3(...to), [to]);
  const CYCLE = 2.4; // seconds per one-way core -> satellite travel

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const burst = burstRef.current;
    const speed = 1 + burst * 2.5; // burst temporarily speeds the pulse up
    const t = ((clock.getElapsedTime() * speed) / CYCLE + offset) % 1;
    ref.current.position.lerpVectors(new THREE.Vector3(0, 0, 0), target, t);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.2 + burst * 2;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} />
    </mesh>
  );
}

/** Whole cluster: slow idle spin + mouse-parallax tilt, capped at ~12deg. */
function SystemCore({ burstRef }: { burstRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;
    // Slow ambient rotation, independent of interaction.
    group.current.rotation.y += delta * 0.08;

    // Mouse-parallax tilt toward pointer, capped to a small range.
    const maxTilt = THREE.MathUtils.degToRad(12);
    target.current.x = THREE.MathUtils.clamp(state.pointer.y * maxTilt, -maxTilt, maxTilt);
    target.current.y += THREE.MathUtils.clamp(state.pointer.x * maxTilt, -maxTilt, maxTilt) * 0; // reserved
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      target.current.x,
      0.05,
    );

    // Decay the click-burst back to zero over time.
    if (burstRef.current > 0) {
      burstRef.current = Math.max(0, burstRef.current - delta * 0.6);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    burstRef.current = 1;
  };

  return (
    <group ref={group} onClick={handleClick}>
      <CoreNode />
      {SATELLITES.map((sat, i) => (
        <group key={i}>
          <Satellite def={sat} />
          <Connection to={sat.position} />
          <Pulse to={sat.position} offset={i / SATELLITES.length} burstRef={burstRef} />
        </group>
      ))}
    </group>
  );
}

export function HeroScene() {
  const burstRef = useRef(0);
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      camera={{ position: [1.5, 2, 5.5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.75]}
      onCreated={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={0.8} />
      <pointLight position={[-3, -2, -2]} intensity={0.3} color={ACCENT} />
      <SystemCore burstRef={burstRef} />
    </Canvas>
  );
}
