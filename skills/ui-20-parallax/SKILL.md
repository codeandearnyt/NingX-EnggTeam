---
name: ui-20-parallax
description: Build parallax scrolling UI where stacked layers move at different rates to create depth. Use for game marketing, story-driven product pages, immersive brand sites, and any page where the reference standard is firewatchgame.com and flat scrolling would waste the art direction.
metadata:
  origin: ningx
  ui-type: 20
  reference: https://www.firewatchgame.com
---

# UI Type 20 — Parallax Scrolling

Layers moving at different rates. Depth from differential motion.

**Reference standard:** firewatchgame.com

## The honest warning first

Parallax is the most commonly botched effect on the web, for three reasons:

1. It janks because it reads layout in a scroll handler.
2. It breaks on mobile because touch scroll is compositor-driven and different.
3. It makes people sick when the rate differential is too large.

This skill builds it correctly: **`transform` only, driven by scroll progress, with a reduced-motion path.** If you are not doing all three, do not ship parallax.

## When to reach for it

- The page has real art direction — layered illustration or photography
- Depth is the story
- The scroll is long enough to earn it
- You have a fallback for reduced motion and mobile

## The rate model

| Layer | Speed | Purpose |
|---|---|---|
| Sky / far background | 0.15–0.25× | Barely moves |
| Distant terrain | 0.35× | Slow drift |
| Midground | 0.55–0.7× | Noticeable |
| Content plane | 1.0× | Normal scroll |
| Foreground | 1.15–1.3× | Moves faster than scroll |

Anything below 0.1× or above 1.5× reads as broken or nauseating.

## The implementation — transform only

**Wrong** (jank, layout thrash):
```js
// BAD — reads layout in a scroll handler
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  layers.forEach(l => {
    l.style.top = `${y * l.dataset.speed}px`;   // triggers layout
  });
});
```

**Right** (compositor only):
```js
const layers = [...document.querySelectorAll('[data-speed]')];
let ticking = false;

function update() {
  const y = window.scrollY;
  for (const el of layers) {
    const speed = parseFloat(el.dataset.speed);
    // translate3d only — never top/left/margin
    el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
  }
  ticking = false;
}

addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}, { passive: true });
```

`translate3d` promotes to a compositor layer. `top` triggers layout on every frame. That single difference is the whole performance story.

## Better: CSS scroll-driven animations

Where supported, this removes JS entirely:

```css
@supports (animation-timeline: scroll()) {
  .layer--far {
    animation: parallax linear;
    animation-timeline: scroll(root block);
    animation-range: 0 100vh;
  }
  @keyframes parallax {
    to { transform: translate3d(0, -18vh, 0); }
  }
}
```

Feature-detect and fall back to the JS version. Scroll-driven animations run off the main thread.

## Tokens

```css
:root {
  --sky-top: #1a2744;
  --sky-bottom: #e8a87c;
  --ridge-far: #2d3a52;
  --ridge-mid: #1f2937;
  --ridge-near: #11161f;
  --ink: #f5f0e8;
  --ink-soft: rgb(245 240 232 / .72);
  --accent: #e8a87c;

  --font-display: "Bebas Neue", Impact, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --fs-display: clamp(2.5rem, 9vw, 7rem);

  --scene-height: 240vh;     /* tall enough to earn the effect */
}
```

## Anatomy

```
<section class="scene">            the tall container
  <div class="layer" data-speed="0.2">   far — sky, stars
  <div class="layer" data-speed="0.4">   distant ridge
  <div class="layer" data-speed="0.65">  midground
  <div class="layer layer--content">     the actual copy, speed 1
  <div class="layer" data-speed="1.25">  foreground, frames the content
</section>
```

