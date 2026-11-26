---
name: ui-18-skeuomorphism
description: Build skeuomorphic UI where interface elements imitate real materials with consistent physical lighting. Use for craft and hardware brands, editorial products, audio tools, and any page where the reference standard is teenage.engineering and material honesty carries the brand.
metadata:
  origin: ningx
  ui-type: 18
  reference: https://teenage.engineering
---

# UI Type 18 — Skeuomorphism (Realistic Textures)

Interface elements that imitate their physical counterparts — including the material.

**Reference standard:** teenage.engineering

## When to reach for it

- The physical product matters (hardware, instruments, tools)
- Craft and materiality are the brand
- The audience values tangibility over trend
- You can produce or source real texture

## The distinction from neumorphism and clay

| | Neumorphism (15) | Clay (17) | Skeuomorphism (18) |
|---|---|---|---|
| Surface | One flat color | One pastel color | A named **material** |
| Depth | Soft extrude | Soft inflate | Real light + real texture |
| Metaphor | Physical | Toy-like | Literal object |
| Texture | None | None | Required |

Skeuomorphism without texture is just soft UI. The material is not optional.

## The signature

1. **Every surface names a material.** Paper, metal, plastic, glass, fabric, concrete.
2. **One light source for the whole page.** Top-left, always. Inconsistent lighting is the tell of fake skeuomorphism.
3. **Controls look pressable** because they are bevelled, textured, and shadowed in the direction light travels.

## The light model

Pick a direction and never break it:

```css
:root {
  --light-angle: 145deg;                    /* from top-left */
  --highlight: rgb(255 255 255 / .55);
  --shadow: rgb(0 0 0 / .28);
  --shadow-deep: rgb(0 0 0 / .45);
}
```

Every gradient, bevel, and shadow derives from `--light-angle`. A button lit from the left next to a panel lit from the right is a broken page.

## Material recipes

**Brushed metal**
```css
.metal {
  background:
    repeating-linear-gradient(90deg,
      rgb(255 255 255 / .04) 0 1px,
      transparent 1px 3px),
    linear-gradient(var(--light-angle), #d8d8d8 0%, #f2f2f2 35%, #b8b8b8 65%, #e0e0e0 100%);
  box-shadow:
    inset 0 1px 0 var(--highlight),
    inset 0 -1px 0 var(--shadow),
    0 2px 4px var(--shadow);
}
```

**Paper**
```css
.paper {
  background-color: #f7f3e9;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");
  box-shadow: 0 1px 3px rgb(0 0 0 / .12), 0 8px 24px -8px rgb(0 0 0 / .15);
}
```

**Plastic (glossy)**
```css
.plastic {
  background: linear-gradient(180deg, #3a3a3a 0%, #1e1e1e 48%, #111 52%, #2a2a2a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .18),
    inset 0 -1px 0 rgb(0 0 0 / .6),
    0 4px 8px rgb(0 0 0 / .4);
  border-radius: 8px;
}
```

**Concrete**
```css
.concrete {
  background-color: #c9c6c1;
  background-image:
    radial-gradient(circle at 20% 30%, rgb(255 255 255 / .18), transparent 40%),
    radial-gradient(circle at 80% 70%, rgb(0 0 0 / .12), transparent 45%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='5'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.14'/%3E%3C/svg%3E");
}
```

The SVG turbulence filter is the workhorse. It generates real noise without an image request.

## Tokens

```css
:root {
  --light-angle: 145deg;
  --highlight: rgb(255 255 255 / .55);
  --shadow: rgb(0 0 0 / .28);
  --shadow-deep: rgb(0 0 0 / .45);

  --metal-1: #f2f2f2; --metal-2: #b8b8b8; --metal-3: #d8d8d8;
  --plastic-1: #3a3a3a; --plastic-2: #111;
  --paper: #f7f3e9;
  --concrete: #c9c6c1;

  --ink: #141414;
  --ink-soft: #4a4a4a;
  --accent: #e8462c;          /* one, like a physical indicator light */

  --font-body: "Suisse Intl", "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;
  --radius-sm: 4px;
  --radius: 8px;
}
```

## Anatomy

```
<div class="device metal">        the housing
  <div class="device__plate">     a paper label, inset
  <div class="knob plastic">      a physical control
  <div class="screen">            an inset display well
```

