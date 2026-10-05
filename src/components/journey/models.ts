import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Procedural models for the power-journey hero. Everything is built from
// primitives so the scene ships with no external assets.

/** A box stretched between two points: used for lattice beams, poles and arms. */
export function beamGeometry(a: THREE.Vector3, b: THREE.Vector3, thickness: number) {
  const len = a.distanceTo(b);
  const g = new THREE.BoxGeometry(thickness, thickness, len);
  const m = new THREE.Matrix4().lookAt(a, b, new THREE.Vector3(0, 1, 0));
  m.setPosition(a.clone().add(b).multiplyScalar(0.5));
  g.applyMatrix4(m);
  return g;
}

// ---------- Grid ----------

/** Lattice transmission tower. Arms run along z; returns mesh and conductor attach points (local). */
export function createPylon(material: THREE.Material) {
  const parts: THREE.BufferGeometry[] = [];
  const levels = [0, 6, 12, 17, 21, 26];
  const half = (y: number) => THREE.MathUtils.lerp(3.2, 0.8, Math.min(y / 21, 1));
  const corner = (y: number, sx: number, sz: number) => new THREE.Vector3(sx * half(y), y, sz * half(y));
  const signs: [number, number][] = [[1, 1], [1, -1], [-1, -1], [-1, 1]];

  // legs
  for (const [sx, sz] of signs) {
    for (let i = 0; i < levels.length - 1; i++) {
      parts.push(beamGeometry(corner(levels[i], sx, sz), corner(levels[i + 1], sx, sz), 0.28));
    }
  }
  // rings and X-bracing on every face
  for (let i = 0; i < levels.length - 1; i++) {
    const y0 = levels[i];
    const y1 = levels[i + 1];
    for (let f = 0; f < 4; f++) {
      const [ax, az] = signs[f];
      const [bx, bz] = signs[(f + 1) % 4];
      parts.push(beamGeometry(corner(y1, ax, az), corner(y1, bx, bz), 0.16));
      parts.push(beamGeometry(corner(y0, ax, az), corner(y1, bx, bz), 0.1));
      parts.push(beamGeometry(corner(y0, bx, bz), corner(y1, ax, az), 0.1));
    }
  }
  // cross-arms (lower wide, upper narrow) with diagonal stays
  const arms = [
    { y: 21, span: 7.5 },
    { y: 26, span: 5 },
  ];
  const attach: THREE.Vector3[] = [];
  for (const { y, span } of arms) {
    parts.push(beamGeometry(new THREE.Vector3(0, y, -span), new THREE.Vector3(0, y, span), 0.3));
    for (const s of [-1, 1]) {
      parts.push(beamGeometry(new THREE.Vector3(0, y + 2.2, 0), new THREE.Vector3(0, y, s * span), 0.14));
      // insulator string
      const ins = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8);
      ins.translate(0, y - 0.7, s * span);
      parts.push(ins);
      attach.push(new THREE.Vector3(0, y - 1.4, s * span));
    }
  }
  // peak
  parts.push(beamGeometry(corner(26, 1, 1), new THREE.Vector3(0, 29, 0), 0.14));
  parts.push(beamGeometry(corner(26, -1, -1), new THREE.Vector3(0, 29, 0), 0.14));

  const mesh = new THREE.Mesh(mergeGeometries(parts), material);
  mesh.castShadow = true;
  return { mesh, attach };
}

/** Sagging conductor between two points. */
export function catenary(a: THREE.Vector3, b: THREE.Vector3, sag: number, samples = 24) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = a.clone().lerp(b, t);
    p.y -= sag * 4 * t * (1 - t);
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Wooden distribution pole with a pole-mounted transformer. Returns top attach points (world). */
export function createDistributionPole(wood: THREE.Material, metal: THREE.Material, at: THREE.Vector3) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 11, 12), wood);
  pole.position.y = 5.5;
  pole.castShadow = true;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 3.2), wood);
  arm.position.y = 10.4;
  const tx = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 16), metal);
  tx.position.set(0.7, 8.2, 0);
  tx.castShadow = true;
  g.add(pole, arm, tx);
  g.position.copy(at);
  const attach = [-1.4, 0, 1.4].map((z) => new THREE.Vector3(at.x, at.y + 10.6, at.z + z));
  const service = new THREE.Vector3(at.x + 0.7, at.y + 8.4, at.z);
  return { group: g, attach, service };
}

