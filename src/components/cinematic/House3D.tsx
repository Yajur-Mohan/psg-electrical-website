"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { createHouse, createSolarPanel } from "@/components/journey/models";

export type HouseCircuits = { lit: boolean; power: boolean; security: boolean; solar: boolean };

const TARGET = new THREE.Vector3(0, 3.2, 0);

/**
 * The house from the hero scene, wired to the demo's breakers: lighting fills the
 * windows, power lights the wifi, security switches on the floodlight and solar
 * energises the roof panels. Everything eases between states rather than snapping.
 */
function Home({ circuits }: { circuits: HouseCircuits }) {
  const [m] = useState(() => {
    const wall = new THREE.MeshStandardMaterial({ color: 0xd9d4cc, roughness: 0.85 });
    const interior = new THREE.MeshStandardMaterial({ color: 0xa9a29a, roughness: 0.92 });
    const floor = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.55, metalness: 0.05 });
    const roof = new THREE.MeshStandardMaterial({ color: 0x2b2e35, roughness: 0.7, metalness: 0.2 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x0c1320, emissive: new THREE.Color(0xffc56b), emissiveIntensity: 0, roughness: 0.08, metalness: 0.7 });
    const house = createHouse({ wall, floor, roof, window: glass, interior });

    // Two rows of three panels on the front pitch, placed the same way as the hero scene
    const frame = new THREE.MeshStandardMaterial({ color: 0xbfc5cf, metalness: 0.9, roughness: 0.3, emissive: new THREE.Color(0x8ccf3f), emissiveIntensity: 0 });
    const upSlope = new THREE.Vector3(0, Math.sin(house.roofPitch), -Math.cos(house.roofPitch));
    const roofNormal = new THREE.Vector3(0, Math.cos(house.roofPitch), Math.sin(house.roofPitch));
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const panel = createSolarPanel(frame);
        panel.position.set(-2.2 + col * 2.2, 4.0, 4.6).addScaledVector(upSlope, 1.45 + row * 2.7).addScaledVector(roofNormal, 0.2);
        panel.rotation.x = house.roofPitch;
        house.group.add(panel);
      }
    }

    const wifi = new THREE.MeshStandardMaterial({ color: 0x1b2440, emissive: new THREE.Color(0x5b8cff), emissiveIntensity: 0 });
    const flood = new THREE.MeshStandardMaterial({ color: 0x3b3f48, emissive: new THREE.Color(0xea357a), emissiveIntensity: 0 });
    const beam = new THREE.MeshBasicMaterial({ color: 0xea357a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    return { house, windows: house.windows.map((w) => w.material as THREE.MeshStandardMaterial), frame, wifi, flood, beam };
  });

  // Materials are mutated every frame, so they live behind a ref
  const mats = useRef(m);
  const room = useRef<THREE.PointLight>(null);
  const floodLight = useRef<THREE.PointLight>(null);
  const sun = useRef<THREE.PointLight>(null);

  useFrame((_, dt) => {
    const ease = (from: number, to: number) => THREE.MathUtils.damp(from, to, 6, dt);
    const { windows, wifi, flood, beam, frame } = mats.current;
    for (const w of windows) w.emissiveIntensity = ease(w.emissiveIntensity, circuits.lit ? 1.4 : 0);
    if (room.current) room.current.intensity = ease(room.current.intensity, circuits.lit ? 14 : 0);
    wifi.emissiveIntensity = ease(wifi.emissiveIntensity, circuits.power ? 3 : 0);
    flood.emissiveIntensity = ease(flood.emissiveIntensity, circuits.security ? 4 : 0);
    beam.opacity = ease(beam.opacity, circuits.security ? 0.16 : 0);
    if (floodLight.current) floodLight.current.intensity = ease(floodLight.current.intensity, circuits.security ? 12 : 0);
    frame.emissiveIntensity = ease(frame.emissiveIntensity, circuits.solar ? 0.9 : 0);
    if (sun.current) sun.current.intensity = ease(sun.current.intensity, circuits.solar ? 10 : 0);
  });

  return (
    <group>
      <primitive object={m.house.group} />
      <pointLight ref={room} position={[0, 2.6, 0.5]} color="#ffc56b" intensity={0} distance={14} />

      {/* Wifi over the front opening, on the power circuit */}
      <group position={[0, 3.35, 4.16]}>
        {[0.32, 0.56].map((r) => (
          <mesh key={r} material={m.wifi} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[r, 0.05, 8, 24, Math.PI / 2]} />
          </mesh>
        ))}
        <mesh material={m.wifi} position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
        </mesh>
      </group>

      {/* Security floodlight on the front corner, with a soft cone */}
      <group position={[4.7, 3.7, 4.3]}>
        <mesh material={m.flood}>
          <boxGeometry args={[0.45, 0.25, 0.3]} />
        </mesh>
        <mesh material={m.beam} position={[0.6, -1.8, 0.9]} rotation={[0.45, 0, 0.3]}>
          <coneGeometry args={[1.4, 3.6, 24, 1, true]} />
        </mesh>
        <pointLight ref={floodLight} color="#ea357a" intensity={0} distance={9} position={[0, -0.4, 0.8]} />
      </group>

      <pointLight ref={sun} color="#8ccf3f" intensity={0} distance={10} position={[0, 9, 6]} />
    </group>
  );
}

/** Camera drifts slowly around the house; holds still under reduced motion. */
function Orbit({ still }: { still: boolean }) {
  useFrame((state) => {
    const t = still ? 0 : state.clock.elapsedTime;
    const angle = 0.55 + Math.sin(t * 0.25) * 0.45;
    state.camera.position.set(Math.sin(angle) * 23, 9 + Math.sin(t * 0.18) * 0.8, Math.cos(angle) * 23);
    state.camera.lookAt(TARGET);
  });
  return null;
}

export default function House3D({ circuits, still }: { circuits: HouseCircuits; still: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Only render frames while the demo is on screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="size-full">
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, 1.5]} camera={{ position: [10, 8.5, 17], fov: 34 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[-8, 12, 10]} intensity={0.9} color="#9db4ff" />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={1.5} position={[0, 6, 8]} scale={[10, 3, 1]} color="#dfe6ff" />
          <Lightformer form="rect" intensity={1} position={[-8, 3, -2]} scale={[4, 4, 1]} color="#5b8cff" />
        </Environment>
        <Home circuits={circuits} />
        <ContactShadows position={[0, -0.3, 0]} opacity={0.6} scale={22} blur={2.6} far={8} color="#000" />
        <Orbit still={still} />
      </Canvas>
    </div>
  );
}
