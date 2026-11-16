import React, { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export interface LiquidGlassSettings {
  tileSize: number
  logoScale: number
  finalScale: number
  logoOffset: [number, number]
  iconPlate: boolean
  keepPlate: boolean
  originalColors: boolean
  opticalDepth: number
  dispersion: number
  colorBleed: number
  doubleBevel: number
  bevelWidth: number
  corner: number
  cornerPull: number
  cornerWidth: number
  cornerFocus: number
  edgeSmear: number
  stretch: number
  tilt: number
  bulge: number
  specular: number
  halo: number
  shadow: number
  ripple: number
  bounce: number
  response: number
  startSize: number
  startZoom: number
  glide: number
  present: number
  drift: number
  swell: number
  focus: number
  sheen: number
  lightTurn: number
  hold: number
  background: string
  plateColor: string
  logoColor: string
}

const DEFAULT_LIGHT_SETTINGS: LiquidGlassSettings = {
  tileSize: 256,
  logoScale: 0.6,
  finalScale: 0.8,
  logoOffset: [0, 0],
  iconPlate: false,
  keepPlate: false,
  originalColors: false,
  opticalDepth: 1.1,
  dispersion: 1.7,
  colorBleed: 1.25,
  doubleBevel: 1,
  bevelWidth: 0.14,
  corner: 4.8,
  cornerPull: 2.1,
  cornerWidth: 2.2,
  cornerFocus: 0.58,
  edgeSmear: 2.85,
  stretch: 0,
  tilt: 0.35,
  bulge: 1,
  specular: 1,
  halo: 0,
  shadow: 1,
  ripple: 1,
  bounce: 0,
  response: 0.42,
  startSize: 0.2,
  startZoom: 2.3,
  glide: 2.3,
  present: 2.4,
  drift: 0.12,
  swell: 0.5,
  focus: 1,
  sheen: 1,
  lightTurn: 0.9,
  hold: 0.4,
  background: '#e9e9eb',
  plateColor: '#ffffff',
  logoColor: '#0045ff',
}

const LOOKS: Record<'light' | 'dark', LiquidGlassSettings> = {
  light: DEFAULT_LIGHT_SETTINGS,
  dark: {
    ...DEFAULT_LIGHT_SETTINGS,
    logoScale: 0.72,
    finalScale: 1,
    iconPlate: true,
    halo: 1,
    shadow: 0,
    ripple: 0.5,
    startZoom: 1.6,
    drift: 0.05,
    opticalDepth: 0.75,
    bevelWidth: 0.22,
    dispersion: 0.9,
    colorBleed: 0.45,
    corner: 5,
    cornerPull: 1.4,
    edgeSmear: 1.2,
    tilt: 0,
    cornerWidth: 1.2,
    cornerFocus: 0.4,
    background: '#000000',
    plateColor: '#05070b',
    logoColor: '#ffffff',
  },
}

const TEX_SIZE = 1024
const BOX_FRAC = 0.75
const TAIL_DURATION = 1.1
const OUTRO_DURATION = 0.5

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('LiquidGlassLogoReveal: logo could not be loaded'))
    img.src = src
  })
}

function isMarkup(str: string): boolean {
  return str.trimStart().startsWith('<')
}

function svgToUrl(svgText: string): string {
  const svg = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement
  if (!svg || svg.nodeName.toLowerCase() !== 'svg') {
    throw new Error('LiquidGlassLogoReveal: SVG could not be read')
  }
  let w = parseFloat(svg.getAttribute('width') || '')
  let h = parseFloat(svg.getAttribute('height') || '')
  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    w = vb[2]
    h = vb[3]
  }
  if (!(w > 0 && h > 0)) {
    w = h = 100
  }
  const scale = TEX_SIZE / Math.max(w, h)
  svg.setAttribute('width', String(Math.round(w * scale)))
  svg.setAttribute('height', String(Math.round(h * scale)))
  const serialized = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, '#ffffff')
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized)
}

function resolveLogoUrl(logo: string): string {
  return isMarkup(logo) ? svgToUrl(logo) : logo
}

function fitToTexture(source: HTMLImageElement, sw: number, sh: number): HTMLCanvasElement {
  const tmp = document.createElement('canvas')
  tmp.width = tmp.height = TEX_SIZE
  const tc = tmp.getContext('2d', { willReadFrequently: true })!
  const s0 = Math.min(TEX_SIZE / sw, TEX_SIZE / sh)
  const dx0 = (TEX_SIZE - sw * s0) / 2
  const dy0 = (TEX_SIZE - sh * s0) / 2
  tc.drawImage(source, dx0, dy0, sw * s0, sh * s0)
  const d = tc.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data

  let opaque = true
  for (let i = 3; i < d.length; i += 4 * 97) {
    if (d[i] < 250) {
      opaque = false
      break
    }
  }
  const key = [d[0], d[1], d[2]]
  const keyAlpha = (r: number, g: number, b: number) =>
    Math.min(1, Math.max(0, (Math.hypot(r - key[0], g - key[1], b - key[2]) / 441 - 0.08) / 0.2))

  let x0 = TEX_SIZE
  let y0 = TEX_SIZE
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const i = (y * TEX_SIZE + x) * 4
      const a = opaque ? keyAlpha(d[i], d[i + 1], d[i + 2]) * 255 : d[i + 3]
      if (a > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) {
    throw new Error('LiquidGlassLogoReveal: the logo is empty')
  }
  const bw = x1 - x0 + 1
  const bh = y1 - y0 + 1
  const s = (TEX_SIZE * BOX_FRAC) / Math.max(bw, bh)

  const out = document.createElement('canvas')
  out.width = out.height = TEX_SIZE
  const oc = out.getContext('2d', { willReadFrequently: true })!
  oc.imageSmoothingQuality = 'high'
  oc.drawImage(
    source,
    TEX_SIZE / 2 - (x0 + bw / 2 - dx0) * s,
    TEX_SIZE / 2 - (y0 + bh / 2 - dy0) * s,
    sw * s0 * s,
    sh * s0 * s
  )
  if (opaque) {
    const im = oc.getImageData(0, 0, TEX_SIZE, TEX_SIZE)
    const e = im.data
    for (let i = 0; i < e.length; i += 4) {
      e[i + 3] = Math.round(e[i + 3] * keyAlpha(e[i], e[i + 1], e[i + 2]))
    }
    oc.putImageData(im, 0, 0)
  }
  return out
}

