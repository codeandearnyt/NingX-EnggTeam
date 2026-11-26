---
name: performance
alwaysApply: true
description: Core Web Vitals budgets and the rules that keep a page inside them. Applies to any route, image, font, or script.
---

# Performance Rules

Numbers, not impressions. "Feels fast" is not a measurement.

## The budgets

| Metric | Good | Fail |
|---|---|---|
| LCP | ≤ 2.5s | > 4.0s |
| INP | ≤ 200ms | > 500ms |
| CLS | ≤ 0.1 | > 0.25 |
| TTFB | ≤ 800ms | > 1.8s |
| Initial JS | ≤ 170KB gz | > 250KB |
| Initial CSS | ≤ 50KB gz | > 80KB |
| Hero image | ≤ 200KB | > 400KB |
| Fonts total | ≤ 100KB | > 200KB |

INP replaced FID in March 2024. A checklist that still says FID is stale.

## R1 — The LCP image is preloaded and prioritised

```html
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
<img src="/hero.avif" width="1600" height="900"
     alt="…" fetchpriority="high" decoding="async">
```

`fetchpriority="high"` is the highest-leverage attribute on a marketing page. It lifts the image above CSS and fonts in the queue.

## R2 — Never lazy-load the LCP image

`loading="lazy"` on the hero delays LCP by a full network round trip. Lazy only below the fold.

## R3 — Every image has dimensions

```html
<img src="…" width="1600" height="900" alt="…">
```

Both attributes, always. The browser derives the aspect ratio and reserves the space. This is the whole CLS fix for images.

## R4 — Fonts swap, preload, subset

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-display: swap;
}
```

Plus a `size-adjust` fallback face so the swap does not shift layout. Two families maximum. Variable where possible.

## R5 — Nothing render-blocking in `<head>`

```html
<script src="/app.js" type="module" defer></script>
```

`type="module"` is deferred by default. Classic scripts need `defer` explicitly. Non-critical CSS loads with `media="print" onload="this.media='all'"`.

## R6 — Only `transform` and `opacity` animate

| Animatable | Cost |
|---|---|
| `transform`, `opacity` | compositor — fine |
| `filter`, `clip-path` | compositor, expensive — sparingly |
| `background-color`, `color`, `box-shadow` | paint — short transitions only |
| `width`, `height`, `top`, `left`, `margin`, `font-size` | layout — **never** |

## R7 — Scroll handlers are rAF-gated and passive

```js
addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}, { passive: true });
```

## R8 — Yield every ~50ms on long work

```js
if (i % 50 === 0) await new Promise(r => setTimeout(r, 0));
```

A long task over 50ms blocks INP.

## R9 — Batch reads, then writes

Reading `offsetHeight` after writing `style.width` forces a synchronous reflow. Read everything first, then write everything.

## R10 — Split at route boundaries first

Then interaction boundaries. Never split a 20-line component — the request costs more than the bytes.

## R11 — Every dependency over 20KB gzipped needs a justification

The default answer is no.

## R12 — Stop the render loop when hidden

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});
```

## R13 — Measure on mobile throttling

Desktop Lighthouse is flattering and wrong. Ship against mobile lab data, verify against CrUX field data.

```bash
npx lighthouse http://localhost:3000 --form-factor=mobile \
  --throttling-method=simulate --only-categories=performance --view
```

## R14 — Report numbers, not adjectives

The hand-off says "LCP 1.8s, CLS 0.02, INP 90ms, JS 142KB gz." Not "fast."

## Enforcement

`hooks/ui-guard.py` blocks `transition: all`, layout-triggering properties in transitions, `loading="lazy"` combined with `fetchpriority="high"`, and images missing `width`/`height`.
