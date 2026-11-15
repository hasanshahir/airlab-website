import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export interface RibbonStopItem {
  num: string
  name: string
  tag: string
}

export const ABOUT_RIBBON_STOPS: RibbonStopItem[] = [
  {
    num: '01',
    name: 'About AIR Lab',
    tag: 'AIR Lab at NED University turns cutting-edge AI research into production-ready systems built for local hardware and Pakistan’s languages and realities.',
  },
  {
    num: '02',
    name: 'Core Domains',
    tag: 'Cybersecurity and adversarial AI, small language models, computer vision, NLP, speech-based agents, and agentic AI.',
  },
  {
    num: '03',
    name: 'Vision',
    tag: 'To make Pakistan a builder of AI, not just a consumer of it, with solutions designed around our people, our languages, and our values.',
  },
  {
    num: '04',
    name: 'Mission',
    tag: 'To conduct cutting-edge AI research and turn it into secure, production-ready systems while training the next generation of AI researchers and engineers.',
  },
  {
    num: '05',
    name: 'Aim 01',
    tag: 'Advance AI research in security, language, speech, and vision, with a focus on problems that matter locally.',
  },
  {
    num: '06',
    name: 'Aim 02',
    tag: 'Build practical, efficient AI that works within the data, language, and resource realities of Pakistan.',
  },
  {
    num: '07',
    name: 'Aim 03',
    tag: 'Close the gap between academic research and real-world deployment.',
  },
  {
    num: '08',
    name: 'Objective 01',
    tag: 'Conduct and publish original research in adversarial AI, NLP, computer vision, and agentic systems.',
  },
  {
    num: '09',
    name: 'Objective 02',
    tag: 'Develop AI solutions that fit local languages, data, and resource constraints.',
  },
  {
    num: '10',
    name: 'Objective 03',
    tag: 'Build and share datasets, benchmarks, and tools that reflect Pakistani contexts and users.',
  },
  {
    num: '11',
    name: 'Objective 04',
    tag: 'Turn research into practical, privacy-preserving prototypes that address real local needs.',
  },
  {
    num: '12',
    name: 'Objectives 05 & 06',
    tag: 'Train students and researchers through hands-on mentorship and collaborate with academia, industry, and the public sector to move AI into practice.',
  },
]

const TAU = Math.PI * 2
const SAMPLE_N = 128

interface RingSpec {
  rx: number
  ry: number
  rot: number
  tilt: number
  yaw: number
}

const RINGS_FIT: { A: RingSpec; B: RingSpec } = {
  A: {
    rx: 0.4525,
    ry: 0.2508,
    rot: -0.237189,
    tilt: 0.5625,
    yaw: -0.072916,
  },
  B: {
    rx: 0.25285,
    ry: 0.3694,
    rot: 0.677886,
    tilt: -0.28125,
    yaw: 0.088542,
  },
}

// Fractions for the multi-ring elliptical spiral family (Screenshot 3)
const SPIRAL_FRACTIONS = [0.14, 0.28, 0.42, 0.56, 0.7, 0.85]

const ROUTE_STOPS: [number, [number, number, number]][] = [
  [0.0, [251, 131, 232]],
  [0.2, [252, 144, 207]],
  [0.44, [254, 179, 136]],
  [0.7, [218, 175, 244]],
  [1.0, [97, 96, 230]],
]

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smooth(t: number) {
  t = clamp(t, 0, 1)
  return t * t * (3 - 2 * t)
}