// ---------- Home ----------

export type House = {
  group: THREE.Group;
  frontWall: THREE.Mesh[];
  frontWindows: THREE.Mesh[];
  windows: THREE.Mesh[];
  roofFront: THREE.Mesh;
  roofPitch: number;
};

/** House shell spanning x -5..5, z -4..4, eaves at y 4, ridge at y 7. Front (z+) wall can fade for the fly-in. */
export function createHouse(mats: {
  wall: THREE.MeshStandardMaterial;
  floor: THREE.Material;
  roof: THREE.Material;
  window: THREE.MeshStandardMaterial;
  interior: THREE.Material;
}): House {
  const group = new THREE.Group();
  const add = (m: THREE.Mesh) => {
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    return add(m);
  };

  box(10.4, 0.3, 8.4, mats.floor, 0, -0.15, 0);
  box(10, 4, 0.2, mats.interior, 0, 2, -4); // back wall (interior face is what we film)
  box(0.2, 4, 8, mats.wall, -5, 2, 0);
  box(0.2, 4, 8, mats.wall, 5, 2, 0);

  // gable ends
  const gable = new THREE.Shape([new THREE.Vector2(-4.2, 0), new THREE.Vector2(4.2, 0), new THREE.Vector2(0, 3)]);
  for (const x of [-5, 5]) {
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 0.2, bevelEnabled: false }), mats.wall);
    m.rotation.y = Math.PI / 2;
    m.position.set(x - 0.1, 4, 0);
    add(m);
  }

  // front wall: separate transparent-capable material so it can dissolve
  const frontMat = mats.wall.clone();
  frontMat.transparent = true;
  const frontWall = [
    box(3.2, 4, 0.2, frontMat, -3.4, 2, 4),
    box(3.2, 4, 0.2, frontMat, 3.4, 2, 4),
    box(3.6, 1.4, 0.2, frontMat, 0, 3.3, 4),
    box(3.6, 0.9, 0.2, frontMat, 0, 0.45, 4),
  ];

  // windows (emissive panes that glow when the power comes on)
  const windows: THREE.Mesh[] = [];
  const pane = (w: number, h: number, pos: THREE.Vector3, rotY = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mats.window.clone());
    m.position.copy(pos);
    m.rotation.y = rotY;
    group.add(m);
    windows.push(m);
    return m;
  };
  const frontWindows = [
    pane(2.6, 1.6, new THREE.Vector3(-3.4, 2.2, 4.12)),
    pane(2.6, 1.6, new THREE.Vector3(3.4, 2.2, 4.12)),
  ];
  pane(2.4, 1.4, new THREE.Vector3(-5.12, 2.2, 1), -Math.PI / 2);
  pane(2.4, 1.4, new THREE.Vector3(5.12, 2.2, -1), Math.PI / 2);
  frontWindows.push(pane(3.4, 1.8, new THREE.Vector3(0, 1.8, 4.05))); // glass slider in the front opening
  for (const w of frontWindows) (w.material as THREE.MeshStandardMaterial).transparent = true;

  // roof
  const run = 4.6;
  const rise = 3;
  const slope = Math.hypot(run, rise);
  const roofPitch = Math.atan2(rise, run);
  const roofGeo = new THREE.BoxGeometry(11.2, 0.25, slope);
  const roofFront = add(new THREE.Mesh(roofGeo, mats.roof));
  roofFront.position.set(0, 4 + rise / 2, run / 2);
  roofFront.rotation.x = roofPitch;
  const roofBack = add(new THREE.Mesh(roofGeo, mats.roof));
  roofBack.position.set(0, 4 + rise / 2, -run / 2);
  roofBack.rotation.x = -roofPitch;

  return { group, frontWall, frontWindows, windows, roofFront, roofPitch };
}

