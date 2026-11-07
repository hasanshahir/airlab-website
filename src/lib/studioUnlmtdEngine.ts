// Studio Unlmtd Reverse-Engineered WebGL Liquid Swirl, Particle Pour, Iris Menu & Scroll Reveal Engine

export const LIQUID_CONFIG = {
  strength: 0.5,
  driftSpeed: 0.04,
  tilt: 0.84,
  dissipation: 0.985,
  falloff: 0.22,
  flowSize: 256,
  spill: 0.08,
  marks: 0.32,
  velocityScale: 0.6,
  maxDpr: 2,
};

export const GRADIENT_STOPS: [number, string][] = [
  [0, '#0655bb'],
  [0.1, '#3262ed'],
  [0.2, '#7157f5'],
  [0.3, '#c94eea'],
  [0.4, '#ef5dd0'],
  [0.5, '#ff82b4'],
  [0.58, '#ffa576'],
  [0.64, '#ff915c'],
  [0.72, '#ff747d'],
  [0.8, '#f765bd'],
  [0.88, '#bc55e8'],
  [0.95, '#219cf5'],
  [1, '#5ce0ef'],
];

const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0., 1.);
  }
`;

const FLOW_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tMap;
  uniform float uAspect, uFalloff, uDissipation, uDelta;
  uniform vec2 uMouse, uVelocity;
  void main() {
    vec3 prev = texture2D(tMap, vUv).rgb * 2. - 1.;
    prev = sign(prev) * max(abs(prev) * uDissipation - 0.008 * uDelta, 0.);
    vec2 c = vUv - uMouse;
    c.x *= uAspect;
    float f = smoothstep(uFalloff, 0., length(c));
    vec3 stamp = vec3(uVelocity, 1. - pow(1. - min(1., length(uVelocity)), 3.));
    gl_FragColor = vec4(mix(prev, stamp, f) * 0.5 + 0.5, 1.);
  }
`;

const COMPOSITE_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tMask, tFill, tFlow, tParticles;
  uniform vec2 uWord, uParticleTexel;
  uniform float uParticlesActive, uParticleFinish;
  uniform float uStrength, uOffset, uTilt, uAspect;
  void main() {
    float alpha = texture2D(tMask, vUv).a;
    vec3 flow = texture2D(tFlow, vUv).rgb * 2. - 1.;
    float dx = vUv.x - uWord.x;
    float dy = (0.5 - vUv.y) / uAspect;
    float u = (dx + dy * uTilt) / uWord.y;
    u -= (flow.x + 0.5 * flow.y) * uStrength;
    u -= uOffset;
    vec3 ink = texture2D(tFill, vec2(u * 0.5, 0.5)).rgb;
    if (uParticlesActive > 0.5) {
      vec4 material = texture2D(tParticles, vUv);
      float coverage = smoothstep(0.0325, 0.055, material.a);
      vec3 pigment = material.rgb / max(material.a, 0.003);
      float left = texture2D(tParticles, vUv - vec2(uParticleTexel.x * 2., 0.)).a;
      float right = texture2D(tParticles, vUv + vec2(uParticleTexel.x * 2., 0.)).a;
      float bottom = texture2D(tParticles, vUv - vec2(0., uParticleTexel.y * 2.)).a;
      float top = texture2D(tParticles, vUv + vec2(0., uParticleTexel.y * 2.)).a;
      vec3 normal = normalize(vec3((left - right) * 3., (bottom - top) * 3., 0.32));
      float light = max(0., dot(normal, normalize(vec3(-0.4, 0.6, 1.))));
      float edge = 1. - smoothstep(0.045, 0.13, material.a);
      float specular = pow(light, 24.) * 0.22 * edge;
      pigment = pigment * (0.96 + light * 0.04) + specular;
      ink = mix(pigment, ink, uParticleFinish);
      alpha = texture2D(tMask, vUv).a * mix(coverage, 1., uParticleFinish);
    }
    gl_FragColor = vec4(ink * alpha, alpha);
  }