function smoother(t: number) {
  t = clamp(t, 0, 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function easeOutCubic(t: number) {
  t = clamp(t, 0, 1)
  const u = 1 - t
  return 1 - u * u * u
}

function routeColorAt(t: number): string {
  const c = clamp(t, 0, 1)
  for (let i = 1; i < ROUTE_STOPS.length; i++) {
    if (c <= ROUTE_STOPS[i][0]) {
      const a = ROUTE_STOPS[i - 1]
      const b = ROUTE_STOPS[i]
      const u = (c - a[0]) / (b[0] - a[0] || 1)
      const r = Math.round(lerp(a[1][0], b[1][0], u))
      const g = Math.round(lerp(a[1][1], b[1][1], u))
      const bl = Math.round(lerp(a[1][2], b[1][2], u))
      return `rgb(${r},${g},${bl})`
    }
  }
  const last = ROUTE_STOPS[ROUTE_STOPS.length - 1][1]
  return `rgb(${last[0]},${last[1]},${last[2]})`
}

function monotoneSpline(pts: [number, number][]) {
  const n = pts.length
  const xs = new Array<number>(n)
  const ys = new Array<number>(n)
  for (let i = 0; i < n; i++) {
    xs[i] = pts[i][0]
    ys[i] = pts[i][1]
  }
  const dx = new Array<number>(n - 1)
  const dy = new Array<number>(n - 1)
  const s = new Array<number>(n - 1)
  for (let j = 0; j < n - 1; j++) {
    dx[j] = xs[j + 1] - xs[j]
    dy[j] = ys[j + 1] - ys[j]
    s[j] = dy[j] / dx[j]
  }
  const m = new Array<number>(n)
  m[0] = s[0]
  m[n - 1] = s[n - 2]
  for (let k = 1; k < n - 1; k++) {
    if (s[k - 1] * s[k] <= 0) {
      m[k] = 0
    } else {
      m[k] = (s[k - 1] + s[k]) * 0.5
    }
  }
  for (let q = 0; q < n - 1; q++) {
    if (s[q] === 0) {
      m[q] = 0
      m[q + 1] = 0
    } else {
      const a = m[q] / s[q]
      const b = m[q + 1] / s[q]
      const h = a * a + b * b
      if (h > 9) {
        const tau = 3 / Math.sqrt(h)
        m[q] = tau * a * s[q]
        m[q + 1] = tau * b * s[q]
      }
    }
  }
  return function evalAt(x: number) {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let lo = 0
    let hi = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xs[mid] <= x) lo = mid
      else hi = mid
    }
    const h = dx[lo]
    const t = (x - xs[lo]) / h
    const t2 = t * t
    const t3 = t2 * t
    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2
    return (
      h00 * ys[lo] +
      h10 * h * m[lo] +
      h01 * ys[lo + 1] +
      h11 * h * m[lo + 1]
    )
  }
}

const KNOTS_V4 = {
  camT: monotoneSpline([
    [0.0, 0.0],
    [0.03, 0.04],
    [0.06, 0.14],
    [0.09, 0.3],
    [0.12, 0.5],
    [0.15, 0.72],
    [0.18, 0.88],
    [0.21, 0.96],
    [0.24, 1.0],
    [0.78, 1.0],
    [0.81, 0.96],
    [0.84, 0.86],
    [0.87, 0.68],
    [0.9, 0.45],
    [0.93, 0.23],
    [0.96, 0.07],
    [1.0, 0.0],
  ]),
  theta: monotoneSpline([
    [0.0, 4.7124],
    [0.06, 4.74],
    [0.12, 4.82],
    [0.18, 4.97],
    [0.24, 5.2],
    [0.36, 6.22],
    [0.5, 7.67],
    [0.64, 9.12],
    [0.76, 10.15],
    [0.82, 10.38],
    [0.88, 10.47],
    [0.94, 10.51],
    [1.0, 10.52],
  ]),
  bank: monotoneSpline([
    [0.0, 0.0],
    [0.06, 0.06],
    [0.12, 0.24],
    [0.18, 0.6],
    [0.24, 0.9],
    [0.3, 1.0],
    [0.74, 1.0],
    [0.8, 0.85],
    [0.86, 0.45],
    [0.92, 0.12],
    [0.96, 0.02],
    [1.0, 0.0],
  ]),
  morph: monotoneSpline([
    [0.0, 0.0],
    [0.08, 0.04],
    [0.16, 0.2],
    [0.24, 0.55],
    [0.32, 0.88],
    [0.38, 1.0],
    [1.0, 1.0],
  ]),
  ringBAlpha: monotoneSpline([
    [0.0, 0.3],
    [0.26, 0.3],
    [0.32, 0.15],
    [0.38, 0.0],
    [0.82, 0.0],
    [0.9, 0.14],
    [0.96, 0.26],
    [1.0, 0.3],
  ]),
}

