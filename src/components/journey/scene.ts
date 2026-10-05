import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  catenary,
  createBattery,
  createDbBoard,
  createDistributionPole,
  createFan,
  createHouse,
  createInverter,
  createPylon,
  createSolarPanel,
} from "./models";

// Scroll-driven "power journey": grid → street → home → DB board → solar → lights on.
// Everything is a pure function of progress p (0..1) so scrubbing backwards just works.

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** 0 → 1 between a..b, holds, then 1 → 0 between c..d */
const band = (a: number, b: number, c: number, d: number, x: number) => smooth(a, b, x) * (1 - smooth(c, d, x));

// Camera route: [progress, position, look-at target]
const KEYS: [number, [number, number, number], [number, number, number]][] = [
  [0.0, [-260, 34, 40], [-170, 16, -30]],
  [0.12, [-190, 22, 6], [-120, 18, -30]],
  [0.24, [-110, 14, 2], [-55, 16, -30]],
  [0.34, [-50, 10, 24], [-14, 7, 8]],
  [0.44, [-8, 5, 22], [0, 2.5, 0]],
  [0.52, [0, 2.2, 7], [-1.5, 1.7, -3.9]],
  [0.6, [-1.2, 1.8, -0.5], [-1.5, 1.65, -3.9]],
  [0.65, [0, 2.6, 8.5], [0, 4, 0]],
  [0.72, [10, 13, 18], [0, 5, 1.5]],
  [0.77, [1, 2.2, 8.5], [0.4, 1.5, -3.9]],
  [0.82, [0.5, 1.8, 0.9], [0.4, 1.35, -3.9]],
  [0.9, [-3, 1.8, 3], [0.4, 3.2, 0]],
  [1.0, [22, 12, 32], [0, 3, 0]],
];

export type Journey = {
  setProgress: (p: number) => void;
  setPaused: (paused: boolean) => void;
  renderStill: (p: number) => void;
  resize: () => void;
  dispose: () => void;
};

