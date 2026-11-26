---
name: ui-19-isometric
description: Build isometric UI using a fixed faux-3D projection where a 2D plane is rotated to a constant angle. Use for system diagrams, architecture explainers, product maps, game-adjacent interfaces, and any page where the reference standard is icograms.com and real 3D would be overkill.
metadata:
  origin: ningx
  ui-type: 19
  reference: https://icograms.com
---

# UI Type 19 — Isometric (Faux-3D Angle)

A 2D plane rotated to a fixed isometric projection. Depth without perspective.

**Reference standard:** icograms.com

## What isometric actually is

Isometric means **no perspective** — parallel lines stay parallel, objects do not shrink with distance. That is the whole definition, and it is what separates this from type 24.

```css
transform: rotateX(55deg) rotateZ(-45deg);
```

Those two numbers are the standard. `rotateX(55deg)` tips the plane back, `rotateZ(-45deg)` turns it. Together they give the classic 2:1 isometric look.

**Do not add `perspective`.** The moment you add perspective you have made a 3D scene with a bad camera, not an isometric diagram.

## When to reach for it

- Explaining a system spatially (layers, stacks, flows)
- The content is a map, not a page
- You want depth cues without WebGL cost
- The brand is technical or playful-technical

## The transform stack

```css
.iso-scene {
  transform: rotateX(55deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}
/* content that must stay readable */
.iso-label {
  transform: rotateZ(45deg) rotateX(-55deg);   /* exactly inverse */
}
```

The inverse is not `rotateZ(45deg)` alone — it must undo both axes in reverse order. Getting this wrong is the #1 isometric bug: text that is skewed or mirrored.

## Elevation

In isometric, "up" is along the Z axis of the rotated plane:

```css
.iso-tile--raised { transform: translateZ(24px); }
.iso-tile--sunken { transform: translateZ(-12px); }
```

Requires `transform-style: preserve-3d` on the parent.

Alternative without 3D: offset the shadow along one axis only.

```css
.iso-tile { box-shadow: 0 0 0 transparent; }
.iso-tile--raised { box-shadow: 12px 12px 0 rgb(0 0 0 / .12); }
```

The offset shadow must follow the **isometric axis**, not straight down.

## The light

Consistent from top-left of the scene (which, after rotation, is the upper-left of the screen):

```css
:root {
  --iso-light: rgb(255 255 255 / .9);
  --iso-shadow: rgb(0 0 0 / .18);
  --iso-shadow-deep: rgb(0 0 0 / .3);
}
```

Top face is lightest, left face is mid, right face is darkest. That three-tone rule is what makes a flat shape read as a cube.

## Tokens

```css
:root {
  --bg: #0e1117;
  --plane: #161b24;
  --tile: #1e2530;
  --tile-top: #2a3341;
  --tile-left: #222b38;
  --tile-right: #18202b;

  --ink: #e8edf5;
  --ink-soft: #94a3b8;
  --accent: #38bdf8;
  --accent-2: #f472b6;

  --iso-x: 55deg;
  --iso-z: -45deg;

  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;

  --grid: 64px;              /* the tile unit — everything snaps to this */
}
```

Everything on the grid. An isometric layout with off-grid elements looks broken, not free.

## Anatomy

