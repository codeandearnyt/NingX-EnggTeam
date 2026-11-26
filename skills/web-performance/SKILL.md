---
name: web-performance
description: Meet Core Web Vitals and keep a page fast — LCP, CLS, INP budgets, image and font strategy, code splitting, render-blocking elimination, and the measurement commands that prove it. Use when a page feels slow, before shipping a new route, or when a Lighthouse score is under 90.
metadata:
  origin: ningx
  layer: craft
---

# Web Performance

Measured, not guessed. Every claim below has a number and a way to check it.

## The budgets

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| **LCP** Largest Contentful Paint | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| **INP** Interaction to Next Paint | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** Cumulative Layout Shift | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **TTFB** Time to First Byte | ≤ 800ms | 800–1800ms | > 1800ms |

INP replaced FID in March 2024. If a checklist still says FID, it is stale.

Plus the weight budget:

| Asset | Budget |
|---|---|
| HTML | < 30 KB gzipped |
| CSS (initial) | < 50 KB gzipped |
| JS (initial route) | < 170 KB gzipped |
| Fonts | < 100 KB total, ≤ 2 families |
| Hero image | < 200 KB |
| Total initial transfer | < 500 KB |

## LCP — the four causes, in order

LCP is almost always one of these:

**1. The hero image is too large or discovered too late.**

```html
<!-- WRONG: discovered after CSS parses -->
<img src="/hero.jpg" alt="...">

<!-- RIGHT: preloaded, sized, prioritised -->
<link rel="preload" as="image" href="/hero.avif"
      imagesrcset="/hero-800.avif 800w, /hero-1600.avif 1600w"
      imagesizes="100vw" fetchpriority="high">

<img src="/hero.avif"
     srcset="/hero-800.avif 800w, /hero-1600.avif 1600w"
     sizes="100vw"
     width="1600" height="900"
     alt="..."
     fetchpriority="high"
     decoding="async">
```

`fetchpriority="high"` on the LCP image is the single highest-leverage attribute on a marketing page. It lifts the image above the CSS and font requests.

**2. A render-blocking font.**

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-display: swap;        /* text shows immediately in fallback */
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
                 U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

```html
<link rel="preload" as="font" type="font/woff2"
      href="/fonts/inter-var.woff2" crossorigin>
```

`font-display: swap` shows fallback text immediately. Pair it with `size-adjust` so the swap does not shift layout:

```css
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

**3. Render-blocking CSS/JS in `<head>`.**

```html
<!-- blocking -->
<link rel="stylesheet" href="/app.css">
<script src="/app.js"></script>

<!-- non-blocking -->
<link rel="stylesheet" href="/app.css">
<link rel="stylesheet" href="/print.css" media="print" onload="this.media='all'">
<script src="/app.js" type="module" defer></script>
```

`type="module"` is deferred by default. Classic scripts need `defer` explicitly.

**4. A client-side render with no server HTML.**

If the LCP element only exists after JS runs, LCP includes hydration. Either server-render the hero, or ship it as static HTML above the framework mount point.

## CLS — every shift has a cause

| Cause | Fix |
|---|---|
| Image without dimensions | `width` + `height`, or `aspect-ratio` |
| Ad/embed without reserved space | `min-height` on the slot |
| Font swap shifting text | `size-adjust` fallback face |
| Banner injected above content | Reserve the space, or position it fixed |
| Late-loading cookie bar | Reserve, or `position: fixed` |
| Skeleton with wrong height | Match the real content height exactly |

```css
/* the universal fix */
img, video, iframe {
  display: block;
  max-width: 100%;
  height: auto;
}
img { aspect-ratio: attr(width) / attr(height); }
```

Modern browsers compute the aspect ratio from the `width`/`height` attributes automatically. Adding both attributes is the whole fix.

## INP — the interaction budget

INP measures the time from a user interaction to the next painted frame. Three causes:

1. **Long tasks on the main thread** (> 50ms). Break them up.
2. **Heavy event handlers.** Debounce, or move work off the interaction path.
3. **Synchronous layout reads after writes.** Layout thrashing.

```js
// BAD: forces layout after every write
items.forEach(item => {
  item.style.width = '200px';
  const h = item.offsetHeight;    // forced reflow
});