`;

// Helper: compile program and extract uniform locations
function createProgramInfo(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
): { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> } {
  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(info || 'Shader compile error');
    }
    return shader;
  };
  const program = gl.createProgram()!;
  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || 'Program link error');
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) {
      uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
  }
  return { program, uniforms };
}

function createTexture(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  data: ArrayBufferView | null,
  wrap: number = gl.CLAMP_TO_EDGE
): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return tex;
}

function createPingPongFBO(gl: WebGLRenderingContext, size: number) {
  const makeTarget = () => {
    const initial = new Uint8Array(size * size * 4).fill(128);
    const texture = createTexture(gl, size, size, initial);
    const framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { framebuffer, texture };
  };
  const targets = [makeTarget(), makeTarget()];
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return {
    get read() {
      return targets[0];
    },
    get write() {
      return targets[1];
    },
    swap() {
      targets.reverse();
    },
    destroy() {
      targets.forEach((t) => {
        gl.deleteFramebuffer(t.framebuffer);
        gl.deleteTexture(t.texture);
      });
    },
  };
}

export function sampleGradientColor(phase: number): string {
  let t = ((phase * 0.5) % 1 + 1) % 1;
  t = t <= 0.5 ? t * 2 : (1 - t) * 2;
  const parseHex = (hex: string) => [1, 3, 5].map((idx) => parseInt(hex.slice(idx, idx + 2), 16));
  for (let i = 1; i < GRADIENT_STOPS.length; i++) {
    const [p0, c0] = GRADIENT_STOPS[i - 1];
    const [p1, c1] = GRADIENT_STOPS[i];
    if (t <= p1) {
      const f = (t - p0) / (p1 - p0);
      const rgb0 = parseHex(c0);
      const rgb1 = parseHex(c1);
      return `rgb(${rgb0.map((v, idx) => Math.round(v + (rgb1[idx] - v) * f)).join(',')})`;
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length - 1][1];
}

function createGradientTexture(gl: WebGLRenderingContext): WebGLTexture {
  const width = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  GRADIENT_STOPS.forEach(([stop, color]) => {
    grad.addColorStop(stop / 2, color);
    grad.addColorStop(1 - stop / 2, color);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, 1);
  const tex = createTexture(gl, width, 1, null, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  return tex;
}

// Glyph rasterizer for .liquid-word
function createWordRasterizer(el: HTMLElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const anyCtx = ctx as unknown as Record<string, unknown>;
  const hasLetterSpacing = typeof anyCtx.letterSpacing !== 'undefined';
  const fontDot = getComputedStyle(document.documentElement).getPropertyValue('--font-dot').trim();

  const drawLine = (
    text: string,
    x: number,
    centered: boolean,
    y: number,
    letterSpacing: string,
    wordSpacing = '0px'
  ) => {
    const alignX = (w: number) => (centered ? x - w / 2 : x);
    if (typeof anyCtx.wordSpacing !== 'undefined') {
      anyCtx.wordSpacing = wordSpacing;
    }
    if (hasLetterSpacing && text.endsWith('.') && fontDot) {
      const mainText = text.slice(0, -1);
      const baseFont = ctx.font;
      anyCtx.letterSpacing = letterSpacing;
      ctx.textAlign = 'left';
      const mainWidth = ctx.measureText(mainText).width;
      ctx.font = baseFont.replace(/(\d+(?:\.\d+)?px).*$/, `$1 ${fontDot}`);
      const dotWidth = ctx.measureText('.').width;
      ctx.font = baseFont;
      const startX = alignX(mainWidth + dotWidth);
      ctx.fillText(mainText, startX, y);
      ctx.font = baseFont.replace(/(\d+(?:\.\d+)?px).*$/, `$1 ${fontDot}`);
      ctx.fillText('.', startX + mainWidth, y);
      ctx.font = baseFont;
      return mainWidth + dotWidth;
    }
    if (hasLetterSpacing) {
      anyCtx.letterSpacing = letterSpacing;
      ctx.textAlign = 'left';
      const w = ctx.measureText(text).width;
      ctx.fillText(text, alignX(w), y);
      return w;
    }
    const ls = parseFloat(letterSpacing) || 0;
    const widths = [...text].map((ch) => ctx.measureText(ch).width);
    const totalW = widths.reduce((a, b) => a + b, 0) + ls * (text.length - 1);
    ctx.textAlign = 'left';
    let curX = alignX(totalW);
    [...text].forEach((ch, idx) => {
      ctx.fillText(ch, curX, y);
      curX += widths[idx] + ls;
    });
    return totalW;
  };

  const extractLines = (target: HTMLElement): string[] => {
    const lines: { top: number; text: string }[] = [];
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement?.closest('.liquid, .word-dot, .menu-dot')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const str = node.textContent ?? '';
      for (let i = 0; i < str.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getClientRects()[0];
        if (!rect || !rect.height || (!rect.width && str[i].trim())) continue;
        const existing = lines.find((l) => Math.abs(l.top - rect.top) < rect.height / 2);
        if (existing) {
          existing.text += str[i];
        } else {
          lines.push({ top: rect.top, text: str[i] });
        }
      }
    }
    const fallback = target.innerText.split('\n');
    return lines.length >= fallback.filter((s) => s.trim()).length
      ? lines.sort((a, b) => a.top - b.top).map((l) => l.text)
      : fallback;
  };

  return (box: { width: number; height: number }, dpr: number, rawWidth: number) => {
    const style = getComputedStyle(el);
    const lines = extractLines(el)
      .map((line) => (style.textTransform === 'uppercase' ? line.trim().toUpperCase() : line.trim()))
      .filter(Boolean);
    const fontSize = parseFloat(style.fontSize) || 48;
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 0.9;
    const capHeight = fontSize * 0.727;
    const isCenter = style.textAlign === 'center';
    const dotEl = el.querySelector('.word-dot, .menu-dot') as HTMLElement | null;
    const dotOffset = dotEl
      ? dotEl.offsetWidth + (parseFloat(getComputedStyle(dotEl).marginLeft) || 0)
      : 0;
    const lineX = (idx: number) =>
      isCenter
        ? box.width / 2 - (idx === lines.length - 1 ? dotOffset / 2 : 0)
        : (box.width - rawWidth) / 2 + (parseFloat(style.paddingLeft) || 0);
    const lastLineX = lineX(lines.length - 1);
    const startY = (box.height - lines.length * lineHeight) / 2;

    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, box.width, box.height);
    ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';

    let maxWordWidth = 0;
    lines.forEach((line, idx) => {
      const w = drawLine(
        line,
        lineX(idx),
        isCenter,
        startY + idx * lineHeight + (lineHeight + capHeight) / 2,
        style.letterSpacing,
        style.wordSpacing === 'normal' ? '0px' : style.wordSpacing
      );
      maxWordWidth = Math.max(maxWordWidth, w);
    });

    return {
      canvas,
      left: isCenter ? lastLineX - maxWordWidth / 2 : lastLineX,
      wordWidth: Math.max(1, maxWordWidth),
    };
  };
}

function createMaskBuilder(gl: WebGLRenderingContext, el: HTMLElement) {
  const rasterize = createWordRasterizer(el);
  return (box: { width: number; height: number }, dpr: number, rawWidth: number) => {
    const { canvas, left, wordWidth } = rasterize(box, dpr, rawWidth);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const mask = createTexture(gl, canvas.width, canvas.height, null);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    return {
      mask,
      source: canvas,
      word: [left / box.width, wordWidth / box.width] as [number, number],
    };
  };
}

function getSpillPadding(el: HTMLElement, width: number, height: number) {
  const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
  return {
    x: width * LIQUID_CONFIG.spill,
    y: Math.max(height * LIQUID_CONFIG.spill, fs * LIQUID_CONFIG.marks),
  };
}

function createPointerTracker(
  getRect: () => { left: number; top: number; width: number; height: number } | null,
  signal: AbortSignal
) {
  const state = {
    mouse: [-1, -1] as [number, number],
    velocity: [0, 0] as [number, number],
    eased: [0, 0] as [number, number],
    moved: false,
  };
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  window.addEventListener(
    'pointerdown',
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
    },
    { passive: true, signal }
  );
  window.addEventListener(
    'pointerup',
    () => {
      lastTime = 0;
    },
    { passive: true, signal }
  );
  window.addEventListener(
    'pointercancel',
    () => {
      lastTime = 0;
    },
    { passive: true, signal }
  );
  window.addEventListener(
    'pointermove',
    (e) => {
      const rect = getRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      state.mouse[0] = (e.clientX - rect.left) / rect.width;
      state.mouse[1] = 1 - (e.clientY - rect.top) / rect.height;
      const now = performance.now();
      if (lastTime) {
        const dt = Math.max(14, now - lastTime);
        state.velocity[0] = clamp(((e.clientX - lastX) / dt) * LIQUID_CONFIG.velocityScale);
        state.velocity[1] = clamp((-(e.clientY - lastY) / dt) * LIQUID_CONFIG.velocityScale);
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
      state.moved = true;
    },
    { passive: true, signal }
  );

  return {
    state,
    tick(dt: number) {
      if (!state.moved) {
        state.velocity[0] = 0;
        state.velocity[1] = 0;
        state.mouse[0] = -1;
        state.mouse[1] = -1;
      }
      state.moved = false;
      const rate = 1 - Math.pow(1 - (state.velocity[0] || state.velocity[1] ? 0.5 : 0.1), dt * 60);
      state.eased[0] += (state.velocity[0] - state.eased[0]) * rate;
      state.eased[1] += (state.velocity[1] - state.eased[1]) * rate;
    },
  };
}

function getWordStrengthMultiplier(el: HTMLElement): number {
  if (el.closest('.home-hero')) return 1;
  if (el.closest('.site-menu')) return 0.55;
  if (el.closest('.footer-cta')) return 0.85;
  return 0.7;
}

// Mounts a single WebGL liquid swirl canvas onto a `.liquid-word` element
export function mountLiquidWord(el: HTMLElement): (() => void) | null {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return null;

  // Avoid duplicate canvas
  const existingCanvas = el.querySelector('canvas.liquid');
  if (existingCanvas) existingCanvas.remove();

  const dotEl =
    (el.querySelector('.menu-dot, .word-dot') as HTMLElement | null) ??
    (el.nextElementSibling?.matches('.word-dot') ? (el.nextElementSibling as HTMLElement) : null);
  const parentLink = dotEl ? el.closest('a') : null;
  const pixelBuf = new Uint8Array(4);

  const canvas = document.createElement('canvas');
  canvas.className = 'liquid';
  canvas.setAttribute('aria-hidden', 'true');

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
  });
  if (!gl) return null;

  let flowProg: ReturnType<typeof createProgramInfo>;
  let compProg: ReturnType<typeof createProgramInfo>;
  try {
    flowProg = createProgramInfo(gl, VERTEX_SHADER, FLOW_FRAGMENT_SHADER);
    compProg = createProgramInfo(gl, VERTEX_SHADER, COMPOSITE_FRAGMENT_SHADER);
  } catch {
    return null;
  }

  const quadBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  for (const { program } of [flowProg, compProg]) {
    const loc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  const strengthMult = getWordStrengthMultiplier(el);
  const abortController = new AbortController();
  const fbo = createPingPongFBO(gl, LIQUID_CONFIG.flowSize);
  const buildMask = createMaskBuilder(gl, el);
  const fillTexture = createGradientTexture(gl);

  let box: { left: number; top: number; width: number; height: number } | null = null;
  let maskData: { mask: WebGLTexture; source: HTMLCanvasElement; word: [number, number] } | null =
    null;
  let aspect = 1;
  let destroyed = false;
  let rafId = 0;
  let isIntersecting = true;
  let lastTime = 0;
  let forceRender = false;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let dotUv: [number, number] = [1, 0.5];
  let frameCounter = 0;
  let activated = false;

  const pointer = createPointerTracker(() => {
    if (!box) return null;
    const r = canvas.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, abortController.signal);

  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]) {
        isIntersecting = entries[0].isIntersecting;
      }
    },
    { rootMargin: '100px' }
  );
  io.observe(el);

  function measureAndBuild() {
    if (destroyed) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const pad = getSpillPadding(el, rect.width, rect.height);
    box = {
      left: rect.left - pad.x,
      top: rect.top - pad.y,
      width: rect.width + 2 * pad.x,
      height: rect.height + 2 * pad.y,
    };
    if (dotEl) {
      const dr = dotEl.getBoundingClientRect();
      dotUv = [
        (dr.left - box.left) / box.width,
        1 - (dr.top + dr.height / 2 - box.top) / box.height,
      ];
    }
    aspect = box.width / box.height;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), LIQUID_CONFIG.maxDpr);
    const w = Math.max(1, Math.round(box.width * dpr));
    const h = Math.max(1, Math.round(box.height * dpr));
    const sizeChanged = canvas.width !== w || canvas.height !== h;
    if (sizeChanged) {
      canvas.width = w;
      canvas.height = h;
    }
    canvas.style.width = `${box.width}px`;
    canvas.style.height = `${box.height}px`;
    canvas.style.left = `${-pad.x}px`;
    canvas.style.top = `${-pad.y}px`;

    if (maskData) {
      gl!.deleteTexture(maskData.mask);
    }
    maskData = buildMask(box, dpr, rect.width);
    forceRender = true;
    if (sizeChanged) {
      renderFrame(performance.now());
    }
  }

  function loop(now: number) {
    if (destroyed) return;
    rafId = requestAnimationFrame(loop);
    renderFrame(now);
  }

  function renderFrame(now: number) {
    const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 1 / 60);
    lastTime = now;
    if (!maskData || !box || document.hidden || (!isIntersecting && !forceRender)) return;
    forceRender = false;

    pointer.tick(dt);
    const { mouse, eased } = pointer.state;
    const driftOffset = ((now * 0.001 * LIQUID_CONFIG.driftSpeed) % 2);

    // 1. Update ping-pong flow texture
    gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuffer);
    gl!.enableVertexAttribArray(0);
    gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
    gl!.disable(gl!.BLEND);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo.write.framebuffer);
    gl!.viewport(0, 0, LIQUID_CONFIG.flowSize, LIQUID_CONFIG.flowSize);
    gl!.useProgram(flowProg.program);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, fbo.read.texture);
    gl!.uniform1i(flowProg.uniforms.tMap, 0);
    gl!.uniform1f(flowProg.uniforms.uAspect, aspect);
    gl!.uniform1f(flowProg.uniforms.uFalloff, LIQUID_CONFIG.falloff);
    gl!.uniform1f(flowProg.uniforms.uDissipation, Math.pow(LIQUID_CONFIG.dissipation, dt * 60));
    gl!.uniform1f(flowProg.uniforms.uDelta, dt * 60);
    gl!.uniform2f(flowProg.uniforms.uMouse, mouse[0], mouse[1]);
    gl!.uniform2f(flowProg.uniforms.uVelocity, eased[0], eased[1]);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    fbo.swap();

    // 2. Render liquid composite into glyph mask
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(compProg.program);

    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, maskData.mask);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, fillTexture);
    gl!.activeTexture(gl!.TEXTURE2);
    gl!.bindTexture(gl!.TEXTURE_2D, fbo.read.texture);
    gl!.activeTexture(gl!.TEXTURE3);
    gl!.bindTexture(gl!.TEXTURE_2D, fillTexture);

    gl!.uniform1i(compProg.uniforms.tMask, 0);
    gl!.uniform1i(compProg.uniforms.tFill, 1);
    gl!.uniform1i(compProg.uniforms.tFlow, 2);
    gl!.uniform1i(compProg.uniforms.tParticles, 3);
    gl!.uniform1f(compProg.uniforms.uParticlesActive, 0);
    gl!.uniform2f(compProg.uniforms.uParticleTexel, 1, 1);
    gl!.uniform1f(compProg.uniforms.uParticleFinish, 1);
    gl!.uniform2f(compProg.uniforms.uWord, maskData.word[0], maskData.word[1]);
    gl!.uniform1f(compProg.uniforms.uStrength, LIQUID_CONFIG.strength * strengthMult);
    gl!.uniform1f(compProg.uniforms.uOffset, driftOffset);
    gl!.uniform1f(compProg.uniforms.uTilt, LIQUID_CONFIG.tilt);
    gl!.uniform1f(compProg.uniforms.uAspect, aspect);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    if (!activated) {
      activated = true;
      el.classList.add('liquid-active');
    }

    // 3. Sample live dot ink color every 4 frames
    if (
      dotEl &&
      frameCounter++ % 4 === 0 &&
      (!parentLink || parentLink.matches(':hover, :focus-visible') || dotEl.classList.contains('word-dot'))
    ) {
      const [uDot, vDot] = dotUv;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo.read.framebuffer);
      gl!.readPixels(
        Math.min(LIQUID_CONFIG.flowSize - 1, Math.max(0, Math.floor(uDot * LIQUID_CONFIG.flowSize))),
        Math.min(LIQUID_CONFIG.flowSize - 1, Math.max(0, Math.floor(vDot * LIQUID_CONFIG.flowSize))),
        1,
        1,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        pixelBuf
      );
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      const fx = (pixelBuf[0] / 255) * 2 - 1;
      const fy = (pixelBuf[1] / 255) * 2 - 1;
      const phase =
        (uDot - maskData.word[0] + ((0.5 - vDot) / aspect) * LIQUID_CONFIG.tilt) /
          maskData.word[1] -
        (fx + 0.5 * fy) * LIQUID_CONFIG.strength * strengthMult -
        driftOffset;
      const sampledColor = sampleGradientColor(phase);
      el.style.setProperty('--dot-ink', sampledColor);
      if (dotEl.parentElement !== el) {
        dotEl.style.setProperty('--dot-ink', sampledColor);
      }
    }
  }

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(rafId);
    if (resizeTimer) clearTimeout(resizeTimer);
    abortController.abort();
    io.disconnect();
    ro.disconnect();
    el.classList.remove('liquid-active');
    canvas.remove();
    if (maskData) gl.deleteTexture(maskData.mask);
    gl.deleteTexture(fillTexture);
    gl.deleteBuffer(quadBuffer);
    gl.deleteProgram(flowProg.program);
    gl.deleteProgram(compProg.program);
    fbo.destroy();
  };

  const ro = new ResizeObserver(() => {
    if (maskData) {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measureAndBuild, 100);
    }
  });

  canvas.addEventListener('webglcontextlost', cleanup, { signal: abortController.signal });

  const start = () => {
    if (destroyed) return;
    el.appendChild(canvas);
    measureAndBuild();
    ro.observe(el);
    window.addEventListener(
      'resize',
      () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measureAndBuild, 100);
      },
      { signal: abortController.signal }
    );
    rafId = requestAnimationFrame(loop);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }

  return cleanup;
}

// Hero [data-pour] animation (Studio Unlmtd's Al / Dl)
export function animateHeroPour(mainEl: HTMLElement): (() => void) | undefined {
  const h1 = mainEl.querySelector('h1[data-pour]') as HTMLElement | null;
  if (!h1) return;
  const word = h1.querySelector('.liquid-word') as HTMLElement | null;
  const dot = h1.querySelector('.word-dot') as HTMLElement | null;
  if (!word || !dot) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    word.style.clipPath = 'none';
    return;
  }

  const lineCount = Math.max(
    1,
    Math.round(word.getBoundingClientRect().height / (parseFloat(getComputedStyle(word).lineHeight) || 60))
  );

  const feather = 9;
  const applyPourMask = (progress: number) => {
    const masks: string[] = [];
    const sizes: string[] = [];
    const positions: string[] = [];
    for (let i = 0; i < lineCount; i++) {
      const lineP = Math.min(1, Math.max(0, progress * lineCount - (lineCount - 1 - i)));
      const edge = -feather + lineP * (100 + 2 * feather);
      masks.push(
        `linear-gradient(to left, #000 0%, #000 ${(edge - feather).toFixed(2)}%, transparent ${(edge + feather).toFixed(2)}%)`
      );
      sizes.push(`100% ${(100 / lineCount).toFixed(3)}%`);
      positions.push(`0 ${lineCount > 1 ? ((i * 100) / (lineCount - 1)).toFixed(3) : 0}%`);
    }
    const st = word.style as CSSStyleDeclaration & {
      webkitMaskImage?: string;
      webkitMaskSize?: string;
      webkitMaskPosition?: string;
      webkitMaskRepeat?: string;
    };
    st.maskImage = st.webkitMaskImage = masks.join(', ');
    st.maskSize = st.webkitMaskSize = sizes.join(', ');
    st.maskPosition = st.webkitMaskPosition = positions.join(', ');
    st.maskRepeat = st.webkitMaskRepeat = 'no-repeat';
  };

  const clearPourMask = () => {
    const st = word.style as CSSStyleDeclaration & {
      webkitMaskImage?: string;
      webkitMaskSize?: string;
      webkitMaskPosition?: string;
      webkitMaskRepeat?: string;
    };
    st.maskImage = st.webkitMaskImage = '';
    st.maskSize = st.webkitMaskSize = '';
    st.maskPosition = st.webkitMaskPosition = '';
    st.maskRepeat = st.webkitMaskRepeat = '';
    word.style.clipPath = 'none';
  };

  word.style.clipPath = 'none';
  applyPourMask(0);

  // Animate dot scale pop-in and word pour reveal
  dot.animate(
    [
      { transform: 'scale(0)', transformOrigin: '50% 50%' },
      { transform: 'scale(1.18)', transformOrigin: '50% 50%', offset: 0.7 },
      { transform: 'scale(1)', transformOrigin: '50% 50%' },
    ],
    {
      duration: 550,
      delay: 150,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'both',
    }
  );

  let rafId = 0;
  const startTime = performance.now() + 280;
  const duration = 1450;

  const tick = (now: number) => {
    if (now < startTime) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const t = Math.min(1, (now - startTime) / duration);
    // sine.inOut easing
    const eased = -(Math.cos(Math.PI * t) - 1) / 2;
    applyPourMask(eased);
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      clearPourMask();
    }
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    clearPourMask();
  };
}