function edt1d(
  grid: Float64Array,
  offset: number,
  stride: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array,
  INF: number
) {
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  f[0] = grid[offset]
  for (let q = 1, k = 0, s = 0; q < TEX_SIZE; q++) {
    f[q] = grid[offset + q * stride]
    const q2 = q * q
    do {
      const r = v[k]
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2
    } while (s <= z[k] && --k > -1)
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  for (let q = 0, k = 0; q < TEX_SIZE; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    const qr = q - r
    grid[offset + q * stride] = f[r] + qr * qr
  }
}

function edt(grid: Float64Array, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  for (let x = 0; x < TEX_SIZE; x++) edt1d(grid, x, TEX_SIZE, f, v, z, INF)
  for (let y = 0; y < TEX_SIZE; y++) edt1d(grid, y * TEX_SIZE, 1, f, v, z, INF)
}

function buildSdf(canvas: HTMLCanvasElement): Float32Array {
  const n = TEX_SIZE * TEX_SIZE
  const alpha = canvas.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data
  const INF = 1e20
  const outer = new Float64Array(n)
  const inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = alpha[i * 4 + 3] / 255
    if (a >= 1) {
      outer[i] = 0
      inner[i] = INF
    } else if (a <= 0) {
      outer[i] = INF
      inner[i] = 0
    } else {
      const dd = 0.5 - a
      outer[i] = dd > 0 ? dd * dd : 0
      inner[i] = dd < 0 ? dd * dd : 0
    }
  }
  const f = new Float64Array(TEX_SIZE)
  const z = new Float64Array(TEX_SIZE + 1)
  const v = new Uint16Array(TEX_SIZE)
  edt(outer, f, v, z, INF)
  edt(inner, f, v, z, INF)
  const sdf = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX_SIZE
  }
  return sdf
}

interface LogoData {
  canvas: HTMLCanvasElement
  sdf: Float32Array
}

const logoCache = new Map<string, Promise<LogoData>>()

export function preloadLiquidGlassLogo(logo: string): Promise<LogoData> {
  let cached = logoCache.get(logo)
  if (!cached) {
    cached = loadImage(resolveLogoUrl(logo)).then(img => {
      const canvas = fitToTexture(img, img.naturalWidth || TEX_SIZE, img.naturalHeight || TEX_SIZE)
      return { canvas, sdf: buildSdf(canvas) }
    })
    logoCache.set(logo, cached)
    cached.catch(() => logoCache.delete(logo))
  }
  return cached
}

const VERT_SHADER = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG_SHADER = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uCenter;      // device px, GL coords
uniform float uTile;       // tile size, device px
uniform sampler2D uSdf;    // signed distance, texture units, + outside
uniform sampler2D uCol;    // premultiplied colour, mipmapped
uniform float uTexSize;
uniform float uBoxFrac;

uniform float uPlateScale; // plate size relative to the tile
uniform float uShapeN;     // superellipse exponent: 2 = circle
uniform float uCornerN;    // final exponent, used by the ghost
uniform float uOptics;     // 1 = full refraction, 0 = flat
uniform float uPlateAlpha; // 1 = glass shown, 0 = bare logo
uniform float uLogoHalf;   // logo half size in plate units (zoom included)
uniform vec2 uLogoOff;     // logo centre, plate units
uniform float uBold;       // stroke swell, in logo half-size units
uniform float uBlur;       // edge softness, plate units
uniform float uFrost;      // milky lift inside a young bubble
uniform float uDome;       // lens bulge height
uniform float uDrop;       // 1 while the glass is a round droplet, 0 once it has spread into the tile
uniform float uPinch;      // the face's stretch toward its corners, at the rim
uniform float uTilt;       // extra stretch of the rising diagonal's corners (0–1)
uniform float uRim;
uniform float uHalo;
uniform float uShadow;
uniform float uGhost;
uniform float uRipR;       // ripple radius, plate sizes
uniform float uRipA;
uniform float uBare;       // 1 once the logo may show without glass (the ending)
uniform float uReach;      // the rim band's full width, plate units
uniform float uCornerPull; // how much harder the corners pull than the sides
uniform float uStreak;     // how far a corner smears content along the rim, in band widths
uniform float uWiden;      // how much wider the folding band grows toward the corners
uniform float uSlab;       // how far the slab stands above the logo, plate units
uniform float uEtaSpread;  // index spread across the spectrum (red highest)
uniform float uFocus;      // how far in along the diagonal a corner focuses, plate units
uniform float uFocusK;     // how quickly the view slides back from the focus across the band
uniform float uFocusSplit; // how much further in red meets than violet, plate units
uniform float uRimLine;    // how far across the band the sight line takes to turn in to the focus
uniform float uCornerOn;   // 0 while the glass is round, 1 once it has spread into the tile
uniform float uDissolve;   // 0 -> 1 as the glass lets go of the logo
uniform float uGlow;       // colour bleed in the rim, plate units on screen
uniform float uFaceDisp;   // lateral colour across the face
uniform float uVivid;      // chroma lift of the dispersed light

