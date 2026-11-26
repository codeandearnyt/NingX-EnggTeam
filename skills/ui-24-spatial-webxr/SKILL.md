---
name: ui-24-spatial-webxr
description: Build full 3D interactive and spatial WebXR experiences where content lives in a navigable scene and works with or without a headset. Use for product worlds, immersive portfolios, configurators, and any page where the reference standard is bruno-simon.com and a flat page would be the wrong medium entirely.
metadata:
  origin: ningx
  ui-type: 24
  reference: https://bruno-simon.com
---

# UI Type 24 — Full 3D Interactive / Spatial WebXR

Content lives in a navigable scene. The page is a place, not a document.

**Reference standard:** bruno-simon.com

## The rule that decides everything

**WebXR is a progressive enhancement. The 2D DOM experience is the product.**

If the site only works in a headset, it does not work. Design the flat path first, then add the spatial path on top. Every spatial build that skipped this step ships a blank screen to 97% of visitors.

## When to reach for it

- The product's value is spatial (architecture, hardware, interiors, games)
- Navigation through space is the point
- You have a 3D asset pipeline and a budget for it
- You accept the performance and accessibility cost

Do not build this for a landing page. A landing page is a document.

## The three render paths

Every spatial page must serve all three:

| Path | Trigger | What renders |
|---|---|---|
| **Flat** | No WebGL, or `prefers-reduced-motion`, or a low-power device | Full DOM page, static hero image |
| **Interactive 3D** | WebGL available, pointer input | Canvas scene, orbit/drag, DOM overlay |
| **Immersive XR** | `navigator.xr.isSessionSupported('immersive-vr')` | Stereo scene, controllers, locomotion |

One codebase, one scene graph, three entry points.

## The scene contract

```js
{
  scene,        // THREE.Scene
  camera,       // PerspectiveCamera
  renderer,     // WebGLRenderer
  update(dt),   // per-frame logic, dt in seconds, capped
  enterXR(),    // request session + set reference space
  exitXR(),
  dispose()     // release everything
}
```

Anything that does not fit this contract does not belong in the scene module.

## Locomotion — the part everyone gets wrong

In VR, movement causes sickness. The rules, in order of safety:

1. **Teleport** is the safe default. Point, release, fade, arrive.
2. **Snap turn** at 30° or 45°, never smooth rotation.
3. **Smooth locomotion** only as an opt-in, with a vignette during motion.
4. **Never** move the camera on a curve or a rail without a comfort mode.
5. **Never** accelerate. Constant velocity or instant.

```js
// teleport: fade out, move, fade in
async function teleport(xrCamera, target, rig) {
  await fade(1, 120);              // to black
  rig.position.set(target.x, 0, target.z);
  await fade(0, 180);              // back in
}
```

The fade is not decoration. It removes the vestibular mismatch that causes nausea.

## Performance budget — VR is 2× the cost

| Metric | Desktop flat | VR (per eye) |
|---|---|---|
| Frame time | < 11ms (90fps) | < 11ms (90fps, **both eyes**) |
| Draw calls | < 150 | < 80 |
| Triangles | < 500k | < 150k |
| Textures | < 40MB | < 20MB |
| Lights (dynamic) | ≤ 4 | ≤ 2 |

VR renders twice. If flat runs at 60fps, VR runs at 30 — below the sickness threshold. Budget accordingly from the start.

## Minimal WebXR entry — complete

```js
import * as THREE from 'three';

export async function initXR(renderer, scene, camera) {
  if (!navigator.xr) return null;

  const supported = await navigator.xr.isSessionSupported('immersive-vr');
  if (!supported) return null;

  renderer.xr.enabled = true;

  // controller models + ray lines
  const controllers = [0, 1].map((i) => {
    const c = renderer.xr.getController(i);
    c.addEventListener('selectstart', () => c.userData.onSelect?.());
    scene.add(c);

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    line.scale.z = 4;
    c.add(line);
    return c;
  });

  return {
    controllers,
    async enter() {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });
      await renderer.xr.setSession(session);
      renderer.xr.setReferenceSpaceType('local-floor');
      session.addEventListener('end', () => {
        document.documentElement.classList.remove('xr-active');
      });
      document.documentElement.classList.add('xr-active');
      return session;
    },
  };
}
```

