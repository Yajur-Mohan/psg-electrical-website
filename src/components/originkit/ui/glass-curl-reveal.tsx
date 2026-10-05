"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { animate, motionValue } from "motion/react"

type Motion = {
    type?: "spring" | "tween" | "keyframes" | "inertia"
    duration?: number
    ease?: [number, number, number, number]
    delay?: number
    stiffness?: number
    damping?: number
    mass?: number
    bounce?: number
    restSpeed?: number
    restDelta?: number
}

const VERTEX_SRC = `
attribute vec4 a_position;
void main() { gl_Position = a_position; }
`

const FRAGMENT_SRC = `
precision highp float;

uniform vec2 iResolution;
uniform float uTime;
uniform float uProgress;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform float uAspect;
uniform vec2 uDir;
uniform float uAmp;
uniform float uFreq;
uniform float uCurve;
uniform float uSCurve;
uniform float uDisp;
uniform float uShine;
uniform vec3 uTint;

float wavePhase(vec2 p) {
    vec2 perp = vec2(-uDir.y, uDir.x);
    float a = dot(p, uDir);
    float halfSpan = 0.5 * (uAspect * abs(perp.x) + abs(perp.y));
    float s = dot(p, perp) / max(halfSpan, 0.0001);
    float bow = s * s;
    float ess = 2.5 * (s * s * s - 0.6 * s);
    return a * uFreq + uCurve * bow + uSCurve * ess;
}

float wave(float q, float t) {
    float w = sin(q + t);
    w += 0.45 * sin(q * 2.3 - t * 1.4);
    w += 0.30 * sin(q * 0.35 + t * 0.6);
    return w / 1.75;
}

float waveSlope(float q, float t) {
    float d = cos(q + t);
    d += 0.45 * 2.3 * cos(q * 2.3 - t * 1.4);
    d += 0.30 * 0.35 * cos(q * 0.35 + t * 0.6);
    return clamp(d / 2.14, -1.0, 1.0);
}

vec2 cover(vec2 uv) {
    return (uv - 0.5) * uCover + 0.5;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;

    float env = 1.0 - clamp(uProgress, 0.0, 1.0);
    env = env * env * (0.6 + 0.4 * env);

    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
    float q = wavePhase(p);
    float t = uTime * 0.9;

    float w = wave(q, t);

    vec2 off = uDir * (w * uAmp * env);
    off.x /= uAspect;

    float d = uDisp * env;
    vec3 col;
    col.r = texture2D(uTex, cover(uv + off * (1.0 + d))).r;
    col.g = texture2D(uTex, cover(uv + off)).g;
    col.b = texture2D(uTex, cover(uv + off * (1.0 - d))).b;

    float s = waveSlope(q, t) * uShine * env;
    col += max(s, 0.0) * 0.75;
    col *= 1.0 - max(-s, 0.0) * 0.35;

    col *= mix(vec3(1.0), uTint, env);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

function compileShader(
    gl: WebGLRenderingContext,
    type: number,
    src: string
): WebGLShader | null {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
    }
    return shader
}

function num(v: number | undefined, fallback: number): number {
    return typeof v === "number" && Number.isFinite(v) ? v : fallback
}

type ImageProp = { src?: string; srcSet?: string; alt?: string }

type Props = {
    image?: ImageProp
    rounded?: number
    trigger?: "scroll" | "hover"
    amount?: number
    angle?: number
    ripples?: number
    tint?: string
    transition?: Motion
    width?: number
    height?: number
    style?: React.CSSProperties
}

function parseRGB(input: string | undefined): [number, number, number] {
    if (!input) return [1, 1, 1]
    const s = input.trim()
    const m = s.match(/^#([0-9a-f]{3,8})$/i)
    if (m) {
        let h = m[1]
        if (h.length === 3 || h.length === 4)
            h = h
                .slice(0, 3)
                .split("")
                .map((c) => c + c)
                .join("")
        const n = parseInt(h.slice(0, 6), 16)
        return [
            ((n >> 16) & 255) / 255,
            ((n >> 8) & 255) / 255,
            (n & 255) / 255,
        ]
    }
    const r = s.match(/rgba?\(([^)]+)\)/i)
    if (r) {
        const p = r[1].split(",").map((v) => parseFloat(v))
        if (p.length >= 3) return [p[0] / 255, p[1] / 255, p[2] / 255]
    }
    return [1, 1, 1]
}

const DEFAULT_IMAGE: ImageProp = {
    src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
    alt: "",
}

const CANVAS_HOLD_MS = 1400

const BEND_MAX = Math.PI * 4

const BACKGROUND = "#0b0b0d"
const CURVE_RAD = (30 / 100) * BEND_MAX
const S_CURVE_RAD = (70 / 100) * BEND_MAX
const DISPERSION = (25 / 100) * 0.35
const SHINE = 40 / 100

const DEFAULT_TRANSITION: Motion = {
    type: "tween",
    duration: 2.2,

    ease: [0, 0, 1, 1],
    delay: 0,
}

const SCROLL_FOLLOW = 0.12

function scrollProgress(el: HTMLElement): number {
    const vh =
        window.innerHeight || document.documentElement.clientHeight || 1
    const r = el.getBoundingClientRect()
    const travel = Math.max(1, Math.min(vh, r.height))
    return Math.min(1, Math.max(0, (vh - r.top) / travel))
}

export default function GlassCurlReveal(props: Props) {
    const {
        image = {"alt":"","src":"https://images.unsplash.com/photo-1737834495647-f60b20534b22?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHZpYnJhbnQlMjBpbWFnZXN8ZW58MHwwfDB8fHwy"},
        rounded = 0,
        trigger = "hover",
        amount = 55,
        angle = 360,
        ripples = 22,
        tint = "#FFFFFF",
        transition = {"ease":[0,0,1,1],"mass":1,"type":"tween","delay":0,"damping":60,"duration":1,"stiffness":800},
        width,
        height,
        style,
    } = props

    const src = image?.src || DEFAULT_IMAGE.src
    const alt = image?.alt || ""

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isStatic = false
    const isCanvas = false

    const sizeRef = useRef({ w: 0, h: 0 })
    sizeRef.current = { w: num(width, 0), h: num(height, 0) }

    const valuesRef = useRef({
        trigger: "scroll" as "scroll" | "hover",
        amp: 0.165,
        freq: 37.7,
        curve: 3.77,
        sCurve: 8.8,
        dirX: 0,
        dirY: 1,
        disp: 0.25,
        shine: 0.4,
        tint: [1, 1, 1] as [number, number, number],
    })
    {
        const rad = (num(angle, 90) * Math.PI) / 180
        valuesRef.current = {
            trigger: trigger === "hover" ? "hover" : "scroll",

            amp: (num(amount, 55) / 100) * 0.4,
            freq: Math.max(1, num(ripples, 12)) * Math.PI,

            curve: CURVE_RAD,
            sCurve: S_CURVE_RAD,
            dirX: Math.cos(rad),
            dirY: Math.sin(rad),
            disp: DISPERSION,
            shine: SHINE,
            tint: parseRGB(tint),
        }
    }

    const progressMV = useRef(motionValue(0)).current

    const transitionRef = useRef<Motion>(transition)
    transitionRef.current = transition

    useEffect(() => {
        if (isStatic) {
            progressMV.set(1)
            return
        }
        if (!isCanvas) {
            progressMV.set(0)
            return
        }
        let cancelled = false
        let timer: ReturnType<typeof setTimeout> | undefined
        let controls: { stop: () => void } | undefined

        const run = async () => {
            while (!cancelled) {
                progressMV.set(0)
                const playback = animate(progressMV, 1, transitionRef.current)
                controls = playback
                await playback
                if (cancelled) break
                await new Promise<void>((res) => {
                    timer = setTimeout(res, CANVAS_HOLD_MS)
                })
            }
        }
        run()

        return () => {
            cancelled = true
            if (timer) clearTimeout(timer)
            controls?.stop()
        }
    }, [isCanvas, isStatic, progressMV])

    const hoverAnim = useRef<{ stop: () => void } | null>(null)
    const hoverTo = React.useCallback(
        (to: number) => {
            if (isCanvas || isStatic || trigger !== "hover") return
            hoverAnim.current?.stop()
            hoverAnim.current = animate(progressMV, to, transitionRef.current)
        },
        [isCanvas, isStatic, trigger, progressMV]
    )

    useEffect(() => () => hoverAnim.current?.stop(), [])

    const [box, setBox] = React.useState({ w: 0, h: 0 })
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const read = () => setBox({ w: el.offsetWidth, h: el.offsetHeight })
        read()
        const ro = new ResizeObserver(read)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const roundedClip = (() => {
        if (!box.w || !box.h) return "none"
        const t = Math.max(0, Math.min(100, rounded)) / 100
        const short = Math.min(box.w, box.h)
        const insetX = (t * (box.w - short)) / 2
        const insetY = (t * (box.h - short)) / 2
        return `inset(${insetY}px ${insetX}px round ${(t * short) / 2}px)`
    })()

    const glRef = useRef<{
        gl: WebGLRenderingContext
        texture: WebGLTexture
    } | null>(null)
    const imageSizeRef = useRef({ w: 1, h: 1 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const gl = canvas.getContext("webgl", { premultipliedAlpha: false })
        if (!gl) {
            console.error("WebGL not supported")
            return
        }

        const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
        if (!vs || !fs) return

        const program = gl.createProgram()
        if (!program) return
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(program))
            return
        }
        gl.useProgram(program)

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        )
        const posLoc = gl.getAttribLocation(program, "a_position")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const texture = gl.createTexture()
        if (!texture) return
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([16, 16, 20, 255])
        )

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        glRef.current = { gl, texture }

        const u = {
            resolution: gl.getUniformLocation(program, "iResolution"),
            time: gl.getUniformLocation(program, "uTime"),
            progress: gl.getUniformLocation(program, "uProgress"),
            tex: gl.getUniformLocation(program, "uTex"),
            cover: gl.getUniformLocation(program, "uCover"),
            aspect: gl.getUniformLocation(program, "uAspect"),
            dir: gl.getUniformLocation(program, "uDir"),
            amp: gl.getUniformLocation(program, "uAmp"),
            freq: gl.getUniformLocation(program, "uFreq"),
            curve: gl.getUniformLocation(program, "uCurve"),
            sCurve: gl.getUniformLocation(program, "uSCurve"),
            disp: gl.getUniformLocation(program, "uDisp"),
            shine: gl.getUniformLocation(program, "uShine"),
            tint: gl.getUniformLocation(program, "uTint"),
        }
        gl.uniform1i(u.tex, 0)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)

        const start = performance.now()
        let scrollSmooth = 0
        let scrollPrimed = false
        let rafId = 0

        const render = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const cw = canvas.clientWidth || sizeRef.current.w || 1200
            const ch = canvas.clientHeight || sizeRef.current.h || 800
            const bw = Math.max(1, Math.round(cw * dpr))
            const bh = Math.max(1, Math.round(ch * dpr))
            if (canvas.width !== bw || canvas.height !== bh) {
                canvas.width = bw
                canvas.height = bh
                gl.viewport(0, 0, bw, bh)
            }

            const v = valuesRef.current
            const now = performance.now()
            const t = (now - start) / 1000

            let progress: number
            const host = containerRef.current
            if (v.trigger === "scroll" && !isCanvas && host) {
                const raw = scrollProgress(host)
                if (!scrollPrimed) {
                    scrollSmooth = raw
                    scrollPrimed = true
                } else {
                    scrollSmooth += (raw - scrollSmooth) * SCROLL_FOLLOW
                }
                progress = scrollSmooth
            } else {
                progress = progressMV.get()
            }

            const ca = bw / bh
            const ia = imageSizeRef.current.w / imageSizeRef.current.h
            const sx = ia > ca ? ca / ia : 1
            const sy = ia > ca ? 1 : ia / ca

            gl.uniform2f(u.resolution, bw, bh)
            gl.uniform1f(u.time, t)
            gl.uniform1f(u.progress, progress)
            gl.uniform2f(u.cover, sx, sy)
            gl.uniform1f(u.aspect, ca)
            gl.uniform2f(u.dir, v.dirX, v.dirY)
            gl.uniform1f(u.amp, v.amp)
            gl.uniform1f(u.freq, v.freq)
            gl.uniform1f(u.curve, v.curve)
            gl.uniform1f(u.sCurve, v.sCurve)
            gl.uniform1f(u.disp, v.disp)
            gl.uniform1f(u.shine, v.shine)
            gl.uniform3f(u.tint, v.tint[0], v.tint[1], v.tint[2])

            gl.drawArrays(gl.TRIANGLES, 0, 6)
            rafId = requestAnimationFrame(render)
        }
        rafId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(rafId)
            glRef.current = null
        }

    }, [])

    useEffect(() => {
        if (!src) return
        let cancelled = false
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            const ctx = glRef.current
            if (cancelled || !ctx) return
            const { gl, texture } = ctx
            imageSizeRef.current = {
                w: img.naturalWidth || 1,
                h: img.naturalHeight || 1,
            }
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                img
            )
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        }
        img.onerror = () => console.error("GlassCurlReveal: image load failed")
        img.src = src
        return () => {
            cancelled = true
        }
    }, [src])

    if (isStatic) {
        return (
            <div
                ref={containerRef}
                style={{
                    minWidth: 1200,
                    minHeight: 800,
                    ...style,
                    position: "relative",
                    overflow: "hidden",
                    background: BACKGROUND,
                    clipPath: roundedClip,
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </div>
        )
    }

    return (
        <div
            ref={containerRef}

            onPointerEnter={() => hoverTo(1)}
            onPointerLeave={() => hoverTo(0)}
            onPointerCancel={() => hoverTo(0)}
            style={{
                minWidth: 1200,
                minHeight: 800,
                ...style,
                position: "relative",
                overflow: "hidden",
                background: BACKGROUND,
                clipPath: roundedClip,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />
        </div>
    )
}