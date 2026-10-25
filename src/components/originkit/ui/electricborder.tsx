"use client";

import { useEffect, useRef, type CSSProperties } from "react";

function random(x: number): number {
  return (Math.sin(x * 12.9898) * 43758.5453) % 1;
}

function noise2D(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const a = random(i + j * 57);
  const b = random(i + 1 + j * 57);
  const c = random(i + (j + 1) * 57);
  const d = random(i + 1 + (j + 1) * 57);
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
}

function octavedNoise(
  x: number,
  octaves: number,
  lacunarity: number,
  gain: number,
  baseAmplitude: number,
  baseFrequency: number,
  time: number,
  seed: number,
  baseFlatness: number
): number {
  let y = 0;
  let amplitude = baseAmplitude;
  let frequency = baseFrequency;
  for (let i = 0; i < octaves; i++) {
    let octaveAmplitude = amplitude;
    if (i === 0) octaveAmplitude *= baseFlatness;
    y +=
      octaveAmplitude *
      noise2D(frequency * x + seed * 100, time * frequency * 0.3);
    frequency *= lacunarity;
    amplitude *= gain;
  }
  return y;
}

function corner(
  cx: number,
  cy: number,
  r: number,
  start: number,
  arc: number,
  p: number
) {
  const a = start + p * arc;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function roundedRectPoint(
  t: number,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number
) {
  const sw = width - 2 * radius;
  const sh = height - 2 * radius;
  const arc = (Math.PI * radius) / 2;
  const total = 2 * sw + 2 * sh + 4 * arc;
  const dist = t * total;
  let acc = 0;
  if (dist <= acc + sw) {
    const p = (dist - acc) / sw;
    return { x: left + radius + p * sw, y: top };
  }
  acc += sw;
  if (dist <= acc + arc) {
    const p = (dist - acc) / arc;
    return corner(
      left + width - radius,
      top + radius,
      radius,
      -Math.PI / 2,
      Math.PI / 2,
      p
    );
  }
  acc += arc;
  if (dist <= acc + sh) {
    const p = (dist - acc) / sh;
    return { x: left + width, y: top + radius + p * sh };
  }
  acc += sh;
  if (dist <= acc + arc) {
    const p = (dist - acc) / arc;
    return corner(
      left + width - radius,
      top + height - radius,
      radius,
      0,
      Math.PI / 2,
      p
    );
  }
  acc += arc;
  if (dist <= acc + sw) {
    const p = (dist - acc) / sw;
    return { x: left + width - radius - p * sw, y: top + height };
  }
  acc += sw;
  if (dist <= acc + arc) {
    const p = (dist - acc) / arc;
    return corner(
      left + radius,
      top + height - radius,
      radius,
      Math.PI / 2,
      Math.PI / 2,
      p
    );
  }
  acc += arc;
  if (dist <= acc + sh) {
    const p = (dist - acc) / sh;
    return { x: left, y: top + height - radius - p * sh };
  }
  acc += sh;
  const p = (dist - acc) / arc;
  return corner(left + radius, top + radius, radius, Math.PI, Math.PI / 2, p);
}

interface ElectricBorderProps {
  color?: string;
  bgColor?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  borderRadius?: number;
  glow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  style?: CSSProperties;
}

export default function ElectricBorder({
  color = "#FFFFFF",
  bgColor = "#000000",
  speed = 1,
  chaos = 4,
  thickness = 3.5,
  borderRadius = 0,
  glow = true,
  glowColor = "#00FFCC",
  glowIntensity = 10,
  style,
}: ElectricBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Performance: the glow is two wide translucent strokes rather than up to ten
    // shadow-blurred ones, with fewer noise octaves, a lower pixel-ratio cap, ~30 fps,
    // and no drawing while off screen. The blurred strokes were costing weak GPUs
    // roughly half their frame rate.
    const octaves = 6;
    const lacunarity = 1.6;
    const gain = 0.7;
    const amplitude = chaos / 20;
    const frequency = 10;
    const baseFlatness = 0;
    const displacement = 40;
    const gi = Math.max(1, Math.min(10, glowIntensity));
    const glowBlur = glow ? 6 + gi * 2 : 0;
    const PAD = 120;
    const DPR_CAP = 1.5;
    const FRAME_MS = 1000 / 30;

    let width = 0,
      height = 0;
    let lastDpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    let visible = false;
    let lastDraw = 0;

    function updateSize(mw?: number, mh?: number) {
      const rect = container!.getBoundingClientRect();
      const w = Math.max(1, mw ?? rect.width);
      const h = Math.max(1, mh ?? rect.height);
      const cw = w + PAD * 2;
      const ch = h + PAD * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas!.width = Math.max(1, Math.floor(cw * dpr));
      canvas!.height = Math.max(1, Math.floor(ch * dpr));
      canvas!.style.width = `${cw}px`;
      canvas!.style.height = `${ch}px`;
      canvas!.style.left = `${-PAD}px`;
      canvas!.style.top = `${-PAD}px`;
      width = w;
      height = h;
    }
    updateSize();

    function draw(currentTime: number) {
      animationRef.current = requestAnimationFrame(draw);
      if (!visible || document.hidden || currentTime - lastDraw < FRAME_MS) return;
      lastDraw = currentTime;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      if (dpr !== lastDpr) {
        lastDpr = dpr;
        updateSize();
      }

      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = currentTime;
      // Cap the step so the crackle doesn't jump after scrolling back into view
      const dt = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.1);
      timeRef.current += dt * speed;
      lastFrameTimeRef.current = currentTime;

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.scale(dpr, dpr);
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      const left = PAD;
      const top = PAD;
      const bw = width;
      const bh = height;
      const maxR = Math.min(bw, bh) / 2;
      const radius = Math.min(borderRadius, Math.max(0, maxR));
      const perim = 2 * (bw + bh) + 2 * Math.PI * radius;
      const samples = Math.max(16, Math.floor(perim / 4));

      ctx!.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const pt = roundedRectPoint(t, left, top, bw, bh, radius);
        const xn = octavedNoise(
          t * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          0,
          baseFlatness
        );
        const yn = octavedNoise(
          t * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          1,
          baseFlatness
        );
        const dx = pt.x + xn * displacement;
        const dy = pt.y + yn * displacement;
        if (i === 0) ctx!.moveTo(dx, dy);
        else ctx!.lineTo(dx, dy);
      }
      ctx!.closePath();

      if (glowBlur > 0) {
        ctx!.strokeStyle = glowColor;
        ctx!.globalAlpha = 0.16;
        ctx!.lineWidth = thickness + glowBlur * 0.7;
        ctx!.stroke();
        ctx!.globalAlpha = 0.35;
        ctx!.lineWidth = thickness + glowBlur * 0.3;
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }
      ctx!.lineWidth = thickness;
      ctx!.strokeStyle = color;
      ctx!.stroke();
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: "100px" });
    io.observe(container);
    animationRef.current = requestAnimationFrame(draw);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            updateSize(cr?.width, cr?.height);
          })
        : null;
    ro?.observe(container);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      io.disconnect();
      ro?.disconnect();
    };
  }, [
    color,
    speed,
    chaos,
    thickness,
    borderRadius,
    glow,
    glowColor,
    glowIntensity,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "visible",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        borderRadius,
        background: bgColor,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          display: "block",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}