`local-floor` puts the origin at the physical floor — without it the user is a metre underground.

## Tokens / DOM overlay

The DOM overlay is not optional. It is how non-XR visitors and screen readers get the content.

```css
:root {
  --bg: #0a0a0c;
  --surface: rgb(16 16 20 / 0.82);
  --ink: #f4f4f6;
  --ink-soft: rgb(244 244 246 / 0.62);
  --accent: #7dd3fc;
  --border: rgb(255 255 255 / 0.12);

  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;

  --overlay-blur: blur(16px);
  --radius: 14px;
}

.xr-active .overlay { display: none; }   /* hide 2D UI inside a headset */
```

## Anatomy

```
<canvas id="scene">                     full viewport, z-index 0
<div class="overlay">                    DOM UI, z-index 1, pointer-events on children only
  <nav class="hud">                      top: brand + enter-VR button
  <aside class="panel">                  right: current object info
  <div class="controls">                 bottom: rotate / reset / list
</div>
<div class="fallback">                   shown when WebGL is unavailable
```

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Studio Field — a room of objects</title>
<style>
  :root{
    --bg:#0a0a0c; --surface:rgb(16 16 20/.82); --ink:#f4f4f6;
    --ink-soft:rgb(244 244 246/.62); --accent:#7dd3fc; --border:rgb(255 255 255/.12);
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --font-mono:ui-monospace,"SF Mono",monospace;
    --radius:14px;
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{margin:0;background:var(--bg);color:var(--ink);overflow:hidden;
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased}

  #scene{position:fixed;inset:0;width:100%;height:100%;display:block;
         touch-action:none;cursor:grab}
  #scene:active{cursor:grabbing}

  .overlay{position:fixed;inset:0;z-index:1;pointer-events:none;
           display:grid;grid-template-rows:auto 1fr auto;
           padding:clamp(1rem,3vw,1.75rem)}
  .overlay > *{pointer-events:auto}

  /* ---- top hud ---- */
  .hud{display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .brand{font-family:var(--font-mono);font-size:.8125rem;letter-spacing:.22em;
         text-transform:uppercase;color:var(--ink);text-decoration:none}
  .hud__actions{display:flex;gap:.5rem}

  .btn{
    display:inline-flex;align-items:center;gap:.5rem;min-height:44px;
    padding:0 1.125rem;border-radius:999px;
    border:1px solid var(--border);background:var(--surface);
    backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    color:var(--ink);font:500 .8125rem/1 var(--font-body);
    letter-spacing:.04em;cursor:pointer;
    transition:border-color 160ms ease,background-color 160ms ease;
  }
  .btn:hover{border-color:rgb(255 255 255/.3);background:rgb(24 24 30/.9)}
  .btn[hidden]{display:none}
  .btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.75;
           stroke-linecap:round;stroke-linejoin:round}

  /* ---- side panel ---- */
  .panel{
    align-self:center;justify-self:end;max-width:min(320px,80vw);
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius);padding:1.25rem;
    backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    transition:opacity 240ms ease,transform 240ms ease;
  }
  .panel[data-empty="true"]{opacity:0;transform:translateX(12px);
                            pointer-events:none}
  .panel__tag{font-family:var(--font-mono);font-size:.6875rem;letter-spacing:.18em;
              text-transform:uppercase;color:var(--accent);margin:0 0 .625rem}
  .panel h1{font-size:1.125rem;font-weight:500;letter-spacing:-.01em;
            line-height:1.25;margin:0 0 .625rem}
  .panel p{margin:0;font-size:.875rem;line-height:1.55;color:var(--ink-soft)}
  .panel dl{display:grid;grid-template-columns:auto 1fr;gap:.375rem 1rem;
            margin:1rem 0 0;font-size:.8125rem}
  .panel dt{color:var(--ink-soft);font-family:var(--font-mono);font-size:.6875rem;
            letter-spacing:.1em;text-transform:uppercase;align-self:center}
  .panel dd{margin:0;font-variant-numeric:tabular-nums}

  /* ---- bottom controls ---- */
  .controls{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
  .hint{font-family:var(--font-mono);font-size:.6875rem;letter-spacing:.14em;
        text-transform:uppercase;color:var(--ink-soft);margin-left:auto}

  /* ---- fallback ---- */
  .fallback{position:fixed;inset:0;z-index:2;display:none;place-items:center;
            padding:2rem;text-align:center;background:var(--bg)}
  .no-gl .fallback{display:grid}
  .no-gl #scene{display:none}
  .fallback h1{font-size:clamp(1.75rem,4vw,2.75rem);letter-spacing:-.02em;
               margin:0 0 1rem;max-width:18ch}
  .fallback p{color:var(--ink-soft);max-width:44ch;margin:0 auto}

  /* ---- xr mode ---- */
  .xr-active .overlay{display:none}

  a:focus-visible,button:focus-visible{outline:2px solid var(--accent);
                                       outline-offset:3px}

  @media (max-width:720px){
    .panel{justify-self:stretch;max-width:none;align-self:end}
    .hint{display:none}
  }
  @media (prefers-reduced-motion:reduce){
    .btn,.panel{transition:none}
  }
</style>
</head>
<body>

<canvas id="scene" aria-label="Interactive 3D room. Drag to orbit. Use arrow keys to move."></canvas>

<div class="overlay">
  <header class="hud">
    <a class="brand" href="/">Studio Field</a>
    <div class="hud__actions">
      <button class="btn" id="enter-vr" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 8h18v8h-6l-3-3-3 3H3z"/>
        </svg>
        Enter VR
      </button>
      <button class="btn" id="reset">Reset view</button>
    </div>
  </header>

  <aside class="panel" id="panel" data-empty="true" aria-live="polite">
    <p class="panel__tag" id="panel-tag">Select an object</p>
    <h1 id="panel-title">—</h1>
    <p id="panel-body">Click an object in the room to read about it.</p>
    <dl id="panel-meta"></dl>
  </aside>

  <footer class="controls">
    <button class="btn" id="prev" aria-label="Previous object">←</button>
    <button class="btn" id="next" aria-label="Next object">→</button>
    <span class="hint">Drag to orbit · scroll to zoom</span>
  </footer>
</div>

<div class="fallback">
  <div>
    <h1>A room of twelve objects, built in three dimensions.</h1>
    <p>This page needs WebGL. Your browser or device does not have it enabled — the collection is still readable in the list below.</p>
    <ul style="list-style:none;padding:0;margin:2rem 0 0;text-align:left;
               display:grid;gap:.75rem;max-width:36ch;margin-inline:auto">
      <li>01 — Vessel, unglazed stoneware</li>
      <li>02 — Lamp, brushed aluminium</li>
      <li>03 — Stool, solid ash</li>
      <li>04 — Tray, oxidised brass</li>
    </ul>
  </div>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/"
  }
}
</script>

