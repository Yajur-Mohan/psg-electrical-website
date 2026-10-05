"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Html, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { getProject, types, type ISheetObject } from "@theatre/core";
import { createBattery, createInverter, createSolarPanel } from "@/components/journey/models";
import { buildTheatreState } from "@/lib/theatre-state";

// Exploded view of a Trite Solar kit (MASTER-IMPLEMENTATION §3.6), built with
// React Three Fiber + drei. The camera follows a Theatre.js sequence whose
// position is driven by scroll progress.

const SEQ_LENGTH = 10;

// Camera path authored as Theatre keyframes (seconds on a 10s sequence).
const theatreState = buildTheatreState("Exploded", "Camera", SEQ_LENGTH, {
  px: [{ at: 0, value: 5.5 }, { at: 4, value: 3.2 }, { at: 7, value: -3.5 }, { at: 10, value: -5.5 }],
  py: [{ at: 0, value: 2.6 }, { at: 4, value: 3.8 }, { at: 7, value: 3.2 }, { at: 10, value: 4 }],
  pz: [{ at: 0, value: 6.5 }, { at: 4, value: 9.5 }, { at: 7, value: 9 }, { at: 10, value: 7.5 }],
  ty: [{ at: 0, value: 1.2 }, { at: 4, value: 2.0 }, { at: 10, value: 1.8 }],
  fov: [{ at: 0, value: 35 }, { at: 5, value: 42 }, { at: 10, value: 38 }],
});

type CamProps = { px: number; py: number; pz: number; tx: number; ty: number; tz: number; fov: number };

function useTheatreCamera() {
  return useMemo(() => {
    const project = getProject("PSG Trite Solar", { state: theatreState });
    const sheet = project.sheet("Exploded");
    const obj = sheet.object("Camera", {
      px: 5.5,
      py: 2.2,
      pz: 6.5,
      tx: types.number(0, { nudgeMultiplier: 0.05 }),
      ty: 1,
      tz: 0,
      fov: types.number(35, { range: [15, 80] }),
    });
    return { project, sheet, obj: obj as unknown as ISheetObject<CamProps> };
  }, []);
}

const PARTS = [
  { key: "panel", label: "Tier-1 solar panel", spec: "Monocrystalline, ~550 W", explode: [0, 1.7, -0.6] },
  { key: "rail", label: "Mounting rails", spec: "Anodised aluminium", explode: [0, 0.7, -0.3] },
  { key: "isolator", label: "DC isolator", spec: "Safe shutdown for maintenance", explode: [-1.8, 0.4, 0.6] },
  { key: "inverter", label: "Hybrid inverter", spec: "5 kW, solar + battery + grid", explode: [0.2, 0, 1.4] },
  { key: "battery", label: "Lithium battery", spec: "LiFePO4, 5 kWh, 6000 cycles", explode: [1.9, -0.2, 0.4] },
] as const;

type PartDef = (typeof PARTS)[number];

/** One component of the kit: slides out along its explode vector as progress grows. */
function Part({
  part,
  baseY,
  progress,
  labelAt = [0, 0.75, 0],
  children,
}: {
  part: PartDef;
  baseY: number;
  progress: React.RefObject<number>;
  labelAt?: [number, number, number];
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const label = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const explode = THREE.MathUtils.smoothstep(progress.current ?? 0, 0.12, 0.7);
    const [x, y, z] = part.explode;
    group.current?.position.set(x * explode, baseY + y * explode, z * explode);
    if (label.current) label.current.style.opacity = String(THREE.MathUtils.smoothstep(explode, 0.55, 0.9));
  });
  return (
    <group ref={group} position={[0, baseY, 0]}>
      {children}
      <Html center distanceFactor={7} zIndexRange={[10, 0]} position={labelAt}>
        <div
          ref={label}
          aria-hidden="true"
          className="pointer-events-none w-max rounded-lg border border-white/15 bg-[#0b0d12]/80 px-3 py-1.5 text-center opacity-0 backdrop-blur"
        >
          <p className="text-xs font-black text-white">{part.label}</p>
          <p className="text-[10px] text-trite">{part.spec}</p>
        </div>
      </Html>
    </group>
  );
}

