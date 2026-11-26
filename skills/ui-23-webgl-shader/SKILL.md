---
name: ui-23-webgl-shader
description: Build WebGL and shader-driven UI where a fragment shader renders the page surface itself — grain, distortion, fluid, displacement, raymarched forms. Use for studio sites, awards-bait portfolios, brand experiences, and any page where the reference standard is lusion.co and a CSS gradient is not enough.
metadata:
  origin: ningx
  ui-type: 23
  reference: https://lusion.co
---

# UI Type 23 — WebGL & Shader-Driven

A fragment shader draws the surface. The page is computed, not composed.

**Reference standard:** lusion.co

## When to reach for it

- The surface itself is the product (studio, portfolio, brand film)
- You need an effect CSS cannot produce: fluid, grain, refraction, raymarching
- The device budget includes a GPU and you accept a fallback
- You have one strong visual idea, not five

Do not use it for a dashboard, a checkout, or anything where the shader competes with reading.

## The three-layer model

Every shader page is three layers, and confusing them is the usual failure:

```
1. CANVAS        fixed, behind content, z-index 0, pointer-events none
2. CONTENT       normal DOM, above, fully opaque, readable
3. INTERACTION   pointer/scroll values piped into uniforms
```

The shader is **never** the content. It is the atmosphere behind the content. Text on a live shader needs a scrim, always.

## Performance budget

| Metric | Budget |
|---|---|
| Shader compile | < 100ms |
| Frame time desktop | < 8ms (120fps headroom) |
| Frame time mobile | < 20ms |
| Resolution cap | `min(devicePixelRatio, 2)`, and 1.5 on mobile |
| Uniforms | < 20 |
| Texture samples per pixel | < 8 |
| Loop iterations in fragment | ≤ 64 (hard ceiling) |

If the fragment shader has an unbounded loop, the driver will hang the tab on a slow GPU. Bound every loop.

## The renderer — complete, no library

Raw WebGL2 is enough for a full-screen quad and costs nothing. This is the whole renderer:

```js
export function createShaderCanvas(canvas, fragSource) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  const VERT = `#version 300 es
  in vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const HEADER = `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  `;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(`shader compile failed: ${log}`);
    }
    return sh;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, HEADER + fragSource));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`link failed: ${gl.getProgramInfoLog(prog)}`);
  }
  gl.useProgram(prog);

  // full-screen triangle — 3 verts, no index buffer, no quad seam
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes    = gl.getUniformLocation(prog, 'u_res');
  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uMouse  = gl.getUniformLocation(prog, 'u_mouse');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');

  const state = { time: 0, mouse: [0.5, 0.5], scroll: 0, running: false, raf: 0 };

  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth  * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function frame(t) {
    if (!state.running) return;
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, state.time);
    gl.uniform2f(uMouse, state.mouse[0], state.mouse[1]);
    gl.uniform1f(uScroll, state.scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.raf = requestAnimationFrame(frame);
  }

  return {
    start() { if (!state.running) { state.running = true; state.raf = requestAnimationFrame(frame); } },
    stop()  { state.running = false; cancelAnimationFrame(state.raf); },
    setTime(v)   { state.time = v; },
    setMouse(x,y){ state.mouse = [x, y]; },
    setScroll(v) { state.scroll = v; },
    dispose() {
      this.stop();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
```

Three vertices covering the screen — the standard trick. A quad needs two triangles and can seam; the oversized triangle never does.

## A real fragment shader — film grain + displacement

This is the one used in the scaffold below. It is a complete shader, not a sketch:

```glsl
// hash without sine — stable across GPUs, unlike sin()-based noise
float hash21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {     // bounded: 5 iterations, fixed
    v += amp * vnoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  // slow domain warp — the "liquid" motion
  vec2 q = vec2(fbm(p * 1.6 + u_time * 0.04),
                fbm(p * 1.6 + vec2(5.2, 1.3) - u_time * 0.03));
  vec2 r = vec2(fbm(p * 2.4 + q * 2.0 + u_time * 0.02),
                fbm(p * 2.4 + q * 2.0 + vec2(1.7, 9.2)));

  float field = fbm(p * 3.0 + r * 1.8);

  // two-colour ramp
  vec3 deep = vec3(0.035, 0.039, 0.055);
  vec3 warm = vec3(0.290, 0.176, 0.110);
  vec3 hot  = vec3(0.910, 0.620, 0.310);

  vec3 col = mix(deep, warm, smoothstep(0.20, 0.62, field));
  col = mix(col, hot, smoothstep(0.72, 0.98, field) * 0.55);

  // pointer light — falls off with distance in normalised space
  float d = length(p - (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 2.0);
  col += vec3(0.30, 0.22, 0.12) * exp(-d * 2.6);

  // vignette
  float vig = smoothstep(1.25, 0.25, length(p));
  col *= mix(0.55, 1.0, vig);

  // film grain — animated, luminance-weighted so darks stay clean
  float grain = hash21(gl_FragCoord.xy + fract(u_time) * 91.7) - 0.5;
  col += grain * 0.045 * (0.35 + 0.65 * smoothstep(0.0, 0.4, dot(col, vec3(0.333))));

  // dither the ramp to kill banding on 8-bit displays
  col += (hash21(gl_FragCoord.xy * 0.37) - 0.5) / 255.0;

  outColor = vec4(col, 1.0);
}
```

Four things in there that matter and are usually missing:

1. **`hash21` without `sin()`** — `sin()`-based hashes differ across GPU vendors and produce visible patterns on some drivers.
2. **Bounded `fbm` loop** — `for (int i = 0; i < 5; i++)`, never `while`.
3. **Dither before output** — without it, smooth gradients band on every 8-bit panel.
4. **Luminance-weighted grain** — uniform grain on near-black looks like sensor noise, not film.

## Tokens / CSS shell

```css
:root {
  --bg: #07070a;
  --ink: #f4f1ea;
  --ink-soft: rgb(244 241 234 / 0.66);
  --scrim: rgb(7 7 10 / 0.72);

  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  --fs-display: clamp(2.75rem, 7vw, 6rem);
  --fs-body: 1.0625rem;
}

#shader {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  display: block;
}
```

## Anatomy

```
<canvas id="shader" aria-hidden="true">     fixed, behind, pointer-events none
<div class="scrim">                          gradient over the shader where text sits
<main>                                       normal DOM, z-index 1
<footer>                                     same
```

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Atelier Nord — surfaces</title>
<style>
  :root{
    --bg:#07070a; --ink:#f4f1ea; --ink-soft:rgb(244 241 234/.66);
    --font-display:"Fraunces",Georgia,serif;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --fs-display:clamp(2.75rem,7vw,6rem); --fs-body:1.0625rem;
  }
  *{box-sizing:border-box}
  html,body{background:var(--bg)}
  body{margin:0;color:var(--ink);font:var(--fs-body)/1.65 var(--font-body);
       -webkit-font-smoothing:antialiased}

  #shader{position:fixed;inset:0;width:100%;height:100%;z-index:0;
          pointer-events:none;display:block}

  /* fallback for no-WebGL: a static gradient that matches the shader's palette */
  .no-gl #shader{display:none}
  .no-gl body{background:
    radial-gradient(ellipse 90% 70% at 50% 0%,#3b2a1c 0%,#0a090c 62%)}

  .scrim{position:fixed;inset:0;z-index:1;pointer-events:none;
    background:radial-gradient(ellipse 80% 55% at 50% 42%,
      rgb(7 7 10/.78) 0%,rgb(7 7 10/.52) 55%,rgb(7 7 10/.12) 100%)}

  .wrap{position:relative;z-index:2;max-width:1080px;margin:0 auto;
        padding:0 clamp(1.25rem,5vw,3rem)}

  header{padding:1.75rem 0}
  .nav{display:flex;align-items:baseline;justify-content:space-between;gap:2rem}
  .brand{font-family:var(--font-display);font-size:1.125rem;letter-spacing:.14em;
         text-transform:uppercase;text-decoration:none;color:inherit}
  .nav ul{display:flex;gap:2rem;list-style:none;margin:0;padding:0;
          font-size:.8125rem;letter-spacing:.14em;text-transform:uppercase}
  .nav a{color:var(--ink-soft);text-decoration:none;transition:color 160ms ease}
  .nav a:hover{color:var(--ink)}

  .hero{min-height:88vh;display:grid;align-content:center;
        padding:clamp(4rem,10vw,8rem) 0}
  .hero .eyebrow{font-size:.75rem;letter-spacing:.22em;text-transform:uppercase;
                 color:var(--ink-soft);margin:0 0 1.75rem}
  h1{font-family:var(--font-display);font-weight:400;font-size:var(--fs-display);
     letter-spacing:-.03em;line-height:.98;margin:0 0 1.75rem;max-width:13ch;
     text-wrap:balance;text-shadow:0 2px 40px rgb(0 0 0/.55)}
  .hero p{max-width:46ch;color:var(--ink-soft);margin:0 0 2.5rem;
          text-shadow:0 1px 20px rgb(0 0 0/.7)}

  .link{display:inline-flex;align-items:center;gap:.625rem;min-height:48px;
        padding:0 1.5rem;border:1px solid rgb(244 241 234/.28);border-radius:999px;
        color:var(--ink);text-decoration:none;font-size:.875rem;
        letter-spacing:.1em;text-transform:uppercase;
        background:rgb(7 7 10/.45);backdrop-filter:blur(10px);
        transition:border-color 200ms ease,background-color 200ms ease}
  .link:hover{border-color:rgb(244 241 234/.6);background:rgb(7 7 10/.65)}

  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:1px;background:rgb(244 241 234/.1);border-top:1px solid rgb(244 241 234/.1);
        margin:0 0 clamp(4rem,10vw,7rem)}
  .cell{background:rgb(7 7 10/.55);padding:1.75rem 1.5rem;
        backdrop-filter:blur(6px)}
  .cell h2{font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;
           font-weight:500;color:var(--ink-soft);margin:0 0 .875rem}
  .cell p{margin:0;font-size:.9375rem;line-height:1.6;color:var(--ink)}

  a:focus-visible{outline:2px solid var(--ink);outline-offset:4px}

  @media (max-width:700px){
    .hero{min-height:74vh}
    .nav ul{display:none}
  }
  @media (prefers-reduced-motion:reduce){
    .link{transition:none}
  }
</style>
</head>
<body>

<canvas id="shader" aria-hidden="true"></canvas>
<div class="scrim" aria-hidden="true"></div>

<div class="wrap">
  <header>
    <nav class="nav" aria-label="Main">
      <a class="brand" href="/">Atelier Nord</a>
      <ul>
        <li><a href="#work">Work</a></li>
        <li><a href="#studio">Studio</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <p class="eyebrow">Material studies · 2026</p>
      <h1>We render surfaces that behave like weather.</h1>
      <p>Twelve studies in light, grain, and displacement — each computed in real time, none of them photographed.</p>
      <a class="link" href="#work">See the studies</a>
    </section>

    <section id="work" class="grid">
      <article class="cell">
        <h2>01 — Grain</h2>
        <p>Luminance-weighted noise, dithered to survive an 8-bit panel.</p>
      </article>
      <article class="cell">
        <h2>02 — Warp</h2>
        <p>Two-level domain distortion. Five octaves, bounded, no unbounded loops.</p>
      </article>
      <article class="cell">
        <h2>03 — Light</h2>
        <p>A single moving source with exponential falloff in normalised space.</p>
      </article>
    </section>
  </main>
</div>

<script type="module">
(() => {
  const canvas = document.getElementById('shader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const FRAG = `
  float hash21(vec2 p){
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, amp = 0.5;
    for (int i = 0; i < 5; i++){ v += amp * vnoise(p); p *= 2.02; amp *= 0.5; }
    return v;
  }
  void main(){
    vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
    vec2 q = vec2(fbm(p*1.6 + u_time*0.04), fbm(p*1.6 + vec2(5.2,1.3) - u_time*0.03));
    vec2 r = vec2(fbm(p*2.4 + q*2.0 + u_time*0.02), fbm(p*2.4 + q*2.0 + vec2(1.7,9.2)));
    float field = fbm(p*3.0 + r*1.8);
    vec3 deep = vec3(0.035,0.039,0.055);
    vec3 warm = vec3(0.290,0.176,0.110);
    vec3 hot  = vec3(0.910,0.620,0.310);
    vec3 col = mix(deep, warm, smoothstep(0.20,0.62,field));
    col = mix(col, hot, smoothstep(0.72,0.98,field)*0.55);
    float d = length(p - (u_mouse - 0.5) * vec2(u_res.x/u_res.y, 1.0) * 2.0);
    col += vec3(0.30,0.22,0.12) * exp(-d*2.6);
    col *= mix(0.55, 1.0, smoothstep(1.25,0.25,length(p)));
    float grain = hash21(gl_FragCoord.xy + fract(u_time)*91.7) - 0.5;
    col += grain * 0.045 * (0.35 + 0.65*smoothstep(0.0,0.4,dot(col,vec3(0.333))));
    col += (hash21(gl_FragCoord.xy*0.37) - 0.5) / 255.0;
    outColor = vec4(col, 1.0);
  }`;

  // ---------- capability check ----------
  const probe = document.createElement('canvas').getContext('webgl2');
  if (!probe) { document.documentElement.classList.add('no-gl'); return; }

  const gl = canvas.getContext('webgl2', {
    alpha: true, antialias: false,
    powerPreference: 'high-performance', premultipliedAlpha: false,
  });
  if (!gl) { document.documentElement.classList.add('no-gl'); return; }

  const VERT = `#version 300 es
  in vec2 a_pos;
  void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const HEADER = `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec2 u_res; uniform float u_time;
  uniform vec2 u_mouse; uniform float u_scroll;
  `;

  function compile(type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, HEADER + FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog));
    }
  } catch (err) {
    console.warn('[shader] falling back to CSS:', err);
    document.documentElement.classList.add('no-gl');
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes    = gl.getUniformLocation(prog, 'u_res');
  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uMouse  = gl.getUniformLocation(prog, 'u_mouse');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');

  const mouse = [0.5, 0.5];
  let scroll = 0, running = true, raf = 0, t0 = performance.now();
  let visible = true;

  addEventListener('pointermove', (e) => {
    mouse[0] = e.clientX / innerWidth;
    mouse[1] = 1 - e.clientY / innerHeight;
  }, { passive: true });

  addEventListener('scroll', () => {
    scroll = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && running) loop();
  });

  function resize(){
    const dpr = Math.min(devicePixelRatio, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth  * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h){
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now){
    if (!running || !visible) return;
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(draw);
  }

  function loop(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }

  // reduced motion: render exactly one frame, then stop
  if (reduce.matches) {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, 0);
    gl.uniform2f(uMouse, 0.5, 0.5);
    gl.uniform1f(uScroll, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    running = false;
  } else {
    loop();
    reduce.addEventListener('change', (e) => {
      if (e.matches) { running = false; cancelAnimationFrame(raf); }
      else { running = true; t0 = performance.now(); loop(); }
    });
  }
})();
</script>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Put text directly on the shader with no scrim | Contrast is unknowable and will fail |
| Use `sin()`-based hash noise | Vendor-dependent patterns, visible on some GPUs |
| Unbounded `while` loop in the fragment shader | Driver hang on slow GPUs. Bound everything. |
| Full `devicePixelRatio` with no cap | 3× DPR = 9× the fragments |
| Keep rendering when the tab is hidden | Battery drain and thermal throttling |
| Render at full rate under `prefers-reduced-motion` | Hard accessibility failure |
| Skip the dither | Visible banding on every 8-bit display |
| Ship without a no-WebGL fallback | Blank page on old hardware and in some VMs |
| Use a shader library for a full-screen quad | 180KB of three.js for one triangle |
| Compile the shader in the main thread at first paint | Blocks LCP. Defer past `DOMContentLoaded`. |