uniform float uDisp;
uniform float uDouble;
uniform float uBevelW;
uniform float uSpec;
uniform float uIconPlate;
uniform float uUseColor;
uniform float uLightScene; // 1 = light backdrop, 0 = dark
uniform float uLightGlass; // the same for what the glass sits on (the plate, when there is one)
uniform float uKeep;       // 1 = the glass settles into a flat plate instead of letting go of it
uniform float uSheen;      // strength of the light band crossing the face
uniform float uSweep;      // where that band is, plate sizes along its diagonal
uniform float uLightAng;   // how far the rim light has turned, radians
uniform float uPurple;     // 1 = purple/violet dispersion spectrum, 0 = classic cyan/gold

uniform vec3 uBg;
uniform vec3 uPlateCol;
uniform vec3 uLogoCol;

float px; // one device pixel in plate units

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

// aa: footprint of one screen pixel at q, plate units.
vec4 logoAt(vec2 q, float blur, float aa) {
  float L = uLogoHalf;
  float k = 0.5 * uBoxFrac / L;
  vec2 uv = vec2(0.5 + (q.x - uLogoOff.x) * k, 0.5 - (q.y - uLogoOff.y) * k);
  float d = texture(uSdf, uv).r / k;
  float w = 0.75 * aa + blur;
  float a = 1.0 - smoothstep(-w, w, d - uBold * L);
  vec3 c = uLogoCol;
  if (uUseColor > 0.5) {
    float lod = log2(max(1.0, w * k * uTexSize));
    vec4 c0 = textureLod(uCol, uv, lod);
    vec4 c1 = textureLod(uCol, uv, lod + 3.0);
    vec4 c2 = textureLod(uCol, uv, 7.0);
    c = c2.rgb / max(c2.a, 1e-4);
    c = mix(c, c1.rgb / max(c1.a, 1e-4), smoothstep(0.0, 0.06, c1.a));
    c = mix(c, c0.rgb / max(c0.a, 1e-4), smoothstep(0.02, 0.3, c0.a));
  }
  return vec4(c, a);
}

// Superellipse field. Returns signed distance (plate units, - inside); g = 1 on the rim.
float shape(vec2 p, float scale, float n, out vec2 nOut, out float g, out vec2 dg) {
  vec2 pp = p / scale;
  vec2 a = max(abs(pp), vec2(1e-6));
  g = pow(pow(a.x, n) + pow(a.y, n), 1.0 / n);
  dg = sign(pp) * pow(a, vec2(n - 1.0)) * pow(max(g, 1e-6), 1.0 - n);
  float dgl = max(length(dg), 1e-6);
  nOut = dg / dgl;
  return (g - 1.0) / dgl * scale;
}

// Curvature radius (plate units) of the shape's contour through p.
float contourRadius(vec2 p, float scale, float n) {
  vec2 a = max(abs(p / scale), vec2(1e-4));
  vec2 a1 = pow(a, vec2(n - 1.0));
  vec2 a2 = pow(a, vec2(n - 2.0));
  float k = (n - 1.0) * (a2.x * a1.y * a1.y + a2.y * a1.x * a1.x) / pow(max(dot(a1, a1), 1e-30), 1.5);
  return scale / max(k, 1e-3);
}

// Where the glass at x = s / bwF across its rounded edge looks: a slab uSlab above the logo with a
// quarter-round edge of radius bwF. A straight-down sight line bends inward by Snell's law, so the
// outer rim looks deepest and the view eases back to the face across the edge.
vec2 refractSample(float x, float bwF, float eta, float R, vec2 dirOut, vec2 p, float dome, float offMul) {
  float u = clamp(1.0 - x, 0.0, 0.995);
  float th = asin(u), thr = asin(u / eta);
  float z = uSlab + bwF * sqrt(1.0 - u * u);
  float off = offMul * z * tan(th - thr);
  off = off / (1.0 + off / (6.0 * R));
  return p - (dirOut * off + p * dome) * uOptics;
}