// Circular Iris Clip-Path Controller for #site-menu (Studio Unlmtd's Qo & es)
export function getElementCenter(el: HTMLElement | null): { x: number; y: number } {
  if (!el) return { x: window.innerWidth - 48, y: 48 };
  const target = (el.querySelector('.burger, .menu-close-lines') as HTMLElement | null) ?? el;
  const rect = target.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function getMaxIrisRadius(origin: { x: number; y: number }): number {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return (
    Math.max(
      Math.hypot(origin.x, origin.y),
      Math.hypot(w - origin.x, origin.y),
      Math.hypot(origin.x, h - origin.y),
      Math.hypot(w - origin.x, h - origin.y)
    ) + 4
  );
}

export function syncMenuTheme(dialogEl: HTMLDialogElement, isHeaderDark: boolean) {
  // Studio Unlmtd's Jo() with oa.invert = true:
  // When header is light (bg #fff, ink #000), menu opens dark (--menu-paper: #000, --menu-ink: #fff)
  const menuDark = !isHeaderDark;
  dialogEl.style.setProperty('--menu-paper', menuDark ? '#000000' : '#ffffff');
  dialogEl.style.setProperty('--menu-ink', menuDark ? '#ffffff' : '#000000');
  dialogEl.style.setProperty('--line', menuDark ? '#424448' : 'rgba(0,0,0,0.2)');
  dialogEl.classList.toggle('menu-dark', menuDark);
}

// Scroll Reveal Engine (Studio Unlmtd's nc, Xs, Zs, $s, yl, gl)
const REVEAL_SELECTORS = {
  lines:
    'h1:not([data-pour]), h2.display, h2.story-heading, .founder-name, .years-title, .home-intro h2, .difference-heading h2, .capabilities-heading h2, .editorial-pair > h2, .project-masthead:not(.editorial-masthead) h1',
  block:
    '.intro-row > p, .tagline:not(.home-hero *), .lead, .home-intro-copy > p, .home-work-intro p, .editorial-pair > div, .studio-why-copy, .years-note, .founder-line, .founder-body, .founder-meta, .service-body, .service-proof, .reveal',
  image: '.project-visual:not(.opening-project *), .founder-portrait, .founders-portrait',
  stagger:
    '.convictions, .process, .changes-grid, .service-items, .difference-points, .editorial-three, .sectors, .capabilities-list, .services-index, .portfolio-grid',
};

function splitIntoLines(el: HTMLElement): HTMLElement[] {
  // Don't split elements that contain a WebGL liquid canvas or interactive buttons
  if (el.querySelector('.liquid-word')) {
    return [];
  }
  if (el.querySelector('.line-inner')) {
    return Array.from(el.querySelectorAll<HTMLElement>('.line-inner'));
  }
  const childNodes = Array.from(el.childNodes);
  const groups: Node[][] = [[]];
  for (const node of childNodes) {
    if (node instanceof HTMLBRElement) {
      groups.push([]);
    } else {
      groups[groups.length - 1].push(node);
    }
  }
  el.replaceChildren();
  const inners: HTMLElement[] = [];
  for (const group of groups) {
    if (!group.length) continue;
    const lineSpan = document.createElement('span');
    lineSpan.className = 'line';
    const innerSpan = document.createElement('span');
    innerSpan.className = 'line-inner';
    group.forEach((n) => innerSpan.appendChild(n));
    lineSpan.appendChild(innerSpan);
    el.appendChild(lineSpan);
    inners.push(innerSpan);
  }
  return inners;
}

export function mountPageAnimations(mainEl: HTMLElement): () => void {
  const abortController = new AbortController();
  const { signal } = abortController;
  const animations: Animation[] = [];

  // 1. Auto-append .link-dot to all .text-link elements (Studio Unlmtd's Pl)
  mainEl.querySelectorAll('.text-link').forEach((el) => {
    if (!el.querySelector('.link-dot')) {
      const dot = document.createElement('span');
      dot.className = 'link-dot';
      dot.setAttribute('aria-hidden', 'true');
      el.appendChild(dot);
    }
  });

  // 2. Opening Project Scroll Inset (Studio Unlmtd's yl)
  const openingProject = mainEl.querySelector('.opening-project') as HTMLElement | null;
  if (openingProject) {
    const updateInset = () => {
      const rect = openingProject.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = Math.min(1, Math.max(0, (vh * 0.94 - rect.top) / (vh * 0.6)));
      const smooth = t * t * (3 - 2 * t);
      const maxInset = window.innerWidth < 601 ? 6 : 13;
      openingProject.style.setProperty('--frame-inset', `${((1 - smooth) * maxInset).toFixed(2)}%`);
    };
    window.addEventListener('scroll', updateInset, { passive: true, signal });
    window.addEventListener('resize', updateInset, { passive: true, signal });
    updateInset();
  }

  // 3. Smooth <details> Accordions (Studio Unlmtd's gl)
  mainEl.querySelectorAll<HTMLDetailsElement>('.capabilities-list details').forEach((details) => {
    const summary = details.querySelector('summary');
    const content = details.querySelector(':scope > div') as HTMLElement | null;
    if (!summary) return;
    details.classList.add('smooth-details');
    let heightAnim: Animation | null = null;
    let contentAnim: Animation | null = null;
    let isOpen = details.open;

    const finishState = () => {
      if (heightAnim) {
        heightAnim.onfinish = null;
        heightAnim.cancel();
        heightAnim = null;
      }
      if (contentAnim) {
        contentAnim.cancel();
        contentAnim = null;
      }
      if (content) {
        content.style.opacity = '';
        content.style.transform = '';
      }
      details.open = isOpen;
      details.style.height = '';
      details.style.overflow = '';
      details.classList.toggle('is-expanded', isOpen);
      summary.setAttribute('aria-expanded', String(isOpen));
    };

    summary.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        const startHeight = details.getBoundingClientRect().height;
        if (heightAnim) {
          heightAnim.onfinish = null;
          heightAnim.cancel();
          heightAnim = null;
        }
        isOpen = !isOpen;
        details.classList.toggle('is-expanded', isOpen);
        summary.setAttribute('aria-expanded', String(isOpen));

        details.style.height = '';
        details.open = isOpen;
        const endHeight = details.getBoundingClientRect().height;
        details.open = true;
        details.style.height = `${startHeight}px`;
        details.style.overflow = 'hidden';

        if (contentAnim) {
          contentAnim.cancel();
          contentAnim = null;
        }

        if (isOpen) {
          heightAnim = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], {
            duration: 620,
            easing: 'cubic-bezier(0.34, 1.18, 0.64, 1)',
          });
          if (content) {
            content.style.opacity = '0';
            contentAnim = content.animate(
              [
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'none' },
              ],
              {
                duration: 520,
                delay: 90,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards',
              }
            );
          }
        } else {
          heightAnim = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], {
            duration: 440,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          });
          if (content) {
            contentAnim = content.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 180,
              easing: 'ease-out',
              fill: 'forwards',
            });
          }
        }
        heightAnim.onfinish = finishState;
      },
      { signal }
    );
    finishState();
  });

  // 4. Scroll-triggered Line, Block, Image & Stagger Reveals (Studio Unlmtd's nc)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    mainEl.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return () => abortController.abort();
  }

  type RevealKind = 'lines' | 'block' | 'image' | 'stagger';
  const revealTargets: { el: HTMLElement; kind: RevealKind; inners?: HTMLElement[] }[] = [];
  const seen = new Set<HTMLElement>();

  (['image', 'stagger', 'lines', 'block'] as RevealKind[]).forEach((kind) => {
    mainEl.querySelectorAll<HTMLElement>(REVEAL_SELECTORS[kind]).forEach((el) => {
      if (seen.has(el) || el.closest('.site-menu, dialog')) return;
      if (Array.from(seen).some((other) => other.contains(el))) return;

      if (kind === 'lines') {
        const inners = splitIntoLines(el);
        if (!inners.length) return;
        el.classList.add('has-lines');
        inners.forEach((inner) => {
          inner.style.transform = 'translateY(112%)';
        });
        seen.add(el);
        revealTargets.push({ el, kind, inners });
      } else if (kind === 'block') {
        el.style.opacity = '0';
        el.style.transform = 'translateY(36px)';
        seen.add(el);
        revealTargets.push({ el, kind });
      } else if (kind === 'image') {
        el.classList.add('has-image-reveal');
        el.style.setProperty('--reveal', '100%');
        const img = el.querySelector('img') as HTMLElement | null;
        if (img) img.style.transform = 'scale(1.14)';
        seen.add(el);
        revealTargets.push({ el, kind });
      } else if (kind === 'stagger') {
        const children = Array.from(el.children) as HTMLElement[];
        children.forEach((c) => {
          c.style.opacity = '0';
          c.style.transform = 'translateY(28px)';
        });
        seen.add(el);
        revealTargets.push({ el, kind });
      }
    });
  });

  const playReveal = (item: { el: HTMLElement; kind: RevealKind; inners?: HTMLElement[] }, delayMs = 0) => {
    const { el, kind, inners } = item;
    el.classList.add('is-visible');

    if (kind === 'lines' && inners) {
      inners.forEach((inner, idx) => {
        const anim = inner.animate(
          [{ transform: 'translateY(112%)' }, { transform: 'translateY(0%)' }],
          {
            duration: 800,
            delay: delayMs + idx * 50,
            easing: 'cubic-bezier(0.55, 0, 0.12, 1)',
            fill: 'forwards',
          }
        );
        anim.onfinish = () => {
          inner.style.transform = '';
          if (idx === inners.length - 1) el.classList.add('lines-done');
        };
        animations.push(anim);
      });
    } else if (kind === 'block') {
      const anim = el.animate(
        [
          { opacity: 0, transform: 'translateY(36px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        {
          duration: 750,
          delay: delayMs,
          easing: 'cubic-bezier(0.55, 0, 0.12, 1)',
          fill: 'forwards',
        }
      );
      anim.onfinish = () => {
        el.style.opacity = '';
        el.style.transform = '';
      };
      animations.push(anim);
    } else if (kind === 'image') {
      const startTime = performance.now() + delayMs;
      const dur = 1150;
      const stepReveal = (now: number) => {
        if (signal.aborted) return;
        if (now < startTime) {
          requestAnimationFrame(stepReveal);
          return;
        }
        const p = Math.min(1, (now - startTime) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.style.setProperty('--reveal', `${((1 - eased) * 100).toFixed(2)}%`);
        if (p < 1) {
          requestAnimationFrame(stepReveal);
        } else {
          el.classList.remove('has-image-reveal');
          el.style.removeProperty('--reveal');
        }
      };
      requestAnimationFrame(stepReveal);

      const img = el.querySelector('img') as HTMLElement | null;
      if (img) {
        const anim = img.animate([{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }], {
          duration: 1550,
          delay: delayMs,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        });
        anim.onfinish = () => {
          img.style.transform = '';
        };
        animations.push(anim);
      }
    } else if (kind === 'stagger') {
      const children = Array.from(el.children) as HTMLElement[];
      children.forEach((child, idx) => {
        const anim = child.animate(
          [
            { opacity: 0, transform: 'translateY(28px)' },
            { opacity: 1, transform: 'translateY(0px)' },
          ],
          {
            duration: 650,
            delay: delayMs + idx * 50,
            easing: 'cubic-bezier(0.55, 0, 0.12, 1)',
            fill: 'forwards',
          }
        );
        anim.onfinish = () => {
          child.style.opacity = '';
          child.style.transform = '';
        };
        animations.push(anim);
      });
    }
  };

  const vh = window.innerHeight;
  let cascadeIdx = 0;
  const observerMap = new Map<Element, typeof revealTargets[number][]>();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          const list = observerMap.get(entry.target) || [];
          list.forEach((item) => playReveal(item, 0));
          observerMap.delete(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
  );

  revealTargets.forEach((item) => {
    const rect = item.el.getBoundingClientRect();
    if (item.el.classList.contains('case-cover') || (rect.top < vh * 0.9 && rect.bottom > 0)) {
      playReveal(item, cascadeIdx * 40);
      cascadeIdx++;
    } else {
      const anchor = item.kind === 'image' ? item.el.parentElement ?? item.el : item.el;
      if (!observerMap.has(anchor)) {
        observerMap.set(anchor, []);
        io.observe(anchor);
      }
      observerMap.get(anchor)!.push(item);
    }
  });

  return () => {
    abortController.abort();
    io.disconnect();
    animations.forEach((a) => a.cancel());
  };
}