<script type="module">
(() => {
  const canvas = document.getElementById('scene');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- capability gate ----------
  const probe = document.createElement('canvas');
  const hasGL = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  if (!hasGL) { document.documentElement.classList.add('no-gl'); return; }

  import('three').then(async (THREE) => {
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

    // ---------- renderer ----------
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ---------- scene ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.Fog(0x0a0a0c, 14, 34);

    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    const HOME = new THREE.Vector3(6.5, 4.2, 8.5);
    camera.position.copy(HOME);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.495;   // never below the floor
    controls.minPolarAngle = 0.35;
    controls.update();

    // ---------- lighting ----------
    scene.add(new THREE.HemisphereLight(0x8899bb, 0x181820, 0.9));

    const key = new THREE.DirectionalLight(0xfff0dd, 2.1);
    key.position.set(5, 9, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.bias = -0.0008;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    rim.position.set(-6, 4, -5);
    scene.add(rim);

    // ---------- floor ----------
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.94, metalness: 0.02 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(40, 40, 0x232330, 0x1a1a22);
    grid.position.y = 0.002;
    scene.add(grid);

    // ---------- objects ----------
    const OBJECTS = [
      { id:'vessel', title:'Vessel No. 4', tag:'Stoneware',
        body:'Unglazed, wood-fired for sixty hours. The ash falls where it falls; the surface is a record of the kiln.',
        meta:[['Material','Stoneware'],['Height','24 cm'],['Year','2026']],
        geometry:() => new THREE.CylinderGeometry(0.55, 0.42, 1.5, 32),
        color:0x9a7b5f, pos:[-3, 0.75, 0], metalness:0.05, roughness:0.9 },
      { id:'lamp', title:'Lamp No. 2', tag:'Aluminium',
        body:'A single turned billet. The shade is the same piece of metal, thinned until it passes light.',
        meta:[['Material','Aluminium'],['Height','48 cm'],['Year','2025']],
        geometry:() => new THREE.SphereGeometry(0.6, 32, 24, 0, Math.PI*2, 0, Math.PI*0.62),
        color:0xc8ccd2, pos:[-1, 0.9, -1.6], metalness:0.92, roughness:0.22 },
      { id:'stool', title:'Stool No. 1', tag:'Ash',
        body:'Three legs, one wedge. No fasteners — the joint holds itself under load.',
        meta:[['Material','Solid ash'],['Height','44 cm'],['Year','2024']],
        geometry:() => new THREE.CylinderGeometry(0.72, 0.72, 0.18, 6),
        color:0xc9a67a, pos:[1.2, 1.1, -0.8], metalness:0.0, roughness:0.78 },
      { id:'tray', title:'Tray No. 7', tag:'Brass',
        body:'Oxidised in a sealed chamber for nine days. The colour is not a coating; it is the metal.',
        meta:[['Material','Oxidised brass'],['Width','32 cm'],['Year','2026']],
        geometry:() => new THREE.BoxGeometry(1.6, 0.12, 1.0),
        color:0x8a6f3a, pos:[3.1, 0.62, 0.4], metalness:0.85, roughness:0.42 },
    ];

    const meshes = [];
    const ringGeo = new THREE.RingGeometry(0.9, 1.0, 48);

    OBJECTS.forEach((spec, i) => {
      const geo = spec.geometry();
      const mat = new THREE.MeshStandardMaterial({
        color: spec.color,
        metalness: spec.metalness,
        roughness: spec.roughness,
        flatShading: spec.id === 'stool',
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...spec.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.spec = spec;
      mesh.userData.baseY = spec.pos[1];
      mesh.userData.phase = i * 1.7;
      scene.add(mesh);
      meshes.push(mesh);

      // floor ring, hidden until selected
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({
          color: 0x7dd3fc, transparent: true, opacity: 0,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(spec.pos[0], 0.01, spec.pos[2]);
      scene.add(ring);
      mesh.userData.ring = ring;
    });

    // ---------- selection ----------
    const panel     = document.getElementById('panel');
    const panelTag  = document.getElementById('panel-tag');
    const panelTitle= document.getElementById('panel-title');
    const panelBody = document.getElementById('panel-body');
    const panelMeta = document.getElementById('panel-meta');

    let selected = null;

    function select(mesh) {
      selected = mesh;
      for (const m of meshes) {
        m.userData.ring.material.opacity = m === mesh ? 0.9 : 0;
      }
      if (!mesh) { panel.dataset.empty = 'true'; return; }
      const s = mesh.userData.spec;
      panel.dataset.empty = 'false';
      panelTag.textContent = s.tag;
      panelTitle.textContent = s.title;
      panelBody.textContent = s.body;
      panelMeta.innerHTML = s.meta
        .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    }
    select(null);

    // ---------- picking ----------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down = null;

    canvas.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return;                 // a drag, not a click

      pointer.x =  (e.clientX / innerWidth)  * 2 - 1;
      pointer.y = -(e.clientY / innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      select(hits.length ? hits[0].object : null);
    });

    // keyboard: cycle objects
    let cursor = -1;
    function step(dir) {
      cursor = (cursor + dir + meshes.length) % meshes.length;
      select(meshes[cursor]);
      focusOn(meshes[cursor]);
    }
    document.getElementById('next').addEventListener('click', () => step(1));
    document.getElementById('prev').addEventListener('click', () => step(-1));

    addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
      if (e.key === 'Escape')     { select(null); }
    });

    // smooth camera move toward an object
    let camTarget = null;
    function focusOn(mesh) {
      const p = mesh.position;
      camTarget = new THREE.Vector3(p.x + 2.6, p.y + 1.8, p.z + 3.4);
    }

    document.getElementById('reset').addEventListener('click', () => {
      camTarget = HOME.clone();
      controls.target.set(0, 1, 0);
      select(null);
      cursor = -1;
    });

    // ---------- WebXR ----------
    const vrBtn = document.getElementById('enter-vr');
    let xrSession = null;

    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((ok) => {
        if (ok) vrBtn.hidden = false;
      }).catch(() => {});
    }

    renderer.xr.enabled = true;

    vrBtn.addEventListener('click', async () => {
      try {
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor'],
        });
        await renderer.xr.setSession(session);
        renderer.xr.setReferenceSpaceType('local-floor');
        xrSession = session;
        document.documentElement.classList.add('xr-active');
        session.addEventListener('end', () => {
          xrSession = null;
          document.documentElement.classList.remove('xr-active');
          controls.enabled = true;
        });
        controls.enabled = false;
      } catch (err) {
        console.warn('[xr] session refused:', err);
      }
    });

    // ---------- resize ----------
    function resize() {
      if (renderer.xr.isPresenting) return;   // XR manages its own viewport
      const w = innerWidth, h = innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, h, false);
    }
    addEventListener('resize', resize, { passive: true });
    resize();

    // ---------- loop ----------
    const clock = new THREE.Clock();
    let running = true;

    function frame() {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);   // cap: tab-switch spike
      const t  = clock.elapsedTime;

      // idle float — skipped under reduced motion
      if (!reduce.matches && !renderer.xr.isPresenting) {
        for (const m of meshes) {
          m.rotation.y += dt * 0.22;
          m.position.y = m.userData.baseY +
                         Math.sin(t * 0.9 + m.userData.phase) * 0.045;
        }
      }

      // camera ease toward target
      if (camTarget) {
        camera.position.lerp(camTarget, 1 - Math.pow(0.001, dt));
        if (camera.position.distanceTo(camTarget) < 0.02) camTarget = null;
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }

    renderer.setAnimationLoop(null);
    requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; clock.getDelta(); requestAnimationFrame(frame); }
    });

    // ---------- teardown ----------
    addEventListener('beforeunload', () => {
      running = false;
      controls.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose();
        }
      });
      renderer.dispose();
    });
  }).catch((err) => {
    console.warn('[3d] failed to load, showing fallback:', err);
    document.documentElement.classList.add('no-gl');
  });
})();
</script>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Ship only the XR path | 97% of visitors get a blank screen |
| Use smooth locomotion by default | Guaranteed nausea in VR |
| Rotate the camera smoothly in VR | Same. Snap turn only. |
| Forget `local-floor` | The user is a metre underground |
| Render at full DPR in VR | Two eyes at 3× DPR = 18× the fragments |
| Run `requestAnimationFrame` instead of `setAnimationLoop` for XR | XR needs the session's frame callback |
| No DOM overlay | Screen readers get nothing |
| No fallback for no-WebGL | Blank page |
| Let the camera go below the floor | `maxPolarAngle: Math.PI * 0.495` |
| Load three.js synchronously in `<head>` | Blocks first paint |

