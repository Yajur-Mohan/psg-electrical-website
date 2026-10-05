"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Curtains.js WebGL distortion on a regular <img> (MASTER-IMPLEMENTATION §3.6):
// hovering sends ripples out from the pointer with a slight RGB split.
// The <img> is the real content; WebGL only takes over once the plane is ready.

const VERTEX = `
precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uPlaneAspect;
uniform float uImageAspect;
varying vec2 vTextureCoord;
varying vec2 vVertexUv;
void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  // object-fit: cover, done here rather than via Curtains' texture matrix
  vec2 uv = aTextureCoord;
  if (uPlaneAspect > uImageAspect) uv.y = (uv.y - 0.5) * (uImageAspect / uPlaneAspect) + 0.5;
  else uv.x = (uv.x - 0.5) * (uPlaneAspect / uImageAspect) + 0.5;
  vTextureCoord = uv;
  vVertexUv = aTextureCoord;
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 vTextureCoord;
varying vec2 vVertexUv;
uniform sampler2D uSampler0;
uniform float uTime;
uniform float uHover;
uniform vec2 uMouse;
void main() {
  vec2 d = vVertexUv - uMouse;
  float dist = length(d);
  float wave = sin(dist * 38.0 - uTime * 0.12) * exp(-dist * 4.0) * uHover;
  vec2 offset = normalize(d + 0.0001) * wave * 0.018;
  float r = texture2D(uSampler0, vTextureCoord + offset * 1.4).r;
  float g = texture2D(uSampler0, vTextureCoord + offset).g;
  float b = texture2D(uSampler0, vTextureCoord + offset * 0.6).b;
  vec3 col = vec3(r, g, b) + vec3(0.18, 0.12, 0.35) * max(wave, 0.0) * 1.5;
  gl_FragColor = vec4(col, 1.0);
}`;

export default function RippleImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover)").matches) return;
    const host = canvasHost.current;
    const plane = wrap.current;
    if (!host || !plane) return;
    let disposed = false;
    let cleanup = () => {};

    import("curtainsjs").then(({ Curtains, Plane }) => {
      if (disposed) return;
      const curtains = new Curtains({ container: host, pixelRatio: Math.min(1.5, window.devicePixelRatio), watchScroll: false });
      let target = 0;
      let hover = 0;
      const mouse = [0.5, 0.5];
      const p = new Plane(curtains, plane, {
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          time: { name: "uTime", type: "1f", value: 0 },
          hover: { name: "uHover", type: "1f", value: 0 },
          mouse: { name: "uMouse", type: "2f", value: mouse },
          planeAspect: { name: "uPlaneAspect", type: "1f", value: plane.clientWidth / Math.max(1, plane.clientHeight) },
          imageAspect: {
            name: "uImageAspect",
            type: "1f",
            value: (img.current?.naturalWidth || 16) / (img.current?.naturalHeight || 10),
          },
        },
      });
      p.onReady(() => plane.setAttribute("data-webgl", "")).onRender(() => {
        hover += (target - hover) * 0.08;
        p.uniforms.time.value = (p.uniforms.time.value as number) + 1;
        p.uniforms.hover.value = hover;
        p.uniforms.mouse.value = mouse;
      });
      curtains.onError(() => plane.removeAttribute("data-webgl"));

      const onMove = (e: PointerEvent) => {
        const r = plane.getBoundingClientRect();
        mouse[0] = (e.clientX - r.left) / r.width;
        mouse[1] = 1 - (e.clientY - r.top) / r.height;
      };
      const onEnter = () => (target = 1);
      const onLeave = () => (target = 0);
      plane.addEventListener("pointermove", onMove);
      plane.addEventListener("pointerenter", onEnter);
      plane.addEventListener("pointerleave", onLeave);
      const ro = new ResizeObserver(() => {
        p.resize();
        p.uniforms.planeAspect.value = plane.clientWidth / Math.max(1, plane.clientHeight);
      });
      ro.observe(plane);

      cleanup = () => {
        ro.disconnect();
        plane.removeEventListener("pointermove", onMove);
        plane.removeEventListener("pointerenter", onEnter);
        plane.removeEventListener("pointerleave", onLeave);
        plane.removeAttribute("data-webgl");
        curtains.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced]);

  return (
    <div ref={wrap} className={`ripple-image relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={src} alt={alt} data-sampler="uSampler0" className="size-full object-cover" crossOrigin="anonymous" />
      <div ref={canvasHost} aria-hidden="true" className="pointer-events-none absolute inset-0" />
    </div>
  );
}
