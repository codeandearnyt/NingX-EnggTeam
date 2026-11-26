---
name: ui-22-embedded-3d
description: Embed a real 3D model in a page with Three.js or Spline, with a strict performance budget and a fallback. Use for product showcases, hero objects, configurators, and any page where the reference standard is spline.design and a static render would not show enough.
metadata:
  origin: ningx
  ui-type: 22
  reference: https://spline.design
---

# UI Type 22 — Embedded 3D Object

One real 3D model, embedded, usually interactive. Not a scene — an object.

**Reference standard:** spline.design

## When to reach for it

- The product has a shape that matters (hardware, furniture, packaging)
- Rotation reveals something a photo cannot
- The budget allows 1–2MB of 3D assets
- You can decimate and optimise the model

Do not embed 3D for a SaaS dashboard. There is nothing to rotate.

## The budget first

Before writing a line, commit to these numbers:

| Metric | Budget |
|---|---|
| Model file (glb/draco) | < 2 MB |
| Total 3D JS (three.js tree-shaken) | < 180 KB gzip |
| Textures | < 1 MB total, ≤ 2048² |
| Triangles | < 150k |
| Draw calls | < 30 |
| Time to first render | < 2s after lazy load |
| Frame rate | 60fps desktop, ≥ 30fps mid-tier mobile |

If the model cannot fit, decimate it. A 20MB hero model is a failed build regardless of how it looks.

## The architecture

```
<canvas> is lazy, below the fold, and stops when off-screen.
```

```js
// 1. IntersectionObserver gates loading
// 2. Dynamic import so three.js is not in the main bundle
// 3. requestAnimationFrame stops when hidden
// 4. A static poster image shows until the first frame
```

All four. Not three.

## Minimal Three.js scene

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export async function initObject(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));   // cap at 2
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();

  // Environment lighting beats scene lights: cheaper and better looking
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.4, 4);

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/object.glb');
  const model = gltf.scene;
  model.traverse(o => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  scene.add(model);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let running = true;
  const clock = new THREE.Clock();

  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    model.rotation.y = Math.sin(t * 0.25) * 0.4;   // slow idle sway
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  return {
    pause() { running = false; },
    resume() { if (!running) { running = true; frame(); } },
    dispose() {
      running = false;
      renderer.dispose();
      scene.traverse(o => {
        if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); }
      });
    },
  };
}
```

## Loading strategy

```js
const canvas = document.querySelector('[data-3d]');
const io = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  io.disconnect();

  // dynamic import — three.js never enters the main bundle
  const { initObject } = await import('/js/object3d.js');
  const viewer = await initObject(canvas);

  canvas.closest('[data-3d-wrap]').dataset.loaded = 'true';

  // stop rendering when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    document.hidden ? viewer.pause() : viewer.resume();
  });
}, { rootMargin: '200px' });

io.observe(canvas);
```

`rootMargin: '200px'` starts loading slightly before it is visible. That is the difference between "loads when you arrive" and "already there."

## Tokens / layout

```css
:root {
  --bg: #0a0a0c;
  --surface: #121215;
  --ink: #f5f5f7;
  --ink-soft: #9a9aa3;
  --accent: #e8e8ed;

  --font-body: "Inter", system-ui, sans-serif;
  --font-display: "Instrument Serif", Georgia, serif;

  --stage-h: min(70vh, 620px);
}
```

## Anatomy

```
<div class="stage" data-3d-wrap>
  <img class="poster" src="poster.avif" alt="...">   ← first paint
  <canvas data-3d aria-label="..."></canvas>         ← replaces it
  <p class="hint">Drag to rotate</p>