/** Distribution board with breakers whose LEDs we can recolour. */
export function createDbBoard(metal: THREE.Material) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.16), metal);
  body.castShadow = true;
  g.add(body);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.04), new THREE.MeshStandardMaterial({ color: 0x9aa1ad, metalness: 0.8, roughness: 0.3 }));
  rail.position.set(0, 0.12, 0.09);
  g.add(rail);
  const leds: THREE.MeshStandardMaterial[] = [];
  const breakerMat = new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 0.5 });
  for (let i = 0; i < 8; i++) {
    const x = -0.42 + i * 0.12;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.1), i === 0 ? new THREE.MeshStandardMaterial({ color: 0xb4233a, roughness: 0.5 }) : breakerMat);
    b.position.set(x, 0.12, 0.13);
    g.add(b);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(0x7b45f5), emissiveIntensity: 0 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), ledMat);
    led.position.set(x, -0.12, 0.17);
    g.add(led);
    leds.push(ledMat);
  }
  // label strip
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.1), new THREE.MeshStandardMaterial({ color: 0xf5f7fb }));
  label.position.set(0, -0.32, 0.081);
  g.add(label);
  return { group: g, leds };
}

/** Ceiling fan: returns the rotor to spin. */
export function createFan(metal: THREE.Material, blade: THREE.Material) {
  const g = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), metal);
  rod.position.y = 0.25;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.18, 16), metal);
  const rotor = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.22), blade);
    b.position.x = 0.7;
    const arm = new THREE.Group();
    arm.add(b);
    arm.rotation.y = (i * Math.PI) / 2;
    b.rotation.x = 0.12;
    rotor.add(arm);
  }
  g.add(rod, hub, rotor);
  return { group: g, rotor };
}

// ---------- Solar ----------

let cellTexture: THREE.CanvasTexture | null = null;
function solarCellTexture() {
  if (cellTexture) return cellTexture;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 384;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0b1a3d";
  ctx.fillRect(0, 0, c.width, c.height);
  const cols = 6;
  const rows = 10;
  const cw = c.width / cols;
  const ch = c.height / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const grad = ctx.createLinearGradient(x * cw, y * ch, (x + 1) * cw, (y + 1) * ch);
      grad.addColorStop(0, "#1b3a8a");
      grad.addColorStop(1, "#0d2257");
      ctx.fillStyle = grad;
      ctx.fillRect(x * cw + 2, y * ch + 2, cw - 4, ch - 4);
      ctx.strokeStyle = "rgba(160,190,255,.25)";
      ctx.beginPath();
      ctx.moveTo(x * cw + cw / 2, y * ch + 2);
      ctx.lineTo(x * cw + cw / 2, (y + 1) * ch - 2);
      ctx.stroke();
    }
  }
  cellTexture = new THREE.CanvasTexture(c);
  cellTexture.colorSpace = THREE.SRGBColorSpace;
  cellTexture.anisotropy = 8;
  return cellTexture;
}

export function createSolarPanel(frame: THREE.Material) {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    map: solarCellTexture(),
    roughness: 0.18,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 2.6), [frame, frame, glass, frame, frame, frame]);
  panel.castShadow = true;
  g.add(panel);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.08, 2.66), frame);
  rim.position.y = -0.02;
  g.add(rim);
  return g;
}

export function createInverter() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.82, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xe6e9ef, roughness: 0.35, metalness: 0.1 }),
  );
  body.castShadow = true;
  g.add(body);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x050805, emissive: new THREE.Color(0x8ccf3f), emissiveIntensity: 0 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.14), screenMat);
  screen.position.set(0, 0.18, 0.111);
  g.add(screen);
  const fins = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: 0x9aa1ad }));
  fins.position.set(0, -0.28, 0.115);
  g.add(fins);
  return { group: g, screenMat };
}

export function createBattery() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 1.3, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.4, metalness: 0.4 }),
  );
  body.castShadow = true;
  g.add(body);
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x050805, emissive: new THREE.Color(0x8ccf3f), emissiveIntensity: 0 });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.9), ledMat);
  strip.position.set(0.24, 0, 0.131);
  g.add(strip);
  return { group: g, ledMat };
}
