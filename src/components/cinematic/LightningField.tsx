"use client";

import { useEffect, useRef } from "react";

// Hand-written WebGL fragment shader: electric arcs leap from a glowing "power
// node" towards the pointer, over a slow plasma haze. Runs entirely on the GPU.
// Pauses when off-screen or when `paused` is set; caps DPR for performance.

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 r;
uniform float t;
uniform vec2 m;
uniform float charge;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}
  return v;
}

// Glow of a jagged arc between a and b
float arc(vec2 p,vec2 a,vec2 b,float seed,float width){
  vec2 ab=b-a;
  float len=length(ab);
  float h=clamp(dot(p-a,ab)/dot(ab,ab),0.,1.);
  vec2 n=vec2(-ab.y,ab.x)/len;
  float jag=(fbm(vec2(h*7.*len+seed,t*4.+seed))-.5)*.35*len;
  jag+=(noise(vec2(h*40.+seed,t*18.))-.5)*.03;
  float env=sin(h*3.14159);
  float d=abs(dot(p-a-ab*h,n)-jag*env);
  d+=length(p-a-ab*h-n*dot(p-a-ab*h,n))*2.;
  float flick=.55+.45*step(.35,hash(vec2(floor(t*14.+seed*7.),seed)));
  return width/(d+.0025)*flick;
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
  vec2 node=vec2(.45*r.x/r.y,.08);
  vec2 target=(m-.5*r)/r.y;

  // plasma haze
  float haze=fbm(uv*2.2+vec2(t*.05,-t*.04));
  vec3 col=vec3(.07,.08,.11)+vec3(.05,.07,.16)*haze*haze;
  col+=vec3(.12,.1,.3)*smoothstep(.9,0.,length(uv-node))*.6;

  // arcs from the node to the pointer
  float e=0.;
  e+=arc(uv,node,target,1.3,.0048);
  e+=arc(uv,node,target+vec2(.06,-.04),4.7,.003);
  e+=arc(uv,node,target+vec2(-.05,.05),8.1,.0024);
  // ambient arcs to the edges
  e+=arc(uv,node,node+vec2(.5,.6),2.2,.0022);
  e+=arc(uv,node,node+vec2(.4,-.7),6.6,.002);
  e+=arc(uv,node,node+vec2(-.3,.75),9.4,.0016);
  e*=charge;

  vec3 bolt=mix(vec3(.36,.55,1.),vec3(.75,.45,1.),.5+.5*sin(t*.7));
  col+=bolt*e;
  col+=vec3(.9,.95,1.)*smoothstep(.8,2.5,e); // white-hot core
  col+=vec3(.85,.9,1.)*smoothstep(.02,0.,length(uv-node))*charge;
  col+=bolt*.05/(length(uv-node)+.03)*charge;

  // vignette
  col*=1.-.55*smoothstep(.4,1.4,length(uv*vec2(.8,1.)));
  gl_FragColor=vec4(col,1.);
}`;

export default function LightningField({ paused = false }: { paused?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const c = canvas.current;
    const gl = c?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!c || !gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");
    const uC = gl.getUniformLocation(prog, "charge");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let visible = true;
    let raf = 0;
    let charge = 0;
    const start = performance.now();

    function resize() {
      const { width, height } = c!.getBoundingClientRect();
      c!.width = Math.max(1, Math.floor(width * dpr));
      c!.height = Math.max(1, Math.floor(height * dpr));
      gl!.viewport(0, 0, c!.width, c!.height);
      if (!mouse.tx) {
        mouse.tx = mouse.x = c!.width * 0.35;
        mouse.ty = mouse.y = c!.height * 0.75;
      }
    }

    function onMove(e: PointerEvent) {
      const rect = c!.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) * dpr;
      mouse.ty = (rect.height - (e.clientY - rect.top)) * dpr;
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible || pausedRef.current) return;
      const t = (now - start) / 1000;
      // Idle drift so arcs keep moving without a mouse (touch, keyboard users)
      if (performance.now() - lastMove > 2500) {
        mouse.tx = c!.width * (0.35 + 0.15 * Math.sin(t * 0.6));
        mouse.ty = c!.height * (0.6 + 0.2 * Math.cos(t * 0.45));
      }
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      charge = Math.min(1, charge + 0.02);
      gl!.uniform2f(uR, c!.width, c!.height);
      gl!.uniform1f(uT, t);
      gl!.uniform2f(uM, mouse.x, mouse.y);
      gl!.uniform1f(uC, charge);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    let lastMove = 0;
    const move = (e: PointerEvent) => {
      lastMove = performance.now();
      onMove(e);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(c);
    window.addEventListener("pointermove", move);
    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
      // Free GPU resources but keep the context: React may remount on the same canvas
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return <canvas ref={canvas} className="absolute inset-0 size-full" />;
}
