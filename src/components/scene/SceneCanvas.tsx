import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import type * as THREE from "three";

import { CathedralModel } from "./CathedralModel";
import { BinaryTreeModel, DnaModel, LatticeModel, WaveModel } from "./ConceptModels";
import { HeartModel } from "./HeartModel";
import { Hotspot3D } from "./Hotspot3D";
import { MoleculeModel } from "./MoleculeModel";
import { GearboxModel, SolarSystemModel, TectonicModel } from "./ScienceModels";
import type { SceneModule } from "@/lib/scenes";

export type Viewpoint = {
  position: [number, number, number];
  distance: number;
  azimuth: number;
  polar: number;
};

function ViewpointTracker({ onChange }: { onChange: (v: Viewpoint) => void }) {
  const camera = useThree((s) => s.camera);
  const last = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const p = camera.position;
      const distance = p.length();
      const azimuth = Math.atan2(p.x, p.z);
      const polar = Math.acos(Math.min(1, Math.max(-1, p.y / (distance || 1))));
      const stamp = Math.round(distance * 10) + Math.round(azimuth * 20) * 1000;
      if (stamp === last.current) return;
      last.current = stamp;
      onChange({
        position: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)],
        distance: +distance.toFixed(2),
        azimuth,
        polar,
      });
    }, 320);
    return () => clearInterval(id);
  }, [camera, onChange]);

  return null;
}

function SceneBody({ scene, options }: { scene: SceneModule; options: Record<string, boolean> }) {
  if (scene.id === "cardiac") return <HeartModel pulse={options["pulse"] ?? true} />;
  if (scene.id === "caffeine") return <MoleculeModel showHydrogens={options["hydrogens"] ?? true} />;
  if (scene.id === "cathedral") return <CathedralModel showVault={options["vault"] ?? true} />;
  if (scene.id === "solar-system") return <SolarSystemModel />;
  if (scene.id === "tectonics") return <TectonicModel />;
  if (scene.id === "binary-tree") return <BinaryTreeModel />;
  if (scene.id === "dna") return <DnaModel unwind={options["unwind"] ?? false} />;
  if (scene.id === "wave-interference") return <WaveModel twoSources={options["twoSources"] ?? true} />;
  if (scene.id === "lattice") return <LatticeModel showBonds={options["bonds"] ?? true} />;
  return <GearboxModel />;
}

type Props = {
  scene: SceneModule;
  activeHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  onViewpoint: (v: Viewpoint) => void;
  options: Record<string, boolean>;
  autoRotate: boolean;
};

export function SceneCanvas({ scene, activeHotspot, onSelectHotspot, onViewpoint, options, autoRotate }: Props) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: scene.camera.position, fov: 45 }}
      gl={{ antialias: true }}
      onPointerMissed={() => onSelectHotspot("")}
    >
      <color attach="background" args={["#17191d"]} />
      <fog attach="fog" args={["#17191d", 26, 70]} />

      <hemisphereLight args={["#bcd7ff", "#2a2f3d", 0.55]} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-9, 5, -6]} intensity={0.6} color="#8fd8ff" />
      <pointLight position={[0, 3, 6]} intensity={18} distance={22} color="#ffd8a8" />

      <Suspense fallback={null}>
        <Environment resolution={128}>
          <Lightformer intensity={2.4} position={[0, 6, 0]} scale={[12, 12, 1]} />
          <Lightformer intensity={1.1} color="#8fc4ff" position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
          <Lightformer intensity={0.9} color="#ffc07a" position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
        </Environment>

        <SceneBody scene={scene} options={options} />

        {scene.hotspots.map((h, i) => (
          <Hotspot3D
            key={h.id}
            hotspot={h}
            index={i}
            active={activeHotspot === h.id}
            onSelect={onSelectHotspot}
          />
        ))}
      </Suspense>

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={2.5}
        maxDistance={30}
        target={scene.camera.target}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
      />
      <ViewpointTracker onChange={onViewpoint} />
    </Canvas>
  );
}
