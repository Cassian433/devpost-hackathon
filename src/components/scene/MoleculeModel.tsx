import { useMemo } from "react";
import * as THREE from "three";

type Element = "C" | "N" | "O" | "H";

const STYLE: Record<Element, { color: string; radius: number }> = {
  C: { color: "#4b5566", radius: 0.42 },
  N: { color: "#4f74d8", radius: 0.4 },
  O: { color: "#d8493f", radius: 0.38 },
  H: { color: "#e8ecf4", radius: 0.22 },
};

// Approximate planar geometry of 1,3,7-trimethylxanthine (caffeine), scaled for viewing.
const atoms: { el: Element; p: [number, number, number] }[] = [
  { el: "N", p: [-0.9, 1.15, 0] }, // N1
  { el: "C", p: [0.42, 1.55, 0] }, // C2
  { el: "N", p: [1.42, 0.62, 0] }, // N3
  { el: "C", p: [1.12, -0.75, 0] }, // C4
  { el: "C", p: [-0.24, -1.18, 0] }, // C5
  { el: "C", p: [-1.29, -0.24, 0] }, // C6
  { el: "O", p: [0.75, 2.78, 0] }, // O2
  { el: "O", p: [-2.52, -0.6, 0] }, // O6
  { el: "N", p: [1.9, -1.83, 0] }, // N7
  { el: "C", p: [1.03, -2.92, 0] }, // C8
  { el: "N", p: [-0.22, -2.55, 0] }, // N9
  { el: "C", p: [-1.86, 2.22, 0] }, // N1 methyl
  { el: "C", p: [2.79, 1.05, 0] }, // N3 methyl
  { el: "C", p: [3.28, -2.05, 0] }, // N7 methyl
  { el: "H", p: [1.34, -3.95, 0] },
  { el: "H", p: [-2.62, 1.86, 0.75] },
  { el: "H", p: [-1.5, 3.2, 0.2] },
  { el: "H", p: [-2.3, 2.3, -0.95] },
  { el: "H", p: [3.28, 0.8, 0.9] },
  { el: "H", p: [3.15, 2.05, -0.15] },
  { el: "H", p: [2.85, 0.75, -1.0] },
  { el: "H", p: [3.75, -1.4, 0.75] },
  { el: "H", p: [3.55, -1.85, -1.0] },
  { el: "H", p: [3.6, -3.06, 0.2] },
];

const bonds: [number, number, number][] = [
  [0, 1, 1],
  [1, 2, 1],
  [2, 3, 1],
  [3, 4, 2],
  [4, 5, 1],
  [5, 0, 1],
  [1, 6, 2],
  [5, 7, 2],
  [3, 8, 1],
  [8, 9, 1],
  [9, 10, 2],
  [10, 4, 1],
  [0, 11, 1],
  [2, 12, 1],
  [8, 13, 1],
  [9, 14, 1],
  [11, 15, 1],
  [11, 16, 1],
  [11, 17, 1],
  [12, 18, 1],
  [12, 19, 1],
  [12, 20, 1],
  [13, 21, 1],
  [13, 22, 1],
  [13, 23, 1],
];

function Bond({ a, b, order }: { a: THREE.Vector3; b: THREE.Vector3; order: number }) {
  const { mid, quat, len } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return {
      mid: new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5),
      quat: q,
      len: dir.length(),
    };
  }, [a, b]);

  const offsets = order === 2 ? [-0.09, 0.09] : [0];

  return (
    <group position={mid} quaternion={quat}>
      {offsets.map((o) => (
        <mesh key={o} position={[o, 0, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, len, 14]} />
          <meshStandardMaterial color="#9fb0c6" roughness={0.35} metalness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export function MoleculeModel({ showHydrogens }: { showHydrogens: boolean }) {
  const positions = useMemo(() => atoms.map((a) => new THREE.Vector3(...a.p)), []);

  return (
    <group scale={1.25}>
      {atoms.map((atom, i) => {
        if (!showHydrogens && atom.el === "H") return null;
        const s = STYLE[atom.el];
        return (
          <mesh key={i} position={atom.p} castShadow receiveShadow>
            <sphereGeometry args={[s.radius, 40, 40]} />
            <meshPhysicalMaterial
              color={s.color}
              roughness={0.28}
              clearcoat={0.8}
              clearcoatRoughness={0.2}
              metalness={0.1}
            />
          </mesh>
        );
      })}
      {bonds.map(([i, j, order], k) => {
        const from = atoms[i];
        const to = atoms[j];
        const pa = positions[i];
        const pb = positions[j];
        if (!from || !to || !pa || !pb) return null;
        if (!showHydrogens && (from.el === "H" || to.el === "H")) return null;
        return <Bond key={k} a={pa} b={pb} order={order} />;
      })}
      {/* Molecular plane indicator */}
      <mesh rotation={[0, 0, 0]} position={[0.4, -0.4, -0.02]}>
        <planeGeometry args={[9, 8]} />
        <meshBasicMaterial color="#7fe6ef" transparent opacity={0.045} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