float gauss(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
float band(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }

// Visible spectrum, red (0) to violet (1).
float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
vec3 spectrum(float x) {
  vec3 classic = vec3(
    bump(x, 0.34, 0.2) + 0.08 * bump(x, 0.93, 0.05),
    bump(x, 0.58, 0.1),
    bump(x, 0.8, 0.11)
  );
  vec3 purple = vec3(
    bump(x, 0.28, 0.16) + 0.72 * bump(x, 0.78, 0.14),
    bump(x, 0.48, 0.12),
    bump(x, 0.80, 0.14) + 0.35 * bump(x, 0.24, 0.12)
  );
  return mix(classic, purple, uPurple);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  px = 2.0 / uTile;
  vec2 p = (gl_FragCoord.xy - uCenter) * px;

  vec4 lg = logoAt(p, uBlur, px);
  vec3 plain = mix(uBg, lg.rgb, lg.a * uBare);

  vec2 nOut, dg; float g;
  float sd = shape(p, uPlateScale, uShapeN, nOut, g, dg);
  float s = -sd;
  float bw = max(uBevelW, 0.004) * uPlateScale;
  float x = clamp(s / bw, 0.0, 1.0);
  float R = contourRadius(p, uPlateScale, uShapeN);
  vec2 pq = p * p;
  float diag = 4.0 * pq.x * pq.y / max((pq.x + pq.y) * (pq.x + pq.y), 1e-6);
  float tilt = mix(1.0 - uTilt, 1.0, smoothstep(-0.02, 0.02, p.x * p.y));
  float pinchPart = uPinch * min(g * g, 1.0) * diag * diag * tilt;
  float dome = uDome * (1.0 - min(g * g, 1.0)) + pinchPart;
  vec2 dirOut = normalize(mix(nOut, p / max(length(p), 1e-4), 0.2));
  // Rounded corners curve both ways, so they draw content in from deeper than the sides.
  float cornerness = max(smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y), smoothstep(0.15, 0.75, diag));
  float offMul = 1.0 + 0.4 * max(uCornerPull - 1.0, 0.0) * tilt * cornerness * uCornerOn;
  // Around a corner every sight line meets at one focus a little way in along the diagonal.
  vec2 focus = sign(p) * (pow(0.5, 1.0 / uShapeN) - uFocus * 0.70710678) * uPlateScale;
  float focusW = tilt * cornerness * uOptics * uCornerOn;
  float bwF = max(uReach, 0.004) * (1.0 + uWiden * tilt * cornerness * uCornerOn);
  float xf = clamp(s / bwF, 0.0, 1.0);
  // Footprint of one pixel after refraction, measured in uniform control flow.
  vec2 qc = refractSample(xf, bwF, 1.5, R, dirOut, p, dome, offMul);
  float foot = max(max(length(dFdx(qc)), length(dFdy(qc))), 0.25 * px);

  // Backdrop: anticipation ghost, ripple, soft lift shadow and glow.
  vec3 bg = uBg;
  vec3 lift = mix(uBg + vec3(0.06), mix(uBg, vec3(1.0), 0.55), uLightScene);
  if (uGhost > 0.001) {
    vec2 gn, gdg; float gg;
    float gsd = shape(p, 1.0, uCornerN, gn, gg, gdg);
    bg = mix(bg, lift, uGhost * 0.12 * (1.0 - smoothstep(-0.16, 0.14, gsd)));
    bg *= 1.0 - uGhost * 0.03 * uLightScene * exp(-max(gsd, 0.0) / 0.12) * step(0.0, gsd);
  }
  float outside = max(sd, 0.0);
  if (uRipA > 0.001) {
    float d0 = (uRipR - 1.0) * uPlateScale;
    float rx = (sd - d0) / 0.022;
    float ring = exp(-rx * rx);
    bg += uRipA * ring * (0.04 * (0.55 + 0.45 * dot(nOut, normalize(vec2(-0.5, 0.8))))) * mix(0.5, 1.0, uLightScene);
    bg -= uRipA * 0.016 * uLightScene * exp(-(rx - 1.6) * (rx - 1.6));
  }
  float shadowFall = max(sd, 0.0) / (0.9 * uPlateScale);
  bg *= 1.0 - uShadow * 0.03 * exp(-shadowFall * shadowFall) * step(0.0, sd);
  vec3 haloCol = mix(vec3(0.62, 0.69, 0.80), vec3(1.0), uLightScene);
  bg = mix(bg, haloCol, clamp(uHalo * (0.30 * exp(-outside / (0.025 * uPlateScale)) + 0.07 * exp(-outside / (0.12 * uPlateScale))), 0.0, 1.0) * step(0.0, sd));

  vec3 col = bg;
  float soft = px + uBlur * 0.8 + 0.06 * uDissolve * (1.0 - uKeep) * uPlateScale;
  if (sd < soft) {
    // Lighting surface: a superellipse quarter, flat toward the face and steep at the rim.
    float y1 = 1.0 - x;
    const float K = 2.6;
    float base1 = max(1.0 - pow(y1, K), 1e-4);
    float db = min(pow(y1, K - 1.0) * pow(base1, 1.0 / K - 1.0), 25.0);
    // A second, lower step just inside the first draws the faint inner line.
    float s1 = bw * 0.62;
    float w2 = bw * 0.22;
    float t2 = clamp((s - s1) / w2, -1.0, 1.0);
    float dh2 = uDouble * bw * 0.16;
    float dd = dh2 * 0.5 * cos(t2 * 1.5707963) * 1.5707963 / w2 * step(abs(t2), 0.999);
    vec2 gDome = -uDome * 2.0 * g * dg * step(g, 1.0);
    vec2 grad = -(db + dd) * nOut + gDome;

    vec3 back = mix(uBg, uPlateCol, uIconPlate);
    vec3 liftG = mix(back + vec3(0.06), mix(back, vec3(1.0), 0.55), uLightGlass);
    float rblur = uBlur + 0.05 * length(qc - p) + min(uGlow * uOptics * (1.0 - xf) * foot / px, 0.04);

    // Each wavelength refracts by its own index, so everything the edge draws in fans into colour
    // while the face stays crisp. Around a corner the samples also smear along the rim.
    float cornerW = smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y);
    float streak = 0.35 * uStreak * bw * mix(0.15, 1.0, cornerW) * pow(1.0 - xf, 1.5) * uOptics;
    vec2 tangent = vec2(-nOut.y, nOut.x);
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float lam = (float(i) + 0.5) / 20.0;
      float c = uDisp * (1.0 - 2.0 * lam);
      vec2 along = tangent * (streak * 2.0 * (fract(float(i) * 0.618034 + 0.31) - 0.5));
      float cf = uDisp * (1.0 - 2.0 * lam) * (lam > 0.5 ? 1.0 : 0.5);
      vec2 sp = refractSample(xf, bwF, 1.5 + uEtaSpread * c, R, dirOut, p + along,
                              dome + pinchPart * 0.3 * c, offMul);
      vec2 focusL = focus - sign(p) * (0.70710678 * uFocusSplit * c * uPlateScale);
      float wFocus = pow(1.0 - xf, uFocusK) * smoothstep(0.0, uRimLine * (1.0 + 0.6 * c), xf);
      sp = mix(sp, mix(p + along, focusL, wFocus), focusW);
      float faceOnly = smoothstep(0.7, 1.0, xf) * uOptics;
      sp *= 1.0 + uFaceDisp * cf * faceOnly;
      vec4 l = logoAt(sp, rblur + 0.12 * streak + uFaceDisp * 0.5 * max(c, 0.0) * faceOnly, foot);
      vec3 w = spectrum(lam);
      acc += mix(back, l.rgb, l.a) * w;
      wsum += w;
    }
    vec3 trans = acc / wsum;
    float tl = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    trans = clamp(tl + (trans - tl) * (1.0 + uVivid * uOptics), 0.0, 1.0);
    // A young droplet is milky; the haze only ever lightens.
    float hazeLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float hazeGate = mix(1.0 - smoothstep(0.25, 0.75, hazeLum), smoothstep(0.25, 0.75, hazeLum), uLightGlass);
    trans = mix(trans, liftG, uFrost * 0.45 * hazeGate);

    float glassAmt = pow(1.0 - uDissolve, 1.5);
    float lit = uSpec * glassAmt;
    vec3 rimCol = mix(vec3(0.80, 0.87, 0.97), vec3(1.0), uLightGlass);

    // Light backdrop: the thick edge glows softly white over a clear face, with a hairline that is
    // bright along the top and right and a thin dark silhouette down the left and bottom.
    float sc = uPlateScale;
    float tLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float lightOnly = smoothstep(0.35, 0.85, tLum);
    float hw = smoothstep(-0.85, 0.5, dot(nOut, rot(vec2(0.5, 0.866), uLightAng)));
    float tileBand = band(s, 0.016 * sc, 0.075 * sc, 0.022 * sc);
    float dropBand = (1.0 - smoothstep(0.06 * sc, 0.13 * sc, s)) * smoothstep(0.0, 0.004 * sc, s);
    float glow = mix(0.32 * tileBand, 0.75 * dropBand, uDrop) * lightOnly;
    float edgeLine = gauss(s, 0.005 * sc, 0.0045 * sc);
    float lip = gauss(s, 0.15 * sc, 0.007 * sc) * uDouble * (1.0 - uDrop);
    vec3 lightGlass = mix(trans, vec3(1.0), glow * glassAmt);
    lightGlass += (0.075 * hw * edgeLine + 0.06 * (0.4 + 0.6 * hw) * lip) * lit;
    lightGlass *= 1.0 - 0.05 * (1.0 - hw) * edgeLine * glassAmt * (1.0 - uDrop);
    lightGlass = mix(lightGlass, vec3(1.0), 0.55 * uDrop * glassAmt * edgeLine);

    // Dark backdrop: a cool rim light that grows toward the steep edge, and a small key highlight.
    vec3 Nl = normalize(vec3(-grad, 1.0));
    float edge = 1.0 - Nl.z;
    vec2 ldir = rot(normalize(vec2(-0.62, 0.78)), uLightAng);
    float side = dot(nOut, ldir);
    float fres = pow(edge, 1.5);
    vec3 rim = rimCol * fres * (0.35 + 0.65 * max(side, -side * 0.8)) * uRim * 0.65;
    vec3 Hv = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    float spc = pow(max(dot(Nl, Hv), 0.0), 140.0) * 0.8 * smoothstep(0.0, 0.25, y1);
    vec3 darkGlass = trans * (1.0 - 0.25 * fres) + (rim + vec3(spc)) * lit;
    darkGlass = mix(darkGlass, rimCol, uDrop * 0.4 * uSpec * (1.0 - smoothstep(0.0, 0.1 * uPlateScale, s)));
    vec3 glass = mix(darkGlass, lightGlass, uLightGlass);

    // While the glass holds the logo a soft band of light crosses the face, brightest near the rim.
    float sweepD = dot(p / uPlateScale, normalize(vec2(0.8, 0.6))) - uSweep;
    float sheen = uSheen * glassAmt * exp(-sweepD * sweepD / 0.03) * (0.55 + 0.45 * (1.0 - x));
    glass = mix(glass, vec3(1.0), sheen * mix(0.22, 0.42, uLightGlass));

    float cov = clamp(0.5 - sd / soft, 0.0, 1.0);
    col = mix(bg, glass, cov);
  }

  vec3 outc = mix(plain, col, uPlateAlpha);
  outc += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(outc, 1.0);
}`

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh) || 'shader')
    }
    return sh
  }

  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SHADER))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SHADER))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'program')
  }
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i)
    if (info) {
      uniforms[info.name] = gl.getUniformLocation(prog, info.name)
    }
  }

  const sdfTex = gl.createTexture()
  const colTex = gl.createTexture()
  gl.uniform1i(uniforms.uSdf, 0)
  gl.uniform1i(uniforms.uCol, 1)
  let hasLogo = false

  const setTexParams = (minFilter: number) => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  function setLogo(logo: LogoData) {
    gl!.activeTexture(gl!.TEXTURE0)
    gl!.bindTexture(gl!.TEXTURE_2D, sdfTex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.R16F, TEX_SIZE, TEX_SIZE, 0, gl!.RED, gl!.FLOAT, logo.sdf)
    setTexParams(gl!.LINEAR)

    gl!.activeTexture(gl!.TEXTURE1)
    gl!.bindTexture(gl!.TEXTURE_2D, colTex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, gl!.RGBA, gl!.UNSIGNED_BYTE, logo.canvas)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl!.generateMipmap(gl!.TEXTURE_2D)
    setTexParams(gl!.LINEAR_MIPMAP_LINEAR)
    hasLogo = true
  }

  function render(frame: Record<string, any>, w: number, h: number, tilePx: number) {
    if (!hasLogo) return
    gl!.viewport(0, 0, w, h)
    gl!.uniform2f(uniforms.uCenter, w / 2, h / 2)
    gl!.uniform1f(uniforms.uTile, tilePx)
    gl!.uniform1f(uniforms.uTexSize, TEX_SIZE)
    gl!.uniform1f(uniforms.uBoxFrac, BOX_FRAC)
    for (const key in frame) {
      const val = frame[key]
      if (typeof val === 'number' && uniforms[key]) {
        gl!.uniform1f(uniforms[key], val)
      }
    }
    gl!.uniform3fv(uniforms.uBg, frame.uBg)
    gl!.uniform3fv(uniforms.uPlateCol, frame.uPlateCol)
    gl!.uniform3fv(uniforms.uLogoCol, frame.uLogoCol)
    gl!.uniform2fv(uniforms.uLogoOff, frame.uLogoOff)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function dispose() {
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { setLogo, render, dispose }
}

const endOf = (s: LiquidGlassSettings) => s.present + TAIL_DURATION
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const smoother = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean.replace(/./g, '$&$&')
  }
  const num = parseInt(clean.slice(0, 6), 16) || 0
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255]
}

const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

function spring(t: number, response: number, damping: number): number {
  if (t <= 0) return 0
  const w = (2 * Math.PI) / response
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t)
  const wd = w * Math.sqrt(1 - damping * damping)
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
}

const reachCache = new Map<string, number>()
function timeToReach(level: number, response: number, damping: number): number {
  const key = `${level}/${response}/${damping}`
  let cached = reachCache.get(key)
  if (cached === undefined) {
    let lo = 0
    let hi = 3
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (spring(mid, response, damping) < level) lo = mid
      else hi = mid
    }
    cached = hi
    reachCache.set(key, cached)
  }
  return cached
}

function frameAt(time: number, r: LiquidGlassSettings, outro = 0) {
  const s = r.present
  const keep = r.keepPlate ? 1 : 0
  const damping = 1 - r.bounce
  const grow = spring(time + 0.01, r.response, damping)
  const tl = timeToReach(0.85, r.response, damping) - 0.01
  const tm = timeToReach(0.92, r.response, damping) - 0.01
  const morph = spring(time - tm, 0.4, 1)
  const drop = 1 - smooth(0.05, 1, morph)
  const appear = smooth(0, 0.08, time)
  const drift = r.drift * spring(time - 0.3, 2.2, 1)
  const zoomIn = 0.25 * spring(time, 0.7, 1) + 0.75 * smoother(0, r.glide, time)
  const settle = spring(time - 0.5, 2.4, 1)
  const exit = spring(time - s, 0.95, 1)
  const release = spring(time - s - 0.05, 0.65, 1)
  const dome = 0.15 * r.bulge * (1 - smooth(0.4, 0.95, grow))
  const view =
    (1 + (r.startZoom - 1) * (1 - zoomIn)) *
    (1 - 0.045 * settle) *
    mix(1, r.finalScale, exit) *
    (1 - 0.06 * outro)
  const bandW = mix(r.bevelWidth, Math.max(r.bevelWidth, 0.4), drop)
  const plateScale =
    mix(r.startSize, 1, grow) *
    (1 + drift) *
    (1 + 0.14 * release * (1 - keep)) *
    (1 - keep * (0.03 * release + 0.06 * outro))
  const bgRgb = hexToRgb(r.background)

  return {
    uPlateScale: plateScale,
    uShapeN: mix(2, r.corner, morph),
    uCornerN: r.corner,
    uOptics: 1 - smooth(0.55, 1, release),
    uPlateAlpha: keep ? appear * (1 - outro) : appear * (1 - smooth(0.45, 1, release)),
    uLogoHalf: r.logoScale * view,
    uLogoOff: [r.logoOffset[0] * view, r.logoOffset[1] * view],
    uKeep: keep,
    uSheen: r.sheen,
    uSweep: mix(-1.6, 1.6, smoother(0.9, s - 0.1, time)),
    uLightAng: r.lightTurn * smoother(0.4, s + 0.4, time),
    uBold: r.swell * 0.03 * (1 - zoomIn),
    uBlur: r.focus * 0.05 * (1 - smooth(0.3, 0.95, grow)) + 0.03 * outro,
    uFrost: r.focus * (1 - smooth(0.5, 0.95, grow)),
    uPinch: 0.38 * r.stretch * smooth(0.1, 0.9, morph) * smooth(0.75, 0.97, zoomIn),
    uTilt: r.tilt,
    uDome: dome,
    uDrop: drop,
    uRim: 1 + 0.8 * drop,
    uHalo: r.halo * (0.5 + 0.5 * drop) * (1 - keep * release),
    uShadow: Math.max(
      r.shadow * smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)),
      0.8 * r.shadow * keep * release
    ),
    uGhost: smooth(0, 0.03, time) * (1 - smooth(0.04, 0.08, time)),
    uRipR: 1 + 0.9 * Math.max(0, time - tl),
    uRipA: r.ripple * smooth(tl, tl + 0.06, time) * Math.exp(-Math.max(0, time - tl) / 0.6),
    uBare: (1 - keep) * smooth(s - 0.25, s, time) * (1 - outro),
    uReach: bandW * plateScale,
    uCornerPull: r.cornerPull,
    uStreak: r.edgeSmear,
    uWiden: r.cornerWidth,
    uSlab: 0.3 * r.opticalDepth,
    uEtaSpread: 0.06,
    uFocus: r.cornerFocus,
    uFocusK: 1,
    uFocusSplit: 0.056 * r.colorBleed,
    uRimLine: 0.09,
    uCornerOn: smooth(0.35, 1, morph),
    uGlow: 0.012 * r.colorBleed,
    uFaceDisp: 0.012 * r.dispersion,
    uVivid: 0.85,
    uDissolve: release,
    uDisp: r.dispersion,
    uDouble: r.doubleBevel,
    uBevelW: bandW * (1 - release),
    uSpec: r.specular,
    uIconPlate: r.iconPlate ? 1 : 0,
    uUseColor: r.originalColors ? 1 : 0,
    uLightScene: luminance(bgRgb) > 0.5 ? 1 : 0,
    uLightGlass: luminance(r.iconPlate ? hexToRgb(r.plateColor) : bgRgb) > 0.5 ? 1 : 0,
    uBg: bgRgb,
    uPlateCol: hexToRgb(r.plateColor),
    uLogoCol: hexToRgb(r.logoColor),
  }
}

export interface LiquidGlassLogoRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  logo: string
  look?: 'light' | 'dark'
  background?: string
  logoColor?: string
  plateColor?: string
  iconPlate?: boolean
  keepPlate?: boolean
  originalColors?: boolean
  tileSize?: number
  logoScale?: number
  finalScale?: number
  logoOffset?: [number, number]
  loop?: boolean
  playOutroOnEnd?: boolean
  hold?: number
  speed?: number
  time?: number
  tuning?: Partial<LiquidGlassSettings>
  label?: string
  palette?: 'classic' | 'purple'
  replayOnClick?: boolean
  onComplete?: () => void
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export function LiquidGlassLogoReveal({
  logo,
  look = 'light',
  background,
  logoColor,
  plateColor,
  iconPlate,
  keepPlate,
  originalColors,
  tileSize,
  logoScale,
  finalScale,
  logoOffset,
  loop = false,
  playOutroOnEnd = true,
  hold,
  speed = 1,
  time,
  tuning,
  label = 'AIR Lab Logo',
  palette = 'classic',
  replayOnClick = false,
  onComplete,
  className,
  style,
  onClick,
  ...rest
}: LiquidGlassLogoRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const engineRef = useRef<{
    setLogo: (data: LogoData) => void
    replay: () => void
    invalidate: () => void
    dispose: () => void
  } | null>(null)
  const [fallback, setFallback] = useState(false)

  const tuningJson = JSON.stringify(tuning ?? {})
  const offsetKey = logoOffset ? logoOffset.join(',') : ''

  const settings = useMemo<LiquidGlassSettings>(() => {
    const overrides: Partial<LiquidGlassSettings> = Object.fromEntries(
      Object.entries({
        background,
        logoColor,
        plateColor,
        iconPlate,
        keepPlate,
        originalColors,
        tileSize,
        logoScale,
        finalScale,
        hold,
      }).filter(([, v]) => v !== undefined)
    )
    if (offsetKey) {
      overrides.logoOffset = offsetKey.split(',').map(Number) as [number, number]
    }
    return {
      ...LOOKS[look],
      ...overrides,
      ...JSON.parse(tuningJson),
    }
  }, [
    look,
    background,
    logoColor,
    plateColor,
    iconPlate,
    keepPlate,
    originalColors,
    tileSize,
    logoScale,
    finalScale,
    hold,
    offsetKey,
    tuningJson,
  ])

  const stateRef = useRef({
    settings,
    loop,
    playOutroOnEnd,
    speed,
    time,
    palette,
    onComplete,
  })
  stateRef.current = {
    settings,
    loop,
    playOutroOnEnd,
    speed,
    time,
    palette,
    onComplete,
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
    el.appendChild(canvas)

    let renderer: ReturnType<typeof createRenderer> = null
    try {
      renderer = createRenderer(canvas)
    } catch (err) {
      console.error(err)
    }
    if (!renderer) {
      canvas.remove()
      setFallback(true)
      const fallbackTimer = window.setTimeout(() => {
        stateRef.current.onComplete?.()
      }, 1200)
      return () => window.clearTimeout(fallbackTimer)
    }

    let logoData: LogoData | null = null
    let currentTime = 0
    let playing = true
    let pauseRemaining = 0
    let outroProgress = 0
    let dirty = true
    let inView = true
    let contextLost = false
    let rafId = 0
    let lastNow = 0
    let completedOnce = false

    function tick(now: number) {
      rafId = 0
      const dt = Math.min(0.1, (now - lastNow) / 1000)
      lastNow = now
      const {
        settings: cfg,
        loop: shouldLoop,
        playOutroOnEnd: shouldOutro,
        speed: spd,
        time: fixedTime,
        palette: pal,
        onComplete: handleComplete,
      } = stateRef.current
      const end = endOf(cfg)

      if (fixedTime !== undefined) {
        playing = false
        currentTime = fixedTime
        outroProgress = clamp01((fixedTime - end - Math.max(0.05, cfg.hold)) / OUTRO_DURATION)
      } else if (playing && logoData) {
        if (pauseRemaining > 0) {
          pauseRemaining -= dt * spd
          const prevOutro = outroProgress
          outroProgress = clamp01(1 - pauseRemaining / OUTRO_DURATION)
          if (pauseRemaining <= 0) {
            pauseRemaining = 0
            if (shouldLoop) {
              outroProgress = 0
              currentTime = 0
            } else {
              outroProgress = 1
              playing = false
              if (!completedOnce) {
                completedOnce = true
                handleComplete?.()
              }
            }
          }
          if (outroProgress !== prevOutro || currentTime === 0) {
            dirty = true
          }
        } else {
          currentTime += dt * spd
          if (currentTime >= end) {
            currentTime = end
            if (shouldLoop || shouldOutro) {
              pauseRemaining = Math.max(0.05, cfg.hold) + OUTRO_DURATION
            } else {
              playing = false
              if (!completedOnce) {
                completedOnce = true
                handleComplete?.()
              }
            }
          }
          dirty = true
        }
      }

      if (dirty && logoData && renderer && !contextLost) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        const w = Math.max(1, Math.round(cw * dpr))
        const h = Math.max(1, Math.round(ch * dpr))
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
        }
        const tileCss = Math.min(cfg.tileSize, Math.min(cw, ch) / 1.75)
        const frame = {
          ...frameAt(Math.min(currentTime, end), cfg, outroProgress),
          uPurple: pal === 'purple' ? 1 : 0,
        }
        renderer.render(frame, w, h, tileCss * dpr)
        dirty = false
      }

      if (inView && playing && logoData && !contextLost) {
        rafId = requestAnimationFrame(tick)
      }
    }

    function kick() {
      if (!rafId && inView && !contextLost) {
        lastNow = performance.now()
        rafId = requestAnimationFrame(tick)
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) {
        kick()
      } else if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    })
    io.observe(el)

    const ro = new ResizeObserver(() => {
      dirty = true
      kick()
    })
    ro.observe(el)

    const onLost = (e: Event) => {
      e.preventDefault()
      contextLost = true
    }
    const onRestored = () => {
      contextLost = false
      try {
        renderer = createRenderer(canvas)
        if (renderer && logoData) {
          renderer.setLogo(logoData)
        }
      } catch (err) {
        console.error(err)
      }
      dirty = true
      kick()
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    const api = {
      setLogo(data: LogoData) {
        logoData = data
        renderer?.setLogo(data)
        currentTime = 0
        playing = true
        pauseRemaining = 0
        outroProgress = 0
        completedOnce = false
        dirty = true
        kick()
      },
      replay() {
        currentTime = 0
        playing = true
        pauseRemaining = 0
        outroProgress = 0
        completedOnce = false
        dirty = true
        kick()
      },
      invalidate() {
        dirty = true
        kick()
      },
      dispose() {
        if (rafId) cancelAnimationFrame(rafId)
        io.disconnect()
        ro.disconnect()
        canvas.removeEventListener('webglcontextlost', onLost)
        canvas.removeEventListener('webglcontextrestored', onRestored)
        renderer?.dispose()
        canvas.remove()
      },
    }

    engineRef.current = api
    return () => {
      engineRef.current = null
      api.dispose()
    }
  }, [])

  useEffect(() => {
    engineRef.current?.invalidate()
  }, [settings, loop, playOutroOnEnd, speed, time, palette])

  useEffect(() => {
    let cancelled = false
    preloadLiquidGlassLogo(logo).then(
      data => {
        if (!cancelled) {
          engineRef.current?.setLogo(data)
        }
      },
      err => console.error(err)
    )
    return () => {
      cancelled = true
    }
  }, [logo])

  const fallbackMaskUrl = useMemo(() => (fallback ? resolveLogoUrl(logo) : ''), [fallback, logo])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label}
      className={cn(
        'relative isolate overflow-hidden select-none',
        replayOnClick && 'cursor-pointer',
        className
      )}
      style={{ backgroundColor: settings.background, ...style }}
      onClick={e => {
        if (replayOnClick) {
          engineRef.current?.replay()
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {fallback && (
        <span
          aria-hidden
          className="absolute inset-0 m-auto block"
          style={{
            width: settings.tileSize * settings.logoScale * settings.finalScale * BOX_FRAC,
            height: settings.tileSize * settings.logoScale * settings.finalScale * BOX_FRAC,
            maxWidth: '40%',
            maxHeight: '40%',
            backgroundColor: settings.logoColor,
            maskImage: `url("${fallbackMaskUrl}")`,
            WebkitMaskImage: `url("${fallbackMaskUrl}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      )}
    </div>
  )
}

export default LiquidGlassLogoReveal