function Kit({ progress, obj }: { progress: React.RefObject<number>; obj: ISheetObject<CamProps> }) {
  const [objects] = useState(() => {
    const frame = new THREE.MeshStandardMaterial({ color: 0xbfc5cf, metalness: 0.9, roughness: 0.3 });
    return { panel: createSolarPanel(frame), inverter: createInverter(), battery: createBattery() };
  });
  // Materials are mutated every frame, so they live behind refs
  const screen = useRef(objects.inverter.screenMat);
  const leds = useRef(objects.battery.ledMat);
  const target = useRef(new THREE.Vector3());

  useFrame((state) => {
    const explode = THREE.MathUtils.smoothstep(progress.current ?? 0, 0.12, 0.7);
    screen.current.emissiveIntensity = 0.4 + explode * 2.2;
    leds.current.emissiveIntensity = explode * 3;

    // Camera follows the Theatre.js sequence
    const v = obj.value;
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.set(v.px, v.py, v.pz);
    cam.lookAt(target.current.set(v.tx, v.ty, v.tz));
    if (cam.fov !== v.fov) {
      cam.fov = v.fov;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <>
      <Part part={PARTS[0]} baseY={1.75} progress={progress} labelAt={[-1.4, 0.5, 0]}>
        <primitive object={objects.panel} rotation={[0.25, 0, 0]} scale={0.8} />
      </Part>
      <Part part={PARTS[1]} baseY={1.55} progress={progress}>
        {[-0.6, 0.6].map((z) => (
          <mesh key={z} position={[0, 0, z]} castShadow>
            <boxGeometry args={[1.9, 0.06, 0.08]} />
            <meshStandardMaterial color="#a9b0bb" metalness={0.9} roughness={0.35} />
          </mesh>
        ))}
      </Part>
      <Part part={PARTS[2]} baseY={1.15} progress={progress}>
        <RoundedBox args={[0.32, 0.4, 0.16]} radius={0.03} castShadow>
          <meshStandardMaterial color="#e4e6ea" roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[0.1, 0.18, 0.04]} />
          <meshStandardMaterial color="#d63a2f" roughness={0.5} />
        </mesh>
      </Part>
      <Part part={PARTS[3]} baseY={0.95} progress={progress}>
        <primitive object={objects.inverter.group} />
      </Part>
      <Part part={PARTS[4]} baseY={0.65} progress={progress}>
        <primitive object={objects.battery.group} />
      </Part>
    </>
  );
}

export default function ExplodedKit({ progress }: { progress: React.RefObject<number> }) {
  const { project, sheet, obj } = useTheatreCamera();

  // Drive the Theatre sequence from scroll; Studio can be opened in dev with ?studio
  useEffect(() => {
    let raf = 0;
    project.ready.then(() => {
      const tick = () => {
        sheet.sequence.position = (progress.current ?? 0) * SEQ_LENGTH;
        raf = requestAnimationFrame(tick);
      };
      tick();
    });
    if (process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("studio")) {
      import("@theatre/studio").then(({ default: studio }) => studio.initialize());
    }
    return () => cancelAnimationFrame(raf);
  }, [project, sheet, progress]);

  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [5.5, 2.2, 6.5], fov: 35 }} gl={{ antialias: true }}>
      <color attach="background" args={["#0f140f"]} />
      <fog attach="fog" args={["#0f140f", 9, 22]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 3]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} color="#ffe2b0" />
      <pointLight position={[-3, 2, 2]} intensity={6} color="#8ccf3f" distance={8} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[6, 2, 1]} color="#fff3dd" />
        <Lightformer form="rect" intensity={1.5} position={[-5, 2, -2]} scale={[3, 4, 1]} color="#8ccf3f" />
        <Lightformer form="ring" intensity={2} position={[4, 3, -3]} scale={2} color="#f5b335" />
      </Environment>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
        <Kit progress={progress} obj={obj} />
      </Float>
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={10} blur={2.4} far={4} color="#000" />
    </Canvas>
  );
}