function lerpRing(a: RingSpec, b: RingSpec, t: number): RingSpec {
  return {
    rx: lerp(a.rx, b.rx, t),
    ry: lerp(a.ry, b.ry, t),
    rot: lerp(a.rot, b.rot, t),
    tilt: lerp(a.tilt, b.tilt, t),
    yaw: lerp(a.yaw, b.yaw, t),
  }
}

function ringBasis(r: RingSpec, S: number) {
  const rx = r.rx * S
  const ry = r.ry * S
  const cR = Math.cos(r.rot)
  const sR = Math.sin(r.rot)
  const cT = Math.cos(r.tilt)
  const sT = Math.sin(r.tilt)
  const cY = Math.cos(r.yaw)
  const sY = Math.sin(r.yaw)

  function lift(x2: number, y2: number): [number, number, number] {
    const x1 = x2 * cR - y2 * sR
    const y1 = x2 * sR + y2 * cR
    const yTilt = y1 * cT
    const zTilt = y1 * sT
    const x3 = x1 * cY + zTilt * sY
    const z3 = -x1 * sY + zTilt * cY
    return [x3, yTilt, z3]
  }

  return {
    U: lift(rx, 0),
    V: lift(0, ry),
  }
}

function ringPoint(
  basis: { U: [number, number, number]; V: [number, number, number] },
  theta: number
): [number, number, number] {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const U = basis.U
  const V = basis.V
  return [
    c * U[0] + s * V[0],
    c * U[1] + s * V[1],
    c * U[2] + s * V[2],
  ]
}

function ringTangent(
  basis: { U: [number, number, number]; V: [number, number, number] },
  theta: number
): [number, number, number] {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const U = basis.U
  const V = basis.V
  return [
    -s * U[0] + c * V[0],
    -s * U[1] + c * V[1],
    -s * U[2] + c * V[2],
  ]
}

/**
 * Reverse-engineered 3D Elliptical Spiral Orbit & Storyboard Workflow Ribbon
 * from microdose.studio/services (`services-ribbon.min.js`), adapted specifically
 * for the AIR Lab About page (`#/about`) using the exact About page content.
 */