Layers are `position: fixed` (sticky feel) or `absolute` within the tall container. Fixed gives the strongest effect; absolute gives more control.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ridgeline</title>
<style>
  :root{
    --sky-top:#1a2744; --sky-bottom:#e8a87c;
    --ridge-far:#2d3a52; --ridge-mid:#1f2937; --ridge-near:#11161f;
    --ink:#f5f0e8; --ink-soft:rgb(245 240 232/.72); --accent:#e8a87c;
    --font-display:"Bebas Neue",Impact,sans-serif;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --fs-display:clamp(2.5rem,9vw,7rem);
    --scene-height:240vh;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:#0a0e15;color:var(--ink);
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased}

  /* ---------- the scene ---------- */
  .scene{
    position:relative;height:var(--scene-height);
    overflow:hidden;isolation:isolate;
  }

  .layer{
    position:absolute;inset:0;
    will-change:transform;
    transform:translate3d(0,0,0);
  }

  /* sky */
  .layer--sky{
    background:linear-gradient(180deg,var(--sky-top) 0%,#4a4a6a 45%,var(--sky-bottom) 100%);
    z-index:0;
  }
  .stars{
    position:absolute;inset:0;
    background-image:
      radial-gradient(1px 1px at 12% 18%,#fff,transparent),
      radial-gradient(1px 1px at 34% 8%,#fff,transparent),
      radial-gradient(1.5px 1.5px at 58% 22%,#fff,transparent),
      radial-gradient(1px 1px at 76% 12%,#fff,transparent),
      radial-gradient(1px 1px at 88% 28%,#fff,transparent),
      radial-gradient(1px 1px at 22% 34%,#fff,transparent),
      radial-gradient(1.5px 1.5px at 66% 40%,#fff,transparent);
    opacity:.7;
  }

  /* ridges drawn as SVG, repeated horizontally */
  .ridge{position:absolute;left:0;right:0;bottom:0;height:100%;}
  .ridge svg{position:absolute;bottom:0;width:100%;height:auto;display:block}

  .layer--far  { z-index:1 }
  .layer--mid  { z-index:2 }
  .layer--near { z-index:4; pointer-events:none }

  /* content */
  .content{
    position:relative;z-index:3;
    min-height:100vh;display:grid;place-items:center;text-align:center;
    padding:2rem;
  }
  .content h1{
    font-family:var(--font-display);font-size:var(--fs-display);
    letter-spacing:.02em;line-height:.9;margin:0 0 1.25rem;text-transform:uppercase;
    text-shadow:0 4px 24px rgb(0 0 0/.5);
  }
  .content p{max-width:38ch;margin:0 auto 2rem;color:var(--ink-soft);
             font-size:1.0625rem;text-shadow:0 2px 12px rgb(0 0 0/.6)}
  .btn{
    display:inline-flex;align-items:center;justify-content:center;
    height:52px;padding:0 2rem;border-radius:999px;
    background:var(--accent);color:#12161f;text-decoration:none;
    font:600 .9375rem/1 var(--font-body);letter-spacing:.04em;text-transform:uppercase;
    box-shadow:0 8px 32px -8px rgb(232 168 124/.6);
    transition:transform 160ms ease,box-shadow 160ms ease;
  }
  .btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px -8px rgb(232 168 124/.75)}
  .btn:focus-visible{outline:3px solid var(--ink);outline-offset:3px}

  /* foreground vignette — frames the scene */
  .layer--near::after{
    content:"";position:absolute;inset:0;
    background:radial-gradient(ellipse 120% 90% at 50% 45%,
      transparent 40%,rgb(6 9 14/.55) 100%);
  }

  @media (prefers-reduced-motion:reduce){
    .layer{will-change:auto;transform:none!important}
    .scene{height:auto;min-height:100vh}
    .content{position:relative}
    .ridge{position:relative;height:auto}
    html{scroll-behavior:auto}
  }

  @media (max-width:640px){
    :root{--scene-height:180vh}
    .content h1{font-size:clamp(2rem,12vw,3.5rem)}
  }
</style>
</head>
<body>

<section class="scene" aria-label="Ridgeline — a journey through the mountains">

  <div class="layer layer--sky" data-speed="0.18" aria-hidden="true">
    <div class="stars"></div>
  </div>

  <div class="layer layer--far ridge" data-speed="0.38" aria-hidden="true">
    <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style="height:52vh">
      <path d="M0 400 L0 220 L180 120 L340 200 L520 90 L700 190 L880 110 L1060 200 L1240 130 L1440 210 L1440 400Z"
            fill="var(--ridge-far)"/>
    </svg>
  </div>

  <div class="layer layer--mid ridge" data-speed="0.62" aria-hidden="true">
    <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style="height:44vh">
      <path d="M0 400 L0 280 L220 180 L420 270 L620 170 L820 260 L1020 190 L1220 280 L1440 200 L1440 400Z"
            fill="var(--ridge-mid)"/>
    </svg>
  </div>

  <div class="content">
    <div>
      <h1>Ridgeline</h1>
      <p>Nine days on foot. No signal, no schedule, one route out.</p>
      <a class="btn" href="#trailer">Watch the trailer</a>
    </div>
  </div>

  <div class="layer layer--near" data-speed="1.22" aria-hidden="true"></div>

</section>

<script>
  (() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    const scene  = document.querySelector('.scene');
    const layers = [...scene.querySelectorAll('[data-speed]')];
    let ticking  = false;
    let visible  = true;

    // stop work when the scene is off-screen
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; })
      .observe(scene);

    function update() {
      if (visible) {
        const rect = scene.getBoundingClientRect();
        const y = -rect.top;                 // progress through the scene
        for (const el of layers) {
          const speed = parseFloat(el.dataset.speed) - 1;
          el.style.transform = `translate3d(0,${y * speed}px,0)`;
        }
      }
      ticking = false;
    }

    addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    addEventListener('resize', update, { passive: true });
    update();
  })();
</script>

</body>
</html>
```

Note the `speed - 1` in the JS. A layer at speed `1.0` should not move relative to the page, so its multiplier is `0`. A layer at `0.2` moves at `-0.8` relative — slower than scroll, which reads as "far away." That subtraction is what makes the numbers in the rate table meaningful.

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Animate `top`, `left`, or `margin` | Layout on every frame — guaranteed jank |
| Read `getBoundingClientRect()` per layer per frame | One read, shared. Cache it. |
| Use `background-attachment: fixed` for parallax | Breaks on iOS entirely |
| Add a scroll listener without `{ passive: true }` | Blocks the compositor |
| Rate differentials above 0.6 | Nauseating |
| Run parallax on mobile at full rate | Touch scroll is different; reduce or disable |
| Skip the reduced-motion path | A hard accessibility failure |
| Put interactive elements in a moving layer | Hit targets move; unusable |

## Mobile strategy

Touch scrolling on iOS does not fire scroll events at the same cadence, and `background-attachment: fixed` does not work at all.

Three options, in order of preference:

1. **Disable parallax below 768px.** Let the layers sit static. The art still reads.
2. **Reduce the rate differential by half.**
3. **Use CSS `animation-timeline: scroll()`** where supported — it works on mobile because it is compositor-driven.

Option 1 is the safe default. The scene still looks good; it just does not move.

## Performance budget

- Only `transform` and `opacity` animate
- `will-change: transform` on layers, removed when the scene leaves the viewport
- `IntersectionObserver` gates all work
- Max 5 layers
- Total scene image weight under 800KB
- No layer larger than 2× the viewport

Measure: scroll the scene and check the frame rate in DevTools. Below 55fps on a mid-tier laptop is a fail.

## Accessibility notes

- The entire scene is decorative; the content layer carries the meaning
- `aria-hidden="true"` on all parallax layers
- `prefers-reduced-motion` must **fully disable** the effect, not just slow it
- Content must be readable at every scroll position — do not let a foreground layer cover the CTA
- Keyboard users tab through the content layer; moving layers must not capture focus

## Self-check before reporting

- [ ] Only `transform` is animated
- [ ] `requestAnimationFrame` gates the scroll handler
- [ ] Listener registered with `{ passive: true }`
- [ ] `IntersectionObserver` stops work off-screen
- [ ] Rate differentials within 0.15–1.3×
- [ ] `prefers-reduced-motion` fully disables the effect
- [ ] Mobile either disabled or halved
- [ ] Content layer has `z-index` above decorative layers and stays readable
