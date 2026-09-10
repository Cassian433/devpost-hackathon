import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function OrbitRing({ radius, tilt = 0 }: { radius: number; tilt?: number }) {
  return (
    <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.018, 8, 96]} />
      <meshBasicMaterial color="#86a7df" transparent opacity={0.35} />
    </mesh>
  );
}

export function SolarSystemModel() {
  const earth = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!earth.current) return;
    earth.current.rotation.y = state.clock.elapsedTime * 0.12;
  });
  return (
    <group rotation={[0.2, 0, -0.08]}>
      <mesh>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial color="#e3a83a" emissive="#c88220" emissiveIntensity={1.6} />
      </mesh>
      {[2.2, 3.4, 4.8, 6.3].map((radius) => (
        <OrbitRing key={radius} radius={radius} tilt={radius / 30} />
      ))}
      <mesh position={[2.2, 0, 0]}>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial color="#a99d8e" />
      </mesh>
      <group ref={earth}>
        <mesh position={[3.25, 0.28, 0.55]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color="#3c72a8" roughness={0.65} />
        </mesh>
        <mesh position={[3.78, 0.34, 0.55]}>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshStandardMaterial color="#b7afa0" />
        </mesh>
      </group>
      <mesh position={[-4.45, 0.45, 1.2]}>
        <sphereGeometry args={[0.34, 28, 28]} />
        <meshStandardMaterial color="#a65e45" />
      </mesh>
      <mesh position={[5.55, -0.35, -2.3]}>
        <sphereGeometry args={[0.72, 36, 36]} />
        <meshStandardMaterial color="#c8a374" />
      </mesh>
    </group>
  );
}

export function TectonicModel() {
  return (
    <group rotation={[-0.18, -0.4, 0]}>
      <mesh position={[-2.1, 0, 0]} rotation={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[4.2, 0.45, 5]} />
        <meshStandardMaterial color="#7c8875" roughness={0.9} />
      </mesh>
      <mesh position={[2.1, -0.15, 0]} rotation={[0, 0, 0.07]} castShadow>
        <boxGeometry args={[4.2, 0.45, 5]} />
        <meshStandardMaterial color="#9c846d" roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.8, 7, 4]} />
        <meshStandardMaterial color="#be5f3f" emissive="#6f2418" emissiveIntensity={0.5} />
      </mesh>
      {[-1.5, -0.75, 0, 0.75, 1.5].map((z, i) => (
        <mesh
          key={z}
          position={[0, 0.4 + Math.abs(i - 2) * 0.15, z]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <coneGeometry args={[0.75, 1.8 - Math.abs(i - 2) * 0.15, 4]} />
          <meshStandardMaterial color="#646d61" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Gear({
  position,
  radius,
  teeth,
  rotation = 0,
}: {
  position: [number, number, number];
  radius: number;
  teeth: number;
  rotation?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.rotation.z = rotation + state.clock.elapsedTime * (radius > 1 ? 0.18 : -0.3);
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, 0.38, 32]} />
        <meshStandardMaterial color="#718096" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.22]}>
        <torusGeometry args={[radius * 0.48, radius * 0.13, 16, 40]} />
        <meshStandardMaterial color="#d4d8dc" metalness={0.75} roughness={0.22} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius * 1.08, Math.sin(a) * radius * 1.08, 0]}
            rotation={[0, 0, a]}
          >
            <boxGeometry args={[radius * 0.34, radius * 0.28, 0.42]} />
            <meshStandardMaterial color="#66727e" metalness={0.75} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

export function GearboxModel() {
  return (
    <group rotation={[0.7, 0, 0]}>
      <Gear position={[-1.25, 0.2, 0]} radius={1.45} teeth={14} />
      <Gear position={[1.45, 0.55, 0]} radius={1.0} teeth={11} rotation={0.12} />
      <Gear position={[0.65, -1.45, 0]} radius={0.68} teeth={9} rotation={0.3} />
      <mesh position={[0, 0, -0.55]}>
        <boxGeometry args={[6.2, 4.6, 0.25]} />
        <meshStandardMaterial color="#30343a" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}