// GOOD: batch reads, then writes
const heights = items.map(i => i.offsetHeight);
items.forEach((item, i) => {
  item.style.width = '200px';
  item.style.height = `${heights[i]}px`;
});
```

Yielding for long work:

```js
async function processInChunks(items, fn) {
  for (let i = 0; i < items.length; i++) {
    fn(items[i]);
    if (i % 50 === 0) {
      await new Promise(r => setTimeout(r, 0));  // yield to the browser
    }
  }
}
```

## Images — the format ladder

```html
<picture>
  <source type="image/avif" srcset="/img/a-800.avif 800w, /img/a-1600.avif 1600w" sizes="(min-width: 900px) 50vw, 100vw">
  <source type="image/webp" srcset="/img/a-800.webp 800w, /img/a-1600.webp 1600w" sizes="(min-width: 900px) 50vw, 100vw">
  <img src="/img/a-800.jpg"
       srcset="/img/a-800.jpg 800w, /img/a-1600.jpg 1600w"
       sizes="(min-width: 900px) 50vw, 100vw"
       width="1600" height="900" alt="..."
       loading="lazy" decoding="async">
</picture>
```

Rules:

- AVIF → WebP → JPEG, in that order
- `width` + `height` always
- `loading="lazy"` on everything **below** the fold, never on the LCP image
- `sizes` must match the actual rendered width or the browser downloads the wrong file
- `decoding="async"` on non-LCP images

## Fonts

Two families maximum. Variable where possible — one file covers every weight.

```css
/* one variable file, all weights */
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0000-00FF, U+2000-206F;
}
```

Subset with `glyphhanger` or `fonttools`. A full Latin face is ~120KB; a subset for a marketing page is ~25KB.

```bash
pyftsubset Inter.woff2 \
  --unicodes="U+0020-007E,U+00A0-00FF,U+2010-2027" \
  --flavor=woff2 \
  --output-file=inter-subset.woff2
```

## JavaScript

```js
// route-level split
const Dashboard = lazy(() => import('./routes/Dashboard.js'));

// interaction-level split — the editor only loads when clicked
button.addEventListener('click', async () => {
  const { openEditor } = await import('./editor.js');
  openEditor();
}, { once: true });
```

Check what is in the initial bundle:

```bash
npx vite-bundle-visualizer
# or
npx source-map-explorer dist/assets/*.js
```

Anything above 30KB gzipped in the initial bundle needs a justification.

## Measurement — the actual commands

```bash
# Lighthouse, mobile, throttled
npx lighthouse http://localhost:3000 --preset=desktop --view
npx lighthouse http://localhost:3000 --form-factor=mobile --throttling-method=simulate --view

# Field data for a real URL
# https://pagespeed.web.dev/

# Bundle size
npx vite-bundle-visualizer
du -sh dist/assets/*

# Render-blocking audit in DevTools:
#   Performance panel → record → look at the "Render blocking" track
```

Lab data (Lighthouse) and field data (CrUX) differ. Ship against lab; verify against field.

## The 80/20

If you do only five things:

1. `fetchpriority="high"` on the LCP image, and preload it
2. `width`/`height` on every image
3. `font-display: swap` + `size-adjust` fallback
4. Split the initial bundle to under 170KB gzipped
5. `defer` or `type="module"` on every script

Those five move a typical site from 60 to 95.

## Self-check before reporting

- [ ] LCP measured, ≤ 2.5s on mobile throttling
- [ ] LCP image preloaded with `fetchpriority="high"`
- [ ] Every image has `width` and `height`
- [ ] CLS measured, ≤ 0.1
- [ ] INP measured, ≤ 200ms
- [ ] Fonts: `swap`, preloaded, subset, ≤ 2 families
- [ ] Initial JS ≤ 170KB gzipped
- [ ] No render-blocking script in `<head>`
- [ ] `loading="lazy"` on below-fold images only
- [ ] Numbers reported, not "feels fast"