function pulseMaterial(color: THREE.ColorRepresentation, repeat: number, speed: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uRepeat: { value: repeat },
      uSpeed: { value: speed },
      uIntensity: { value: 1 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uColor; uniform float uRepeat; uniform float uSpeed; uniform float uIntensity;
      varying vec2 vUv;
      void main(){
        float d = fract(vUv.x * uRepeat - uTime * uSpeed);
        float pulse = smoothstep(0.0, 0.12, d) * smoothstep(0.4, 0.12, d);
        float a = pulse * uIntensity;
        gl_FragColor = vec4(uColor * a * 2.2, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uPurple: { value: 0 },
      uNight: { value: 0 },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uPurple; uniform float uNight; varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y, -0.1, 1.0);
        vec3 duskTop = vec3(0.07, 0.11, 0.26), duskHz = vec3(0.98, 0.52, 0.27);
        vec3 purpTop = vec3(0.06, 0.03, 0.15), purpHz = vec3(0.46, 0.2, 0.78);
        vec3 nightTop = vec3(0.01, 0.015, 0.05), nightHz = vec3(0.22, 0.12, 0.42);
        vec3 top = mix(mix(duskTop, purpTop, uPurple), nightTop, uNight);
        vec3 hz = mix(mix(duskHz, purpHz, uPurple), nightHz, uNight);
        vec3 col = mix(hz, top, pow(smoothstep(-0.02, 0.6, h), 0.7));
        // low sun glow towards -x (the grid side)
        float sun = pow(max(dot(normalize(vDir), normalize(vec3(-1.0, 0.06, -0.3))), 0.0), 64.0);
        col += vec3(1.0, 0.65, 0.35) * sun * (1.0 - uNight) * (1.0 - uPurple * 0.7) * 2.0;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

export function createJourney(canvas: HTMLCanvasElement, opts: { mobile: boolean }): Journey {
  const { mobile } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1500);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  // ---------- atmosphere ----------
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), skyMaterial());
  scene.add(sky);
  const fog = new THREE.FogExp2(0x8a5a4a, 0.0019);
  scene.fog = fog;

  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const v = new THREE.Vector3().randomDirection();
    v.y = Math.abs(v.y) * 0.9 + 0.1;
    v.normalize().multiplyScalar(850);
    starPos.set([v.x, v.y, v.z], i * 3);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false });
  scene.add(new THREE.Points(starGeo, starMat));

  const hemi = new THREE.HemisphereLight(0xffc49a, 0x1a1d24, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb27a, 2.4);
  sun.position.set(-60, 30, 20);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = !mobile;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 200 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  // cool moonlight so the panels still read against the roof at night
  const moon = new THREE.DirectionalLight(0x9db4ff, 0);
  moon.position.set(30, 40, 50);
  scene.add(moon);

  // ---------- materials ----------
  const steel = new THREE.MeshStandardMaterial({ color: 0x8a9099, metalness: 0.85, roughness: 0.45 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 0.9 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.6, metalness: 0.2 });
  const grass = new THREE.MeshStandardMaterial({ color: 0x1d2a17, roughness: 1 });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.95 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9d4cc, roughness: 0.85 });
  const interior = new THREE.MeshStandardMaterial({ color: 0xa9a29a, roughness: 0.92 });
  const floor = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.55, metalness: 0.05 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x2b2e35, roughness: 0.7, metalness: 0.2 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x0c1320, emissive: new THREE.Color(0xffc56b), emissiveIntensity: 0, roughness: 0.08, metalness: 0.7 });
  const panelFrame = new THREE.MeshStandardMaterial({ color: 0xbfc5cf, metalness: 0.9, roughness: 0.3 });

  // ---------- ground ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), grass);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(400, 7), asphalt);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, 12);
  road.receiveShadow = true;
  scene.add(road);

  // trees
  const treeGeo = new THREE.ConeGeometry(1.6, 6, 7);
  treeGeo.translate(0, 3, 0);
  const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ color: 0x14241a, roughness: 1 }), 70);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 70; i++) {
    const x = THREE.MathUtils.randFloat(-280, 60);
    const z = THREE.MathUtils.randFloat(-90, -40) * (Math.random() < 0.5 ? 1 : -0.6);
    const s = THREE.MathUtils.randFloat(0.7, 1.5);
    m4.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    trees.setMatrixAt(i, m4);
  }
  trees.castShadow = true;
  scene.add(trees);

  // ---------- grid: pylons and conductors ----------
  const gridPulses: THREE.ShaderMaterial[] = [];
  const addLine = (curve: THREE.Curve<THREE.Vector3>, radius: number, pulseColor: number, repeat: number) => {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 5), cableMat);
    scene.add(tube);
    const pm = pulseMaterial(pulseColor, repeat, 0.6);
    gridPulses.push(pm);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, radius * 1.45, 5), pm));
  };

  const pylonXs = [-330, -270, -210, -150, -90];
  const pylonZ = -30;
  const pylonAttach: THREE.Vector3[][] = [];
  for (const x of pylonXs) {
    const { mesh, attach } = createPylon(steel);
    mesh.position.set(x, 0, pylonZ);
    scene.add(mesh);
    pylonAttach.push(attach.map((a) => a.clone().add(mesh.position)));
  }
  for (let i = 0; i < pylonAttach.length - 1; i++) {
    pylonAttach[i].forEach((a, j) => addLine(catenary(a, pylonAttach[i + 1][j], 3.2), 0.07, 0x7fb2ff, 4));
  }

  // distribution pole + transformer by the house, fed from the last pylon
  const pole = createDistributionPole(wood, steel, new THREE.Vector3(-14, 0, 9));
  scene.add(pole.group);
  pole.attach.forEach((a, j) => addLine(catenary(pylonAttach[pylonAttach.length - 1][j], a, 5), 0.06, 0xa07bff, 5));

  // ---------- home ----------
  const house = createHouse({ wall: wallMat, floor, roof, window: windowMat, interior });
  scene.add(house.group);
  const houseFeed = new THREE.Vector3(-5.1, 3.6, 1.5);
  addLine(catenary(pole.service, houseFeed, 0.8, 16), 0.04, 0xd736e8, 2);

  // neighbours for scale
  for (const [x, z, s] of [[24, -10, 1], [-34, -6, 0.9], [36, 22, 1.1], [-40, 28, 0.85]] as const) {
    const n = createHouse({ wall: wallMat, floor, roof, window: windowMat, interior });
    n.group.position.set(x, 0, z);
    n.group.scale.setScalar(s);
    n.group.rotation.y = x > 0 ? -0.4 : 0.5;
    scene.add(n.group);
    house.windows.push(...n.windows);
  }

  // interior: DB board, ceiling fan, lights
  const db = createDbBoard(new THREE.MeshStandardMaterial({ color: 0xc9ced8, metalness: 0.25, roughness: 0.55 }));
  db.group.position.set(-1.5, 1.7, -3.8);
  scene.add(db.group);
  const dbGlow = new THREE.PointLight(0x8a55ff, 0, 9, 1.4);
  dbGlow.position.set(-1.2, 2.4, -1.2);
  scene.add(dbGlow);

  const fan = createFan(steel, new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.6 }));
  fan.group.position.set(0.6, 3.4, 0.4);
  scene.add(fan.group);

  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffd9a0), emissiveIntensity: 0 });
  const roomLights: THREE.PointLight[] = [];
  for (const pos of [new THREE.Vector3(-3, 3.6, 0.5), new THREE.Vector3(3.2, 3.6, -0.5)]) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), bulbMat);
    bulb.position.copy(pos);
    scene.add(bulb);
    const l = new THREE.PointLight(0xffc98a, 0, 14, 1.5);
    l.position.copy(pos).add(new THREE.Vector3(0, -0.2, 0));
    l.castShadow = !mobile && roomLights.length === 0;
    scene.add(l);
    roomLights.push(l);
  }

  // ---------- solar install ----------
  const panelSlots: { group: THREE.Group; rest: THREE.Vector3 }[] = [];
  const upSlope = new THREE.Vector3(0, Math.sin(house.roofPitch), -Math.cos(house.roofPitch));
  const roofNormal = new THREE.Vector3(0, Math.cos(house.roofPitch), Math.sin(house.roofPitch));
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const panel = createSolarPanel(panelFrame);
      // from the front eave, up the slope, then lifted clear of the roof sheeting on its normal
      const eave = new THREE.Vector3(-2.2 + col * 2.2, 4.0, 4.6);
      const rest = eave.addScaledVector(upSlope, 1.45 + row * 2.7).addScaledVector(roofNormal, 0.2);
      panel.position.copy(rest);
      panel.rotation.x = house.roofPitch;
      panel.visible = false;
      scene.add(panel);
      panelSlots.push({ group: panel, rest });
    }
  }

  const inverter = createInverter();
  inverter.group.position.set(1.0, 1.85, -3.78);
  inverter.group.visible = false;
  scene.add(inverter.group);
  const battery = createBattery();
  battery.group.position.set(2.3, 0.8, -3.74);
  battery.group.visible = false;
  scene.add(battery.group);

  // DC/AC cabling drawn in during the install
  const cableRoutes = [
    [[0.5, 5.2, 2.2], [0.8, 4.0, 0.6], [1.0, 3.95, -3.7], [1.0, 2.3, -3.72]],
    [[1.25, 1.5, -3.72], [1.8, 1.35, -3.7], [2.3, 1.5, -3.7]],
    [[0.7, 1.85, -3.72], [-0.2, 1.95, -3.72], [-0.92, 1.8, -3.72]],
  ].map((pts) => new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))));
  const installCables: THREE.Mesh[] = [];
  const installPulses: THREE.ShaderMaterial[] = [];
  for (const curve of cableRoutes) {
    const c = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.025, 6), cableMat);
    installCables.push(c);
    const pm = pulseMaterial(0x8ccf3f, 3, 0.9);
    installPulses.push(pm);
    const p = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.045, 6), pm);
    installCables.push(p);
    scene.add(c, p);
  }

  // ---------- post-processing ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.5, 0.98); // only true emissives glow
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- camera route ----------
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, "centripetal");
  const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, "centripetal");
  const tmpPos = new THREE.Vector3();
  const tmpTgt = new THREE.Vector3();
  const lastIdx = KEYS.length - 1;
  function curveParam(p: number) {
    let i = 0;
    while (i < lastIdx - 1 && p > KEYS[i + 1][0]) i++;
    const w = THREE.MathUtils.clamp((p - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]), 0, 1);
    const eased = THREE.MathUtils.lerp(w, w * w * (3 - 2 * w), 0.55); // gentle settle at each shot
    return (i + eased) / lastIdx;
  }

  // ---------- state ----------
  let target = 0;
  let current = 0;
  let paused = false;
  let visible = true;
  let raf = 0;
  let time = 0;
  let fanSpeed = 0;
  let last = performance.now();
  const purpleHemi = new THREE.Color(0x9a6bff);
  const duskHemi = new THREE.Color(0xffc49a);
  const nightHemi = new THREE.Color(0x3a2a6b);
  const duskFog = new THREE.Color(0x8a5a4a);
  const purpleFog = new THREE.Color(0x4a2384);
  const nightFog = new THREE.Color(0x150c2a);

  function apply(p: number, dt: number) {
    const purple = smooth(0.54, 0.6, p);
    const night = smooth(0.62, 0.95, p);
    const power = smooth(0.86, 0.9, p);
    const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
    skyU.uPurple.value = purple;
    skyU.uNight.value = night;
    fog.color.copy(duskFog).lerp(purpleFog, purple).lerp(nightFog, night);
    hemi.color.copy(duskHemi).lerp(purpleHemi, purple).lerp(nightHemi, night);
    hemi.intensity = THREE.MathUtils.lerp(0.9, 0.35, night) + purple * 0.15;
    sun.intensity = THREE.MathUtils.lerp(2.4, 0.08, Math.max(night, purple * 0.6));
    starMat.opacity = night;
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.05, 1.1, night);
    moon.intensity = night * 0.9;

    // pulses on the grid fade out once the home is self-powered at night
    for (const m of gridPulses) {
      m.uniforms.uTime.value = time;
      m.uniforms.uIntensity.value = THREE.MathUtils.lerp(1, 0.35, power);
    }

    // front wall dissolves whenever the camera is inside
    const inside = Math.max(band(0.42, 0.5, 0.64, 0.7, p), band(0.75, 0.79, 0.92, 0.96, p));
    for (const w of [...house.frontWall, ...house.frontWindows]) {
      const mat = w.material as THREE.MeshStandardMaterial;
      mat.opacity = 1 - inside * 0.96;
      mat.depthWrite = mat.opacity > 0.5;
      w.visible = mat.opacity > 0.05;
    }

    // DB board lights up purple
    for (const led of db.leds) led.emissiveIntensity = purple * 4;
    dbGlow.intensity = purple * 7 * (1 - power * 0.6);

    // panels drop onto the roof one by one
    panelSlots.forEach(({ group, rest }, i) => {
      const s = smooth(0.66 + i * 0.012, 0.7 + i * 0.012, p);
      group.visible = s > 0.001;
      group.position.copy(rest).add(new THREE.Vector3(0, (1 - s) * 7, (1 - s) * 2));
      group.rotation.z = (1 - s) * 0.25 * (i % 2 ? 1 : -1);
    });

    // inverter and battery mount, then cables draw in
    const mount = smooth(0.77, 0.81, p);
    for (const g of [inverter.group, battery.group]) {
      g.visible = mount > 0.001;
      g.scale.setScalar(THREE.MathUtils.lerp(0.6, 1, mount));
    }
    inverter.group.position.z = -3.78 + (1 - mount) * 0.8;
    battery.group.position.z = -3.74 + (1 - mount) * 0.8;
    const draw = smooth(0.79, 0.87, p);
    for (const c of installCables) {
      const geo = c.geometry as THREE.BufferGeometry;
      const count = geo.index ? geo.index.count : geo.attributes.position.count;
      geo.setDrawRange(0, Math.floor((count * draw) / 6) * 6);
      c.visible = draw > 0.001;
    }
    for (const m of installPulses) {
      m.uniforms.uTime.value = time;
      m.uniforms.uIntensity.value = power;
    }

    // power on: lights, windows, fan, inverter screen, battery LEDs
    inverter.screenMat.emissiveIntensity = mount * (0.6 + power * 2.5);
    battery.ledMat.emissiveIntensity = power * 3;
    bulbMat.emissiveIntensity = power * 3;
    for (const l of roomLights) l.intensity = power * (mobile ? 7 : 9);
    for (const w of house.windows) {
      (w.material as THREE.MeshStandardMaterial).emissiveIntensity = THREE.MathUtils.lerp(0, 0.45, night) + power * 1.3;
    }
    fanSpeed = THREE.MathUtils.lerp(fanSpeed, power * 9, Math.min(1, dt * 2));
    fan.rotor.rotation.y += fanSpeed * dt;

    // camera
    const u = curveParam(p);
    posCurve.getPoint(u, tmpPos);
    tgtCurve.getPoint(u, tmpTgt);
    // subtle handheld drift
    tmpPos.x += Math.sin(time * 0.7) * 0.04;
    tmpPos.y += Math.sin(time * 0.9 + 1) * 0.03;
    camera.position.copy(tmpPos);
    camera.lookAt(tmpTgt);
    camera.fov = THREE.MathUtils.lerp(42, 55, band(0.5, 0.58, 0.62, 0.66, p) + band(0.8, 0.84, 0.92, 0.97, p) * 0.6);
    camera.updateProjectionMatrix();
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (paused || !visible) return;
    time += dt;
    current += (target - current) * Math.min(1, dt * 3.5);
    apply(current, dt);
    composer.render();
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(mobile ? w / 2 : w, mobile ? h / 2 : h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);
  resize();
  raf = requestAnimationFrame(frame);

  return {
    setProgress: (p) => (target = THREE.MathUtils.clamp(p, 0, 1)),
    setPaused: (v) => (paused = v),
    renderStill: (p) => {
      paused = true;
      current = target = p;
      fanSpeed = 0;
      apply(p, 0);
      composer.render();
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => m.dispose());
      });
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