## Performance

Ranked by impact:

1. **Cap resolution.** Halving the buffer quarters the work. On mobile, `min(dpr, 1.5)`.
2. **Bound the loop.** 5 octaves of fbm is ~25 noise evaluations. 8 octaves is ~64 and will not run at 60fps on integrated graphics.
3. **Pause off-screen.** `visibilitychange` and `IntersectionObserver`.
4. **Precompile.** Never compile on the first frame the user sees.
5. **Reduce on `prefers-reduced-motion`** to a single static frame.
6. **Measure.** `gl.getExtension('EXT_disjoint_timer_query_webgl2')` for real GPU timings; otherwise watch frame time in DevTools.

## Accessibility notes

- The canvas is `aria-hidden="true"` — it carries no information
- Every word of meaning is in the DOM above it
- `prefers-reduced-motion: reduce` renders one static frame and stops
- Text over the shader needs the scrim, and the scrim must be measured against the **brightest** point the shader can produce
- Never gate content behind a shader load
- No flashing above 3Hz. Animated grain at 60fps is fine; a strobing uniform is not.

## Self-check before reporting

- [ ] Canvas is `position: fixed`, `pointer-events: none`, behind content
- [ ] Every loop in the fragment shader has a fixed bound
- [ ] `hash21` uses the multiply-fract form, not `sin()`
- [ ] Resolution capped at `min(dpr, 2)` (1.5 on mobile)
- [ ] Render stops on `visibilitychange`
- [ ] `prefers-reduced-motion` renders one frame and stops
- [ ] Scrim between shader and text
- [ ] Dither present before `outColor`
- [ ] No-WebGL fallback renders something readable
- [ ] Shader compile wrapped in try/catch with a fallback path
