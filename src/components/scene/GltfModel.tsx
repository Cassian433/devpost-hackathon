import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  /** Path under /public, e.g. "/models/heart/heart.gltf" */
  url: string;
  /** Longest side of the model after normalisation, in scene units. */
  fit?: number;
  /** Extra rotation applied after normalisation, radians [x, y, z]. */
  rotation?: [number, number, number];
  /** Gentle heartbeat-style scale pulse. */
  pulse?: boolean;
};

/**
 * Loads a glTF/GLB, centres it on the origin and scales its longest side to `fit`.
 * Any module can swap its procedural shapes for a real model by rendering this
 * and re-placing its hotspots on the normalised geometry.
 */
export function GltfModel({ url, fit = 5, rotation = [0, 0, 0], pulse = false }: Props) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  const { object, scale, offset } = useMemo(() => {
    const object = scene.clone(true);
    object.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = fit / Math.max(size.x, size.y, size.z);
    return { object, scale, offset: center.multiplyScalar(-1) };
  }, [scene, fit]);

  useFrame((state) => {
    if (!group.current) return;
    if (!pulse) {
      group.current.scale.setScalar(1);
      return;
    }
    const t = state.clock.elapsedTime * 1.35;
    const beat =
      Math.pow(Math.max(0, Math.sin(t)), 6) * 0.04 +
      Math.pow(Math.max(0, Math.sin(t - 0.5)), 8) * 0.025;
    group.current.scale.setScalar(1 + beat);
  });

  return (
    <group ref={group}>
      <group rotation={rotation}>
        <group scale={scale}>
          <primitive object={object} position={offset} />
        </group>
      </group>
    </group>
  );
}
