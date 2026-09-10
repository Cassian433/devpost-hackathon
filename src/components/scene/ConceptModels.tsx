import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* ---------------- Computer science: binary search tree ---------------- */

type TreeNode = { value: number; position: [number, number, number]; children?: TreeNode[] };

const BST: TreeNode = {
  value: 50,
  position: [0, 2.6, 0],
  children: [
    {
      value: 25,
      position: [-2.4, 0.9, 0],
      children: [
        { value: 12, position: [-3.6, -0.8, 0] },
        { value: 37, position: [-1.2, -0.8, 0] },
      ],
    },
    {
      value: 75,
      position: [2.4, 0.9, 0],
      children: [
        { value: 62, position: [1.2, -0.8, 0] },
        {
          value: 88,
          position: [3.6, -0.8, 0],
          children: [{ value: 95, position: [4.6, -2.4, 0] }],
        },
      ],
    },
  ],
};

function Edge({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return {
      position: new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5),
      quaternion: q,
      length: dir.length(),
    };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.045, 0.045, length, 8]} />
      <meshStandardMaterial color="#7e8b9c" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

function TreeBranch({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <group>
      <mesh position={node.position} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color={depth === 0 ? "#4fd0e0" : node.children ? "#5f8cc4" : "#e0b155"}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      {node.children?.map((child) => (
        <group key={child.value}>
          <Edge from={node.position} to={child.position} />
          <TreeBranch node={child} depth={depth + 1} />
        </group>
      ))}
    </group>
  );
}

export function BinaryTreeModel() {
  return (
    <group position={[0, -0.4, 0]}>
      <TreeBranch node={BST} />
    </group>
  );
}

/* ---------------- Biology: DNA double helix ---------------- */

export function DnaModel({ unwind = false }: { unwind?: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.18;
  });

  const rungs = useMemo(() => {
    const items: { y: number; angle: number }[] = [];
    for (let i = 0; i < 26; i++) items.push({ y: i * 0.42 - 5.4, angle: i * 0.52 });
    return items;
  }, []);

  const radius = unwind ? 1.05 : 1.4;

  return (
    <group ref={group}>
      {rungs.map(({ y, angle }, i) => {
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;
        const pairColor = i % 2 === 0 ? "#4fd0e0" : "#e0b155";
        return (
          <group key={y}>
            <mesh position={[x1, y, z1]} castShadow>
              <sphereGeometry args={[0.2, 20, 20]} />
              <meshStandardMaterial color="#6f92c8" roughness={0.4} />
            </mesh>
            <mesh position={[x2, y, z2]} castShadow>
              <sphereGeometry args={[0.2, 20, 20]} />
              <meshStandardMaterial color="#6f92c8" roughness={0.4} />
            </mesh>
            <Edge from={[x1, y, z1]} to={[x2, y, z2]} />
            <mesh position={[(x1 + x2) / 2, y, (z1 + z2) / 2]}>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial
                color={pairColor}
                emissive={pairColor}
                emissiveIntensity={0.35}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ---------------- Physics: two-source wave interference ---------------- */

export function WaveModel({ twoSources = true }: { twoSources?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(11, 11, 96, 96), []);
  const base = useMemo(() => Float32Array.from(geometry.attributes["position"]!.array), [geometry]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const attr = geometry.attributes["position"] as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i]!;
      const y = base[i + 1]!;
      const d1 = Math.hypot(x + 2.4, y);
      const d2 = Math.hypot(x - 2.4, y);
      const w1 = Math.sin(d1 * 2.1 - t * 2.6) / (1 + d1 * 0.35);
      const w2 = twoSources ? Math.sin(d2 * 2.1 - t * 2.6) / (1 + d2 * 0.35) : 0;
      arr[i + 2] = (w1 + w2) * 0.75;
    }
    attr.needsUpdate = true;
    geometry.computeVertexNormals();
    if (mesh.current) mesh.current.rotation.z = 0;
  });

  return (
    <group rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -0.6, 0]}>
      <mesh ref={mesh} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#3f7fb8"
          metalness={0.35}
          roughness={0.3}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-2.4, 0, 0.6]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#4fd0e0" emissive="#4fd0e0" emissiveIntensity={1.2} />
      </mesh>
      {twoSources ? (
        <mesh position={[2.4, 0, 0.6]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#e0b155" emissive="#e0b155" emissiveIntensity={1.2} />
        </mesh>
      ) : null}
    </group>
  );
}

/* ---------------- Chemistry: sodium chloride lattice ---------------- */

export function LatticeModel({ showBonds = true }: { showBonds?: boolean }) {
  const cells = useMemo(() => {
    const items: { key: string; position: [number, number, number]; sodium: boolean }[] = [];
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        for (let z = 0; z < 4; z++)
          items.push({
            key: `${x}-${y}-${z}`,
            position: [(x - 1.5) * 1.5, (y - 1.5) * 1.5, (z - 1.5) * 1.5],
            sodium: (x + y + z) % 2 === 0,
          });
    return items;
  }, []);

  return (
    <group>
      {cells.map((c) => (
        <mesh key={c.key} position={c.position} castShadow>
          <sphereGeometry args={[c.sodium ? 0.34 : 0.5, 24, 24]} />
          <meshStandardMaterial
            color={c.sodium ? "#e0b155" : "#4fd0e0"}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      ))}
      {showBonds
        ? cells.flatMap((c) => {
            const [x, y, z] = c.position;
            const neighbours: [number, number, number][] = [
              [x + 1.5, y, z],
              [x, y + 1.5, z],
              [x, y, z + 1.5],
            ];
            return neighbours
              .filter((n) => n[0] <= 2.3 && n[1] <= 2.3 && n[2] <= 2.3)
              .map((n, i) => <Edge key={`${c.key}-${i}`} from={c.position} to={n} />);
          })
        : null}
    </group>
  );
}