## VR locomotion checklist

- [ ] Teleport is the default, smooth is opt-in
- [ ] Snap turn at 30° or 45°
- [ ] Vignette during any smooth movement
- [ ] No acceleration anywhere
- [ ] Floor collision enforced
- [ ] Comfort settings accessible before entering the session
- [ ] `local-floor` reference space

## Accessibility notes

This is the hardest type on the list. Minimums:

- The DOM overlay carries all the content; the canvas carries none
- `aria-label` on the canvas describing what it is and how to interact
- Keyboard: arrows cycle objects, Escape deselects — implemented above
- `prefers-reduced-motion` stops the idle animation and the camera easing
- The no-WebGL fallback lists every object in text
- Selection is announced via `aria-live="polite"` on the panel
- Never require pointer precision — hit targets get generous bounding boxes
- Contrast on the overlay panels against the scene is guaranteed by the panel background, not the scene

## Self-check before reporting

- [ ] Three render paths exist: flat, interactive, XR
- [ ] DOM overlay carries all content
- [ ] No-WebGL fallback lists the content in text
- [ ] `local-floor` reference space on XR entry
- [ ] Teleport locomotion, not smooth, as default
- [ ] Camera cannot go below the floor
- [ ] Render loop stops on `visibilitychange`
- [ ] `dispose()` on geometries and materials
- [ ] `dt` capped so a tab-switch does not teleport the scene
- [ ] Keyboard navigation works without a pointer
- [ ] `prefers-reduced-motion` stops idle motion