</div>
```

The poster is not a fallback — it is the **first paint**. The canvas fades in over it.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Orbit One — the object</title>
<style>
  :root{
    --bg:#0a0a0c; --surface:#121215; --ink:#f5f5f7; --ink-soft:#9a9aa3;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --font-display:"Instrument Serif",Georgia,serif;
    --stage-h:min(70vh,620px);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased}

  .wrap{max-width:1100px;margin:0 auto;padding:0 clamp(1.25rem,4vw,2rem)}

  /* hero copy */
  .intro{padding:clamp(4rem,10vw,7rem) 0 2rem;text-align:center}
  .intro h1{font-family:var(--font-display);font-size:clamp(2.5rem,6vw,4.5rem);
            font-weight:400;letter-spacing:-.02em;line-height:1.05;margin:0 0 1rem}
  .intro p{color:var(--ink-soft);max-width:44ch;margin:0 auto}

  /* ---------- 3d stage ---------- */
  .stage{
    position:relative;height:var(--stage-h);margin:2rem 0 1rem;
    border-radius:20px;overflow:hidden;
    background:radial-gradient(ellipse at 50% 30%,#1a1a20 0%,var(--bg) 70%);
    border:1px solid #1e1e24;
    contain:layout paint;
  }
  .stage img.poster{
    position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
    transition:opacity 500ms ease;
  }
  .stage canvas{
    position:absolute;inset:0;width:100%;height:100%;display:block;
    opacity:0;transition:opacity 500ms ease;touch-action:pan-y;
  }
  .stage[data-loaded="true"] canvas{opacity:1}
  .stage[data-loaded="true"] img.poster{opacity:0}

  .hint{
    position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);
    font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;
    color:var(--ink-soft);background:rgb(10 10 12/.7);
    padding:.375rem .75rem;border-radius:999px;
    border:1px solid #26262e;backdrop-filter:blur(8px);
    pointer-events:none;opacity:0;transition:opacity 400ms ease;
  }
  .stage[data-loaded="true"] .hint{opacity:1}

  /* specs */
  .specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
         gap:1px;background:#1e1e24;border:1px solid #1e1e24;border-radius:14px;
         overflow:hidden;margin:2rem 0 4rem}
  .spec{background:var(--surface);padding:1.25rem}
  .spec dt{font-size:.6875rem;letter-spacing:.14em;text-transform:uppercase;
           color:var(--ink-soft);margin:0 0 .375rem}
  .spec dd{margin:0;font-size:1.125rem;letter-spacing:-.01em;
           font-variant-numeric:tabular-nums}

  @media (prefers-reduced-motion:reduce){
    .stage img.poster,.stage canvas,.hint{transition:none}
  }
</style>
</head>
<body>

<div class="wrap">
  <header class="intro">
    <h1>Orbit One</h1>
    <p>A single machined body, 42mm, titanium. Turn it.</p>
  </header>

  <div class="stage" data-3d-wrap>
    <img class="poster" src="/img/orbit-poster.avif" width="1100" height="620"
         alt="Orbit One watch, three-quarter view, titanium case on a grey surface">
    <canvas data-3d aria-label="Interactive 3D model of the Orbit One watch. Drag to rotate."></canvas>
    <p class="hint">Drag to rotate</p>
  </div>

  <dl class="specs">
    <div class="spec"><dt>Case</dt><dd>Titanium, 42mm</dd></div>
    <div class="spec"><dt>Movement</dt><dd>Automatic, 72h</dd></div>
    <div class="spec"><dt>Water</dt><dd>200m</dd></div>
    <div class="spec"><dt>Weight</dt><dd>58g</dd></div>
  </dl>
</div>

<script type="module">
  const stage  = document.querySelector('[data-3d-wrap]');
  const canvas = stage.querySelector('canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Reduced motion: never initialise. The poster is the product.
  if (reduce.matches) {
    stage.dataset.loaded = 'false';
  } else {
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      try {
        const { initObject } = await import('/js/object3d.js');
        const viewer = await initObject(canvas);
        stage.dataset.loaded = 'true';
        document.addEventListener('visibilitychange', () => {
          document.hidden ? viewer.pause() : viewer.resume();
        });
      } catch (err) {
        console.warn('[3d] failed to initialise, keeping poster:', err);
        stage.dataset.loaded = 'false';   // poster stays
      }
    }, { rootMargin: '200px' });
    io.observe(canvas);
  }
</script>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Load the model before the fold content | Delays LCP for a decoration |
| No poster image | Blank box until the model loads |
| `setPixelRatio(devicePixelRatio)` uncapped | 3× DPR on a phone = 9× the pixels |
| Keep rendering when off-screen | Battery drain, thermal throttle |
| Use scene lights instead of an environment map | Worse looking and more expensive |
| Ship a 20MB model | Failed build, no exceptions |
| No `dispose()` | Memory leak on route change |
| Make it the only way to see the product | The poster must show it too |
| Orbit controls with full 360° on a product | Let them see the back, not the underside |

## Optimisation checklist

1. **Draco or Meshopt** compress the geometry — 5–10× smaller
2. **KTX2 / Basis** for textures — GPU-compressed, 4–6× smaller
3. **Decimate** in Blender to under 150k tris
4. **Bake** lighting into the environment map, drop scene lights
5. **Merge** meshes by material to cut draw calls
6. **Cap DPR at 2**, drop to 1.5 on mobile
7. **`powerPreference: 'high-performance'`** on the renderer
8. **Pause** on `visibilitychange` and when off-screen

## Accessibility notes

- The canvas needs `aria-label` describing what it is and how to interact
- The poster carries the real content — it must be a good image with good `alt`
- Keyboard users cannot drag — provide a button to toggle a slow auto-rotate, or accept the static poster as the accessible view
- `prefers-reduced-motion` must skip initialisation entirely, not just slow the rotation
- Never make the 3D object the only source of information

## Self-check before reporting

- [ ] Model under 2MB, textures under 1MB
- [ ] Poster image present and correct before load
- [ ] `IntersectionObserver` gates loading
- [ ] Three.js loaded via dynamic `import()`
- [ ] `setPixelRatio` capped at 2
- [ ] `requestAnimationFrame` stops when hidden
- [ ] `dispose()` implemented
- [ ] `prefers-reduced-motion` skips init
- [ ] Canvas has `aria-label`