The metaphor must be functional. A knob changes a value. A screen shows one. Decorative texture with no mapping is costume.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FIELD — pocket sampler</title>
<style>
  :root{
    --light-angle:145deg;
    --highlight:rgb(255 255 255/.55); --shadow:rgb(0 0 0/.28); --shadow-deep:rgb(0 0 0/.45);
    --ink:#141414; --ink-soft:#4a4a4a; --accent:#e8462c;
    --font-body:"Suisse Intl","Inter",system-ui,sans-serif;
    --font-mono:ui-monospace,"SF Mono",monospace;
  }
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem;
       background:#2a2a28;
       background-image:radial-gradient(circle at 50% 20%,#3a3a37,#1c1c1a 70%);
       font:1rem/1.5 var(--font-body);color:var(--ink);
       -webkit-font-smoothing:antialiased}

  /* ---------- metal housing ---------- */
  .device{
    width:min(560px,100%);padding:28px;border-radius:14px;
    background:
      repeating-linear-gradient(90deg,rgb(255 255 255/.04) 0 1px,transparent 1px 3px),
      linear-gradient(var(--light-angle),#d8d8d8 0%,#f2f2f2 35%,#b8b8b8 65%,#e0e0e0 100%);
    box-shadow:
      inset 0 1px 0 var(--highlight),
      inset 0 -1px 0 var(--shadow),
      0 2px 0 rgb(255 255 255/.06),
      0 24px 48px -12px rgb(0 0 0/.75);
  }

  .brand{
    display:flex;align-items:baseline;justify-content:space-between;
    margin:0 0 20px;font-family:var(--font-mono);
    font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#4a4a4a;
  }
  .brand b{font-family:var(--font-body);font-size:16px;letter-spacing:.02em;color:#1a1a1a}

  /* ---------- inset screen ---------- */
  .screen{
    border-radius:6px;padding:18px 20px;margin-bottom:22px;
    background:linear-gradient(180deg,#0d1210,#0a0f0d);
    box-shadow:
      inset 0 2px 6px rgb(0 0 0/.9),
      inset 0 -1px 0 rgb(255 255 255/.08),
      0 1px 0 rgb(255 255 255/.5);
    font-family:var(--font-mono);color:#7dff9b;
    text-shadow:0 0 10px rgb(125 255 155/.55);
    position:relative;overflow:hidden;
  }
  /* scanlines — a real CRT artifact */
  .screen::after{
    content:"";position:absolute;inset:0;pointer-events:none;
    background:repeating-linear-gradient(0deg,rgb(0 0 0/.28) 0 1px,transparent 1px 3px);
  }
  .screen__row{display:flex;justify-content:space-between;gap:1rem;
               font-size:12px;letter-spacing:.1em;margin-bottom:6px}
  .screen__row:last-child{margin-bottom:0}
  .screen__val{color:#c9ffd8}

  /* ---------- controls ---------- */
  .controls{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}

  .knob{
    position:relative;aspect-ratio:1;border-radius:50%;border:0;cursor:pointer;
    background:
      radial-gradient(circle at 34% 28%,#5a5a5a 0%,#2a2a2a 45%,#0e0e0e 100%);
    box-shadow:
      inset 0 2px 2px rgb(255 255 255/.28),
      inset 0 -3px 6px rgb(0 0 0/.85),
      0 4px 8px rgb(0 0 0/.55),
      0 1px 0 rgb(255 255 255/.35);
    transition:transform 100ms ease;
  }
  /* indicator notch — rotated by the component's state */
  .knob::before{
    content:"";position:absolute;left:50%;top:14%;width:2px;height:22%;
    background:#e8e8e8;border-radius:1px;transform:translateX(-50%) rotate(var(--rot,0deg));
    transform-origin:50% 200%;
    box-shadow:0 0 4px rgb(255 255 255/.5);
  }
  .knob:active{transform:scale(.97)}
  .knob:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
  .knob span{
    position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);
    font-family:var(--font-mono);font-size:9px;letter-spacing:.18em;
    text-transform:uppercase;color:#4a4a4a;white-space:nowrap;
  }

  .btn-plastic{
    position:relative;padding:12px 18px;border:0;border-radius:8px;cursor:pointer;
    background:linear-gradient(180deg,#3a3a3a 0%,#1e1e1e 48%,#111 52%,#2a2a2a 100%);
    color:#e8e8e8;font:600 13px/1 var(--font-body);letter-spacing:.06em;
    text-transform:uppercase;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255/.18),
      inset 0 -1px 0 rgb(0 0 0/.6),
      0 4px 8px rgb(0 0 0/.45),
      0 1px 0 rgb(255 255 255/.3);
    transition:transform 80ms ease,box-shadow 80ms ease;
  }
  .btn-plastic:hover{background:linear-gradient(180deg,#444 0%,#252525 48%,#161616 52%,#303030 100%)}
  .btn-plastic:active{
    transform:translateY(1px);
    box-shadow:
      inset 0 2px 4px rgb(0 0 0/.8),
      inset 0 -1px 0 rgb(255 255 255/.08),
      0 1px 2px rgb(0 0 0/.4);
  }
  .btn-plastic--accent{background:linear-gradient(180deg,#ff6a52,#e8462c 48%,#b32d17 52%,#f05a40);color:#fff}

  .foot{display:flex;gap:12px;margin-top:34px;align-items:center;flex-wrap:wrap}

  .led{
    width:9px;height:9px;border-radius:50%;background:#e8462c;
    box-shadow:0 0 8px #e8462c,inset 0 -1px 2px rgb(0 0 0/.5);
    margin-left:auto;
  }

  @media (max-width:520px){
    .controls{grid-template-columns:repeat(2,1fr);gap:26px 14px}
    .device{padding:20px}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>

<div class="device">
  <div class="brand">
    <b>FIELD</b>
    <span>Pocket Sampler · Mk II</span>
  </div>

  <div class="screen" role="status" aria-live="polite">
    <div class="screen__row"><span>BANK</span><span class="screen__val">A</span></div>
    <div class="screen__row"><span>SAMPLE</span><span class="screen__val">04</span></div>
    <div class="screen__row"><span>LENGTH</span><span class="screen__val">2.41 s</span></div>
    <div class="screen__row"><span>RATE</span><span class="screen__val">44.1 kHz</span></div>
  </div>

  <div class="controls">
    <button class="knob" style="--rot:-40deg" aria-label="Volume, 30 percent"><span>Vol</span></button>
    <button class="knob" style="--rot:20deg" aria-label="Tone, 60 percent"><span>Tone</span></button>
    <button class="knob" style="--rot:-15deg" aria-label="Pitch, 45 percent"><span>Pitch</span></button>
    <button class="knob" style="--rot:55deg" aria-label="Decay, 70 percent"><span>Decay</span></button>
  </div>

  <div class="foot">
    <button class="btn-plastic">Play</button>
    <button class="btn-plastic btn-plastic--accent">Record</button>
    <span class="led" role="img" aria-label="Power on"></span>
  </div>
</div>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use a texture with no material name | Texture is not a metaphor |
| Light from two directions | Physically impossible, instantly reads fake |
| Put a bevel on a non-interactive element | Bevel means pressable |
| Use blur where a hard highlight belongs | Real materials have edges |
| Skip the inset highlight on raised surfaces | They will look printed, not raised |
| Make everything metal | One material per region |
| Use skeuomorphism for a text form | It fights legibility |
| Animate with spring easing | Physical objects use linear or ease-out |

## The consistency test

Photograph your layout. Ask: **where is the light coming from?** If you cannot answer in one second, or the answer differs between elements, the build fails.

Second test: **does the metaphor map to function?** A knob must control a value. A slider must control a range. A screen must display state. If a textured element controls nothing, delete it.

## Performance

SVG turbulence filters are cheap to generate but expensive at large sizes. Rules:

- Cap texture tile size at 200×200px and repeat
- Never apply `feTurbulence` to a full-viewport element
- Repeating-linear-gradient scanlines are free — prefer them over images
- Total texture payload should be zero bytes (inline SVG data URIs)

## Accessibility notes

- Physical controls are often small — enforce 44px minimum touch targets
- `aria-label` on every knob with the **current value** (`"Volume, 30 percent"`)
- The LED indicator needs a text alternative
- Low-contrast textures behind text will fail — put text on a clean plate
- The press animation is the affordance; keep the state change for reduced-motion users, drop only the transition
- Focus ring must be visible on metal — `--accent` red works on grey

## Self-check before reporting

- [ ] Every textured surface names a material
- [ ] One light angle across the whole page
- [ ] Every raised surface has an inset top highlight
- [ ] Every pressed state inverts the highlight/shadow
- [ ] Metaphors map to real functions
- [ ] Textures are inline SVG or gradients, zero image requests
- [ ] Touch targets ≥ 44px
- [ ] Focus visible against every material