export default function AboutRibbon() {
  const rootRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const ringARef = useRef<SVGPathElement | null>(null)
  const ringBRef = useRef<SVGPathElement | null>(null)
  const spiralRefs = useRef<(SVGPathElement | null)[]>([])
  const routeRef = useRef<SVGPathElement | null>(null)
  const routeGradRef = useRef<SVGLinearGradientElement | null>(null)
  const tipRef = useRef<HTMLSpanElement | null>(null)
  const captionRef = useRef<HTMLDivElement | null>(null)
  const stopRefs = useRef<(HTMLLIElement | null)[]>([])
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([])
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([])
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const svg = svgRef.current
    const ringAEl = ringARef.current
    const ringBEl = ringBRef.current
    const routeEl = routeRef.current
    const routeGrad = routeGradRef.current
    const tipEl = tipRef.current
    const captionEl = captionRef.current

    if (!root || !stage || !svg || !ringAEl || !ringBEl) return

    const STOP_COUNT = ABOUT_RIBBON_STOPS.length
    const START_ANGLE = Math.PI * 1.5
    const ARC_SPAN = TAU * 0.92
    const LAND = 0.18
    const LAP_END = 0.86
    const CLOSE_SPIN = 0
    const STOP_FADE = 0.022
    const DETAIL_HOLD = 0.25
    const DETAIL_FADE = 0.045
    const END_LIFT = 0.22
    const CAPTION_IN = 0.91
    const CAPTION_FULL = 0.985

    const stopAngles = new Float64Array(STOP_COUNT)
    const stopProgress = new Float64Array(STOP_COUNT)
    const stopReached = new Uint8Array(STOP_COUNT)
    const popTimers = new Array<number>(STOP_COUNT).fill(0)

    for (let i = 0; i < STOP_COUNT; i++) {
      const f = STOP_COUNT === 1 ? 0 : i / (STOP_COUNT - 1)
      stopAngles[i] = START_ANGLE + f * ARC_SPAN
      stopProgress[i] = lerp(LAND, LAP_END, f)
      const dot = dotRefs.current[i]
      if (dot) {
        dot.style.setProperty('--rt-dot', routeColorAt(f))
      }
    }

    let armed = false
    let stageW = 0
    let stageH = 0
    let tier: 'desktop' | 'tablet' | 'phone' = 'desktop'

    function pickTier(w: number, h: number): 'desktop' | 'tablet' | 'phone' {
      const shortSide = Math.min(w, h)
      if (w < 600 || shortSide < 500) return 'phone'
      if (w < 1024) return 'tablet'
      return 'desktop'
    }

    function applyTier(next: 'desktop' | 'tablet' | 'phone') {
      if (!root) return
      root.classList.toggle('rt--phone', next === 'phone')
      root.classList.toggle('rt--tablet', next === 'tablet')
      tier = next
    }

    function measure() {
      if (!stage || !svg || !root) return
      const rect = stage.getBoundingClientRect()
      stageW = Math.max(1, rect.width)
      stageH = Math.max(1, rect.height || window.innerHeight)
      svg.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`)
      const nextTier = pickTier(stageW, stageH)
      if (nextTier !== tier) applyTier(nextTier)
      if (nextTier === 'phone') {
        root.style.setProperty('--rt-stage', `${stageH}px`)
      } else {
        root.style.removeProperty('--rt-stage')
      }
    }

    function stageProgress(): number {
      if (!root) return 0
      const rect = root.getBoundingClientRect()
      const travel = root.offsetHeight - stageH
      if (travel <= 0) return 0
      return clamp(-rect.top / travel, 0, 1)
    }

    function stageView(
      p: number,
      basisA: { U: [number, number, number]; V: [number, number, number] }
    ) {
      const isPhone = tier === 'phone'
      const isTablet = tier === 'tablet'
      const CLOSE_ZOOM = isPhone ? 2.4 : isTablet ? 3.2 : 4.2
      const CLOSE_ANCHOR_X = isPhone ? 0.34 : isTablet ? 0.38 : 0.42
      const CLOSE_ANCHOR_Y = isPhone ? 0.46 : 0.5
      const FOLLOW_AHEAD = isPhone ? 0.08 : isTablet ? 0.14 : 0.18
      const FOLLOW_TANGENT_LERP = isPhone ? 0.25 : 0.35

      const camT = KNOTS_V4.camT(p)
      let theta = KNOTS_V4.theta(p)
      const bankAmt = KNOTS_V4.bank(p)
      const morphT = KNOTS_V4.morph(p)
      let ringBAlpha = KNOTS_V4.ringBAlpha(p)

      if (p < LAND) {
        const dIn = smoother(p / LAND)
        theta = START_ANGLE - (1 - dIn) * 0.28
      } else if (p <= LAP_END) {
        const uLap = (p - LAND) / (LAP_END - LAND)
        theta = START_ANGLE + uLap * ARC_SPAN
      } else {
        const uOut = smoother((p - LAP_END) / (1 - LAP_END))
        theta = START_ANGLE + ARC_SPAN + uOut * 0.35
      }

      const endT = p > LAP_END ? smoother((p - LAP_END) / (1 - LAP_END)) : 0
      const spin = p * CLOSE_SPIN * (1 - endT)

      if (p > LAP_END) {
        ringBAlpha = Math.max(ringBAlpha, endT * 0.3)
      }

      const followTheta = theta + FOLLOW_AHEAD * camT
      const focus = ringPoint(basisA, followTheta)
      const tan = ringTangent(basisA, theta)
      const tanF = ringTangent(basisA, followTheta)
      const tx = lerp(tan[0], tanF[0], FOLLOW_TANGENT_LERP)
      const ty = lerp(tan[1], tanF[1], FOLLOW_TANGENT_LERP)
      const desiredAngle = isPhone ? Math.PI * 0.5 : 0
      const bank = (desiredAngle - Math.atan2(ty, tx)) * bankAmt
      const zoom = Math.pow(CLOSE_ZOOM, camT)
      const ax = lerp(0.5, CLOSE_ANCHOR_X, camT) * stageW
      const ay =
        (lerp(0.5, CLOSE_ANCHOR_Y, camT) - END_LIFT * endT) * stageH

      return {
        camT,
        theta,
        spin,
        bank,
        zoom,
        fx: focus[0] * camT,
        fy: focus[1] * camT,
        fz: focus[2] * camT,
        ax,
        ay,
        morphT,
        ringBAlpha,
        endT,
      }
    }

    function makeProjector(view: ReturnType<typeof stageView>) {
      const cS = Math.cos(view.spin)
      const sS = Math.sin(view.spin)
      const cB = Math.cos(view.bank)
      const sB = Math.sin(view.bank)
      const PERSPECTIVE = 1400

      function spinPt(pt: [number, number, number]): [number, number, number] {
        return [
          pt[0] * cS + pt[2] * sS,
          pt[1],
          -pt[0] * sS + pt[2] * cS,
        ]
      }

      const fSpun = spinPt([view.fx, view.fy, view.fz])

      return function project(pt: [number, number, number]): [number, number] {
        const p = spinPt(pt)
        const dx = p[0] - fSpun[0]
        const dy = p[1] - fSpun[1]
        const dz = p[2] - fSpun[2]
        const rx = dx * cB - dy * sB
        const ry = dx * sB + dy * cB
        const persp = PERSPECTIVE / Math.max(220, PERSPECTIVE - dz)
        const scale = view.zoom * persp
        return [view.ax + rx * scale, view.ay + ry * scale]
      }
    }

    function sampleRingPath(
      basis: { U: [number, number, number]; V: [number, number, number] },
      project: (pt: [number, number, number]) => [number, number]
    ): string {
      let d = ''
      for (let i = 0; i <= SAMPLE_N; i++) {
        const theta = (i / SAMPLE_N) * TAU
        const pt = project(ringPoint(basis, theta))
        d +=
          (i === 0 ? 'M' : 'L') +
          pt[0].toFixed(1) +
          ' ' +
          pt[1].toFixed(1)
      }
      return d + 'Z'
    }

    function sampleArcPath(
      basis: { U: [number, number, number]; V: [number, number, number] },
      project: (pt: [number, number, number]) => [number, number],
      a0: number,
      a1: number
    ) {
      const span = a1 - a0
      if (span <= 0.0005) return null
      const steps = Math.max(
        6,
        Math.min(SAMPLE_N, Math.ceil((Math.abs(span) / TAU) * SAMPLE_N))
      )
      let d = ''
      let p0: [number, number] = [0, 0]
      let p1: [number, number] = [0, 0]
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const pt = project(ringPoint(basis, a0 + t * span))
        if (i === 0) p0 = pt
        if (i === steps) p1 = pt
        d +=
          (i === 0 ? 'M' : 'L') +
          pt[0].toFixed(1) +
          ' ' +
          pt[1].toFixed(1)
      }
      return { d, p0, p1 }
    }

    function routeSpanV5(p: number, theta: number) {
      let a1: number
      if (p < LAND) {
        const u = smoother(clamp(p / LAND, 0, 1))
        a1 = START_ANGLE - (1 - u) * 0.55
      } else if (p <= LAP_END) {
        a1 = theta
      } else {
        const o = smoother(clamp((p - LAP_END) / (1 - LAP_END), 0, 1))
        a1 = lerp(theta, START_ANGLE + TAU, o)
      }
      const head = clamp((p - 0.01) / (LAND * 0.5), 0, 1)
      const tail = 1 - smoother(clamp((p - 0.93) / 0.06, 0, 1))
      return {
        a0: START_ANGLE - 0.55,
        a1,
        alpha: Math.min(head, tail),
      }
    }

    function render(p: number) {
      if (!stageW || !stageH || !ringAEl || !ringBEl) return
      const S = Math.max(stageW, stageH)
      const basisA = ringBasis(RINGS_FIT.A, S)
      const view = stageView(p, basisA)
      const project = makeProjector(view)

      ringAEl.setAttribute('d', sampleRingPath(basisA, project))

      const morphedB = lerpRing(RINGS_FIT.B, RINGS_FIT.A, view.morphT)
      const basisB = ringBasis(morphedB, S)
      ringBEl.setAttribute('d', sampleRingPath(basisB, project))
      ringBEl.style.strokeOpacity = view.ringBAlpha.toFixed(3)

      // Multi-ring elliptical spiral family (as seen in Screenshot 3)
      // Interpolates between morphedB and RINGS_FIT.A and softly converges as the camera dives in
      const spiralVisibility = clamp(view.ringBAlpha / 0.3, 0, 1)
      for (let s = 0; s < SPIRAL_FRACTIONS.length; s++) {
        const spEl = spiralRefs.current[s]
        if (!spEl) continue
        if (spiralVisibility <= 0.01) {
          spEl.style.strokeOpacity = '0'
          continue
        }
        const frac = SPIRAL_FRACTIONS[s]
        const effFrac = lerp(frac, 1, view.morphT)
        const specS = lerpRing(RINGS_FIT.B, RINGS_FIT.A, effFrac)
        const basisS = ringBasis(specS, S)
        spEl.setAttribute('d', sampleRingPath(basisS, project))
        const op = (0.11 + 0.12 * Math.sin(frac * Math.PI)) * spiralVisibility
        spEl.style.strokeOpacity = op.toFixed(3)
      }

      // Route path + leading tip dot
      if (routeEl) {
        const span = routeSpanV5(p, view.theta)
        const arc =
          span.alpha > 0.002
            ? sampleArcPath(basisA, project, span.a0, span.a1)
            : null
        if (arc) {
          routeEl.setAttribute('d', arc.d)
          routeEl.style.strokeOpacity = span.alpha.toFixed(3)
          if (routeGrad) {
            const dx = arc.p1[0] - arc.p0[0]
            const dy = arc.p1[1] - arc.p0[1]
            if (dx * dx + dy * dy < 1) {
              routeGrad.setAttribute('x1', (arc.p0[0] - 1).toFixed(1))
              routeGrad.setAttribute('y1', arc.p0[1].toFixed(1))
              routeGrad.setAttribute('x2', (arc.p0[0] + 1).toFixed(1))
              routeGrad.setAttribute('y2', arc.p0[1].toFixed(1))
            } else {
              routeGrad.setAttribute('x1', arc.p0[0].toFixed(1))
              routeGrad.setAttribute('y1', arc.p0[1].toFixed(1))
              routeGrad.setAttribute('x2', arc.p1[0].toFixed(1))
              routeGrad.setAttribute('y2', arc.p1[1].toFixed(1))
            }
          }
          if (tipEl) {
            tipEl.style.transform = `translate3d(${arc.p1[0].toFixed(1)}px, ${arc.p1[1].toFixed(1)}px, 0)`
            tipEl.style.opacity = span.alpha.toFixed(3)
          }
        } else {
          routeEl.setAttribute('d', '')
          routeEl.style.strokeOpacity = '0'
          if (tipEl) tipEl.style.opacity = '0'
        }
      }

      // Stops along the ribbon
      const bandFade = view.camT
      for (let i = 0; i < STOP_COUNT; i++) {
        const stopEl = stopRefs.current[i]
        if (!stopEl) continue
        const sp = stopProgress[i]
        const appear = smooth((p - (sp - STOP_FADE)) / STOP_FADE)
        const alpha = appear * bandFade

        const reached = p >= sp ? 1 : 0
        if (reached !== stopReached[i]) {
          stopReached[i] = reached
          stopEl.classList.toggle('is-reached', !!reached)
          if (reached) {
            stopEl.classList.remove('is-popping')
            void stopEl.offsetWidth
            stopEl.classList.add('is-popping')
            if (popTimers[i]) window.clearTimeout(popTimers[i])
            popTimers[i] = window.setTimeout(() => {
              stopEl.classList.remove('is-popping')
              popTimers[i] = 0
            }, 620)
          } else {
            if (popTimers[i]) {
              window.clearTimeout(popTimers[i])
              popTimers[i] = 0
            }
            stopEl.classList.remove('is-popping')
          }
        }

        if (alpha <= 0.004) {
          stopEl.style.opacity = '0'
          continue
        }

        const pt = project(ringPoint(basisA, stopAngles[i]))
        const lift = (1 - appear) * 10
        stopEl.style.transform = `translate3d(${pt[0].toFixed(1)}px, ${(pt[1] + lift).toFixed(1)}px, 0)`
        stopEl.style.opacity = alpha.toFixed(3)

        const past = p - sp
        let detail = appear
        if (past > DETAIL_HOLD) {
          detail *= 1 - smooth((past - DETAIL_HOLD) / DETAIL_FADE)
        }
        detail *= bandFade
        const detailStr = detail.toFixed(3)
        if (nameRefs.current[i]) nameRefs.current[i]!.style.opacity = detailStr
        if (tagRefs.current[i]) tagRefs.current[i]!.style.opacity = detailStr
        if (numRefs.current[i]) numRefs.current[i]!.style.opacity = detailStr
      }

      // Caption at completion of orbit
      if (captionEl) {
        const cIn = easeOutCubic(
          (p - CAPTION_IN) / (CAPTION_FULL - CAPTION_IN)
        )
        const cLift = (1 - cIn) * 14
        captionEl.style.opacity = cIn.toFixed(3)
        captionEl.style.transform = `translate3d(0, calc(-50% + ${cLift.toFixed(1)}px), 0)`
        captionEl.style.pointerEvents = cIn > 0.5 ? 'auto' : 'none'
      }
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (!reducedMotion) {
      root.classList.add('rt--interactive')
      armed = true
    }

    measure()
    render(armed ? stageProgress() : 0)

    let rafId = 0
    function schedule() {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        render(armed ? stageProgress() : 0)
      })
    }

    const onScroll = () => {
      if (armed) schedule()
    }
    const onResize = () => {
      measure()
      schedule()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) window.cancelAnimationFrame(rafId)
      popTimers.forEach((t) => {
        if (t) window.clearTimeout(t)
      })
    }
  }, [])

  return (
    <section
      className="rt"
      ref={rootRef}
      aria-label="About AIR Lab Storyboard Workflow"
    >
      <div className="rt-stage" ref={stageRef}>
        <div className="rt-orbit" aria-hidden="true">
          <svg
            className="rt-rings rt-rings--under-nav"
            ref={svgRef}
            viewBox="0 0 1440 810"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient
                id="rt-route-grad"
                ref={routeGradRef}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="1440"
                y2="0"
              >
                <stop offset="0%" stopColor="#fb83e8" />
                <stop offset="20%" stopColor="#fc90cf" />
                <stop offset="44%" stopColor="#feb388" />
                <stop offset="70%" stopColor="#daaff4" />
                <stop offset="100%" stopColor="#6160e6" />
              </linearGradient>
            </defs>
            {SPIRAL_FRACTIONS.map((_, idx) => (
              <path
                key={`spiral-${idx}`}
                className="rt-ring-spiral"
                ref={(el) => {
                  spiralRefs.current[idx] = el
                }}
              />
            ))}
            <path className="rt-ring" data-ring="b" ref={ringBRef} />
            <path className="rt-ring" data-ring="a" ref={ringARef} />
            <path className="rt-route" ref={routeRef} />
          </svg>
          <span className="rt-tip" ref={tipRef} />
        </div>

        <ol className="rt-stops">
          {ABOUT_RIBBON_STOPS.map((stop, idx) => (
            <li
              key={stop.num}
              className="rt-stop"
              ref={(el) => {
                stopRefs.current[idx] = el
              }}
            >
              <span
                className="rt-stop-dot"
                ref={(el) => {
                  dotRefs.current[idx] = el
                }}
                aria-hidden="true"
              />
              <div className="rt-stop-head">
                <span
                  className="rt-stop-num"
                  ref={(el) => {
                    numRefs.current[idx] = el
                  }}
                >
                  {stop.num}
                </span>
                <span
                  className="rt-stop-name"
                  ref={(el) => {
                    nameRefs.current[idx] = el
                  }}
                >
                  {stop.name}
                </span>
              </div>
              <span
                className="rt-stop-tag"
                ref={(el) => {
                  tagRefs.current[idx] = el
                }}
              >
                {stop.tag}
              </span>
            </li>
          ))}
        </ol>

        <div className="rt-caption" ref={captionRef}>
          <p className="rt-caption-line">
            Every project begins with one question:
          </p>
          <p className="rt-caption-line font-semibold">
            What do the people of Pakistan need?
          </p>
          <Link
            to="/projects"
            className="rt-pill inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink-dark)] text-white text-sm font-medium hover:bg-[var(--accent-orange)] transition-colors shadow-sm"
          >
            <span>Explore Our Projects</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
