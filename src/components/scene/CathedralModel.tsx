import { useMemo } from "react";
import * as THREE from "three";

const stone = { color: "#c9c0ac", roughness: 0.82 };
const stoneDark = { color: "#a89f8c", roughness: 0.88 };

function ribCurve(from: [number, number, number], to: [number, number, number], apex: number) {
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, apex, (from[2] + to[2]) / 2];
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(...from),
    new THREE.Vector3(...mid),
    new THREE.Vector3(...to),
  ]);
}

function Rib({ curve, radius = 0.16 }: { curve: THREE.CatmullRomCurve3; radius?: number }) {
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 64, radius, 12, false]} />
      <meshStandardMaterial {...stone} />
    </mesh>
  );
}

function CompoundPier({ x, z }: { x: number; z: number }) {
  const shafts = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return [Math.cos(a) * 0.42, Math.sin(a) * 0.42] as const;
      }),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.6, 1.6]} />
        <meshStandardMaterial {...stoneDark} />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.62, 6.2, 24]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      {shafts.map(([sx, sz], i) => (
        <mesh key={i} position={[sx, 3.4, sz]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 6.6, 12]} />
          <meshStandardMaterial {...stone} />
        </mesh>
      ))}
      <mesh position={[0, 6.75, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.62, 0.5, 24]} />
        <meshStandardMaterial {...stoneDark} />
      </mesh>
    </group>
  );
}

function FlyingButtress({ side }: { side: 1 | -1 }) {
  const curve = useMemo(() => ribCurve([side * 3.9, 7.4, 0], [side * 7.4, 3.6, 0], 8.4), [side]);
  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 48, 0.28, 12, false]} />
        <meshStandardMaterial {...stoneDark} />
      </mesh>
      <mesh position={[side * 7.8, 3.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 6.0, 1.5]} />
        <meshStandardMaterial {...stoneDark} />
      </mesh>
      <mesh position={[side * 7.8, 6.9, 0]} castShadow>
        <coneGeometry args={[0.8, 2.2, 4]} />
        <meshStandardMaterial {...stone} />
      </mesh>
    </group>
  );
}

function GlassWindow({
  x,
  y,
  w,
  h,
  tint,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tint: string;
}) {
  return (
    <group position={[x, y, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          color={tint}
          transparent
          opacity={0.55}
          roughness={0.15}
          transmission={0.6}
          emissive={tint}
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[(i - 1) * (w / 3), 0, 0.03]}>
          <boxGeometry args={[0.09, h, 0.09]} />
          <meshStandardMaterial {...stoneDark} />
        </mesh>
      ))}
    </group>
  );
}

export function CathedralModel({ showVault }: { showVault: boolean }) {
  const ribs = useMemo(
    () => [
      ribCurve([-3.3, 7.0, 3.1], [3.3, 7.0, -3.1], 10.6),
      ribCurve([3.3, 7.0, 3.1], [-3.3, 7.0, -3.1], 10.6),
      ribCurve([-3.3, 7.0, 3.1], [3.3, 7.0, 3.1], 9.6),
      ribCurve([-3.3, 7.0, -3.1], [3.3, 7.0, -3.1], 9.6),
      ribCurve([-3.3, 7.0, 3.1], [-3.3, 7.0, -3.1], 9.4),
      ribCurve([3.3, 7.0, 3.1], [3.3, 7.0, -3.1], 9.4),
    ],
    [],
  );

  return (
    <group position={[0, -3.2, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#6e6555" roughness={0.95} />
      </mesh>

      {/* Piers at the four bay corners */}
      {[
        [3.3, 3.1],
        [-3.3, 3.1],
        [3.3, -3.1],
        [-3.3, -3.1],
      ].map(([x, z]) => (
        <CompoundPier key={`${x}:${z}`} x={x as number} z={z as number} />
      ))}

      {/* Nave arcade — pointed arches on both open faces */}
      <Rib curve={ribCurve([-3.3, 7.0, 3.1], [3.3, 7.0, 3.1], 8.9)} radius={0.24} />
      <Rib curve={ribCurve([-3.3, 7.0, -3.1], [3.3, 7.0, -3.1], 8.9)} radius={0.24} />

      {/* Rib vault */}
      {showVault && ribs.map((c, i) => <Rib key={i} curve={c} />)}
      {showVault && (
        <mesh position={[0, 10.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4.4, 40]} />
          <meshStandardMaterial color="#b5ac98" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Boss at the vault crown */}
      {showVault && (
        <mesh position={[0, 10.4, 0]} castShadow>
          <dodecahedronGeometry args={[0.36]} />
          <meshStandardMaterial {...stoneDark} />
        </mesh>
      )}

      {/* Wall membrane with triforium + clerestory on the left elevation */}
      <mesh position={[-3.95, 5.0, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 6.4]} />
        <meshStandardMaterial color="#bdb4a0" roughness={0.9} />
      </mesh>
      <GlassWindow x={-3.6} y={8.2} w={4.4} h={2.8} tint="#5aa9ff" />
      <GlassWindow x={-3.6} y={5.6} w={4.4} h={1.4} tint="#2f4a78" />

      {/* Right elevation, mirrored, carrying the buttress load */}
      <mesh position={[3.95, 5.0, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 6.4]} />
        <meshStandardMaterial color="#bdb4a0" roughness={0.9} />
      </mesh>
      <GlassWindow x={3.6} y={8.2} w={4.4} h={2.8} tint="#ffb85c" />

      <FlyingButtress side={1} />
      <FlyingButtress side={-1} />
    </group>
  );
}