```
<div class="iso-viewport">        perspective-free container, overflow hidden
  <div class="iso-scene">         rotated plane
    <div class="iso-grid">        background grid, also rotated
    <div class="iso-tile">        a block, positioned on the grid
      <div class="iso-face iso-face--top">   label (counter-rotated)
```

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stack — how the request gets there</title>
<style>
  :root{
    --bg:#0e1117; --plane:#161b24; --tile:#1e2530;
    --tile-top:#2a3341; --tile-left:#222b38; --tile-right:#18202b;
    --ink:#e8edf5; --ink-soft:#94a3b8; --accent:#38bdf8; --accent-2:#f472b6;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --font-mono:ui-monospace,"SF Mono",monospace;
    --grid:64px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased;
       min-height:100vh;display:grid;place-items:center;padding:2rem}

  .iso-viewport{
    width:min(900px,100%);height:min(620px,70vh);
    position:relative;overflow:hidden;border-radius:16px;
    background:radial-gradient(ellipse at 50% 40%,#182030 0%,var(--bg) 70%);
    border:1px solid #1e2634;
  }

  .iso-scene{
    position:absolute;left:50%;top:50%;
    transform:translate(-50%,-50%) rotateX(55deg) rotateZ(-45deg);
    transform-style:preserve-3d;
    width:760px;height:760px;
  }

  /* background grid, same plane */
  .iso-grid{
    position:absolute;inset:0;
    background-image:
      linear-gradient(to right,rgb(56 189 248/.07) 1px,transparent 1px),
      linear-gradient(to bottom,rgb(56 189 248/.07) 1px,transparent 1px);
    background-size:var(--grid) var(--grid);
    -webkit-mask-image:radial-gradient(ellipse at 50% 50%,#000 30%,transparent 72%);
            mask-image:radial-gradient(ellipse at 50% 50%,#000 30%,transparent 72%);
  }

  /* ---- a tile: three faces to fake a block ---- */
  .iso-tile{
    position:absolute;width:var(--grid);height:var(--grid);
    transform-style:preserve-3d;
  }
  .face{
    position:absolute;inset:0;
    border-radius:6px;
    display:grid;place-items:center;
  }
  .face--top{
    background:var(--tile-top);
    border:1px solid rgb(255 255 255/.08);
    box-shadow:0 0 24px rgb(56 189 248/.06) inset;
    transform:translateZ(var(--h,0px));
  }
  .face--left{
    background:var(--tile-left);
    transform:rotateX(-90deg) translateZ(0);
    transform-origin:bottom;
    height:var(--h,0px);width:100%;
    top:auto;bottom:0;
  }
  .face--right{
    background:var(--tile-right);
    transform:rotateY(90deg) translateZ(0);
    transform-origin:right;
    width:var(--h,0px);height:100%;
    left:auto;right:0;
  }

  /* counter-rotated label — must undo BOTH axes in reverse order */
  .iso-label{
    transform:rotateZ(45deg) rotateX(-55deg);
    font:600 11px/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;
    color:var(--ink-soft);white-space:nowrap;pointer-events:none;
  }
  .iso-tile--accent .face--top{background:#173a4d;border-color:rgb(56 189 248/.35)}
  .iso-tile--accent .iso-label{color:var(--accent)}
  .iso-tile--warm .face--top{background:#3d1f2e;border-color:rgb(244 114 182/.35)}
  .iso-tile--warm .iso-label{color:var(--accent-2)}

  /* ---- connector: a thin bar along the iso axis ---- */
  .iso-link{
    position:absolute;height:2px;background:linear-gradient(90deg,
      rgb(56 189 248/.6),rgb(56 189 248/.12));
    transform-origin:left center;
  }

  .caption{
    position:absolute;left:2rem;bottom:2rem;right:2rem;
    display:flex;gap:2rem;flex-wrap:wrap;align-items:center;
    font-size:.8125rem;color:var(--ink-soft);
  }
  .caption b{color:var(--ink);font-weight:500}
  .dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:.5rem;
       vertical-align:middle}
  .dot--edge{background:#38bdf8} .dot--api{background:#f472b6}

  @media (max-width:720px){
    .iso-scene{transform:translate(-50%,-50%) scale(.62) rotateX(55deg) rotateZ(-45deg)}
    .caption{font-size:.75rem;gap:1rem}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>

<div class="iso-viewport">
  <div class="iso-scene" role="img"
       aria-label="Isometric diagram: browser at the edge, three application servers, one database below">

    <div class="iso-grid" aria-hidden="true"></div>

    <!-- edge -->
    <div class="iso-tile iso-tile--accent" style="left:128px;top:128px;--h:28px">
      <div class="face face--top"><span class="iso-label">Edge</span></div>
      <div class="face face--left"></div><div class="face face--right"></div>
    </div>

    <!-- three app servers -->
    <div class="iso-tile" style="left:320px;top:224px;--h:56px">
      <div class="face face--top"><span class="iso-label">App 1</span></div>
      <div class="face face--left"></div><div class="face face--right"></div>
    </div>
    <div class="iso-tile" style="left:384px;top:288px;--h:56px">
      <div class="face face--top"><span class="iso-label">App 2</span></div>
      <div class="face face--left"></div><div class="face face--right"></div>
    </div>
    <div class="iso-tile" style="left:448px;top:352px;--h:56px">
      <div class="face face--top"><span class="iso-label">App 3</span></div>
      <div class="face face--left"></div><div class="face face--right"></div>
    </div>

    <!-- database, taller -->
    <div class="iso-tile iso-tile--warm" style="left:576px;top:448px;--h:96px">
      <div class="face face--top"><span class="iso-label">DB</span></div>
      <div class="face face--left"></div><div class="face face--right"></div>
    </div>

    <!-- connectors along the iso axis -->
    <div class="iso-link" style="left:192px;top:156px;width:130px;transform:rotate(45deg)"></div>
    <div class="iso-link" style="left:576px;top:480px;width:120px;transform:rotate(45deg)"></div>

  </div>

  <div class="caption">
    <span><i class="dot dot--edge"></i><b>Edge</b> — TLS, cache, routing</span>
    <span><i class="dot dot--api"></i><b>App</b> — stateless, 3 replicas</span>
    <span><b>DB</b> — single primary, read replicas</span>
  </div>
</div>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Add `perspective` | That is 3D, not isometric |
| Use different angles per element | The projection is global and fixed |
| Forget the inverse rotation on labels | Text will be skewed and unreadable |
| Off-grid positioning | Isometric reads as a grid; arbitrary positions look broken |
| Straight-down drop shadows | Shadows follow the iso axis |
| Rotate the whole page | The scene rotates, not the document |
| Animate the plane | Isometric is a static projection |
| Use it for a hero with a headline | Text on a rotated plane is unreadable |

## The label test

After building, look at every label. If any of these is true, the inverse rotation is wrong:

- Text is slanted
- Text is mirrored
- Text is squashed vertically
- Text baseline runs diagonally

Correct: `transform: rotateZ(45deg) rotateX(-55deg)` — exactly inverse, reverse order.

## Responsive

Isometric does not reflow. Scale the whole scene:

```css
@media (max-width: 720px) {
  .iso-scene { transform: translate(-50%,-50%) scale(.62) rotateX(55deg) rotateZ(-45deg); }
}
```

Keep the rotation **last** in the transform list so the scale applies in screen space.

Below 480px, either scale to 0.45 or replace the diagram with a flat list. A 0.3-scale isometric diagram is unreadable.

## Accessibility notes

- The whole scene is one `role="img"` with a descriptive `aria-label`
- Individual tiles are decorative to a screen reader — the label carries the meaning
- Provide a text equivalent below the diagram (the caption in the scaffold does this)
- Never put interactive controls on the rotated plane — hit targets become skewed
- If the diagram carries essential information, a `<table>` or `<ol>` alternative is mandatory

## Self-check before reporting

- [ ] `rotateX(55deg) rotateZ(-45deg)` on the scene, no `perspective`
- [ ] Labels use the exact inverse rotation, reverse order
- [ ] All tiles positioned on the grid unit
- [ ] Three-tone faces: top lightest, right darkest
- [ ] Shadows follow the iso axis
- [ ] Scene scales (not reflows) on mobile
- [ ] `role="img"` + `aria-label` on the scene
- [ ] Text alternative present for essential information
