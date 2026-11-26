---
name: ui-10-bento-grid
description: Build bento grid UI where a fixed asymmetric panel composition presents several ideas as one object. Use for product feature sections, dashboards, app landing pages, and any page where the reference standard is linear.app and a uniform card row would waste the space.
metadata:
  origin: ningx
  ui-type: 10
  reference: https://linear.app
---

# UI Type 10 — Bento Grid

A fixed asymmetric grid of differently-sized panels, each holding one idea, reading as a single composition.

**Reference standard:** linear.app

## When to reach for it

- You have 5–9 features of genuinely different importance
- The page needs to communicate "one coherent product" not "a list"
- Screen real estate is abundant (desktop-first or responsive-up)
- Each feature can be shown, not just described

Do not use it for more than ~12 cells or fewer than 4. It stops being a composition.

## The signature

1. **One container, mixed spans.** Cells are 1×1, 2×1, 1×2, 2×2 — deliberately unequal.
2. **Every cell is a self-contained story.** Label + one visual. No cell is filler.
3. **The composition reads as one object**, not as separate cards. Tight gaps, shared radius, shared border treatment.

## The grid recipe

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 12px;
}
.cell--wide  { grid-column: span 2; }
.cell--tall  { grid-row: span 2; }
.cell--hero  { grid-column: span 2; grid-row: span 2; }
```

Four columns is the sweet spot. Three is too coarse, six gets fussy. Use 4.

## Composition patterns that work

**4-cell (2×2 hero layout)**
```
┌─────────┬─────┐
│  hero   │  a  │
│  (2×2)  ├─────┤
│         │  b  │
├────┬────┴─────┤
│ c  │    d     │
└────┴──────────┘
```

**6-cell (the classic)**
```
┌───────┬───────┬───────┐
│ hero  │   a   │   b   │
│ (2×1) │       │       │
├───────┼───────┴───────┤
│   c   │      d        │
├───────┼───────┬───────┤
│   e   │   f   │   g   │
└───────┴───────┴───────┘
```

**8-cell (dashboard)**
```
┌─────┬─────┬─────┬─────┐
│ 2×2 │  a  │  b  │  c  │
│     ├─────┴─────┼─────┤
│     │    d      │  e  │
├─────┼───────────┴─────┤
│  f  │       g         │
└─────┴─────────────────┘
```

Never leave a hole. If the composition does not tile, change a span.

## Tokens

```css
:root {
  --bg: #08090a;
  --surface: #101113;
  --surface-hover: #16181b;
  --border: #23252a;
  --ink: #f7f8f8;
  --ink-soft: #8a8f98;
  --accent: #5e6ad2;

  --font-body: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;

  --fs-h2: clamp(1.5rem, 2.5vw, 2rem);
  --fs-cell-title: 0.9375rem;
  --fs-cell-body: 0.875rem;

  --radius: 12px;
  --gap: 12px;
  --max-w: 1200px;
}
```

Bento is usually dark (Linear's signature). It also works light — the rules are the same, invert the ramp.

## Anatomy

```
<section class="bento-wrap">
  <header>               section heading + one-line description, left-aligned
  <div class="bento">
    <article class="cell cell--hero">
      <div class="cell__visual">    the visual takes most of the cell
      <div class="cell__text">      title + one line
    </article>
    <article class="cell cell--wide"> ... </article>
  </div>
</section>
```

Visual-first, text-second. A bento cell that is only text is a wasted cell.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relay — issues, cycles, and the work between</title>
<style>
  :root{
    --bg:#08090a; --surface:#101113; --surface-hover:#16181b; --border:#23252a;
    --ink:#f7f8f8; --ink-soft:#8a8f98; --accent:#5e6ad2;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --font-mono:ui-monospace,"SF Mono",monospace;
    --fs-h2:clamp(1.5rem,2.5vw,2rem); --fs-cell-title:.9375rem; --fs-cell-body:.875rem;
    --radius:12px; --gap:12px; --max-w:1200px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased}

  .wrap{max-width:var(--max-w);margin:0 auto;padding:0 clamp(1.25rem,4vw,2rem)}
  section{padding:clamp(4rem,9vw,7rem) 0}

  .section-head{max-width:56ch;margin-bottom:clamp(2rem,4vw,3rem)}
  .section-head h2{font-size:var(--fs-h2);font-weight:500;letter-spacing:-.02em;
                   line-height:1.15;margin:0 0 .75rem}
  .section-head p{color:var(--ink-soft);margin:0;font-size:1rem}

  .bento{display:grid;grid-template-columns:repeat(4,1fr);
         grid-auto-rows:minmax(170px,auto);gap:var(--gap)}

  .cell{
    position:relative;overflow:hidden;
    background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
    padding:1.25rem;display:flex;flex-direction:column;justify-content:flex-end;gap:.75rem;
    transition:background-color 180ms ease,border-color 180ms ease;
  }
  .cell:hover{background:var(--surface-hover);border-color:#2e3138}

  .cell--hero{grid-column:span 2;grid-row:span 2;justify-content:space-between}
  .cell--wide{grid-column:span 2}
  .cell--tall{grid-row:span 2}

  .cell__visual{flex:1;display:grid;place-items:center;min-height:0}
  .cell--hero .cell__visual{align-items:stretch}

  .cell__title{font-size:var(--fs-cell-title);font-weight:500;margin:0;letter-spacing:-.01em}
  .cell__body{font-size:var(--fs-cell-body);color:var(--ink-soft);margin:0;line-height:1.45}

  /* --- the visuals --- */
  .bar-stack{display:flex;align-items:flex-end;gap:6px;height:100%;width:100%;padding-top:1rem}
  .bar-stack span{flex:1;background:linear-gradient(to top,#1f2230,#2f3550);
                  border-radius:4px 4px 0 0;min-height:12px}
  .bar-stack span:nth-child(1){height:34%}
  .bar-stack span:nth-child(2){height:52%}
  .bar-stack span:nth-child(3){height:41%}
  .bar-stack span:nth-child(4){height:68%}
  .bar-stack span:nth-child(5){height:57%}
  .bar-stack span:nth-child(6){height:84%}
  .bar-stack span:nth-child(7){height:73%}

  .rows{display:grid;gap:8px;width:100%;align-content:center}
  .row-line{display:flex;align-items:center;gap:.625rem;padding:.5rem .625rem;
            background:#0c0d0f;border:1px solid var(--border);border-radius:7px}
  .dot{width:7px;height:7px;border-radius:50%;flex:none}
  .dot--todo{background:#8a8f98}
  .dot--prog{background:var(--accent)}
  .dot--done{background:#3fb950}
  .row-line span{font-size:.75rem;color:var(--ink-soft);font-family:var(--font-mono)}

  .badge{display:inline-flex;align-items:center;gap:.375rem;align-self:flex-start;
         padding:.2rem .5rem;border:1px solid var(--border);border-radius:999px;
         font:600 .6875rem/1 var(--font-mono);letter-spacing:.04em;color:var(--ink-soft)}

  .ring{width:88px;height:88px;border-radius:50%;
        background:conic-gradient(var(--accent) 0 72%,#1c1e23 72% 100%);
        display:grid;place-items:center;margin:0 auto}
  .ring::after{content:"72%";width:66px;height:66px;border-radius:50%;
               background:var(--surface);display:grid;place-items:center;
               font:600 .8125rem var(--font-mono);color:var(--ink)}

  @media (max-width:900px){
    .bento{grid-template-columns:repeat(2,1fr)}
    .cell--hero{grid-column:span 2;grid-row:span 1}
    .cell--wide{grid-column:span 2}
    .cell--tall{grid-row:span 1}
  }
  @media (max-width:560px){
    .bento{grid-template-columns:1fr}
    .cell--hero,.cell--wide{grid-column:span 1}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>

<section>
  <div class="wrap">

    <div class="section-head">
      <h2>Everything in one place, without the noise.</h2>
      <p>Issues, cycles, and the work between them — rendered as one surface instead of six tabs.</p>
    </div>

    <div class="bento">

      <article class="cell cell--hero">
        <div class="cell__visual">
          <div class="bar-stack" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div>
          <h3 class="cell__title">Cycle velocity, live</h3>
          <p class="cell__body">Every issue's state change updates the chart before the next render.</p>
        </div>
      </article>

      <article class="cell">
        <div class="cell__visual">
          <div class="rows" aria-hidden="true">
            <div class="row-line"><i class="dot dot--done"></i><span>REL-204</span></div>
            <div class="row-line"><i class="dot dot--prog"></i><span>REL-207</span></div>
            <div class="row-line"><i class="dot dot--todo"></i><span>REL-211</span></div>
          </div>
        </div>
        <h3 class="cell__title">Issues</h3>
      </article>

      <article class="cell">
        <div class="cell__visual">
          <div class="ring" aria-hidden="true"></div>
        </div>
        <h3 class="cell__title">Cycle progress</h3>
      </article>

      <article class="cell cell--wide">
        <div class="cell__visual" style="place-items:start">
          <span class="badge">⌘K · everything</span>
        </div>
        <div>
          <h3 class="cell__title">Keyboard first</h3>
          <p class="cell__body">Every action is reachable without moving to the mouse. The palette indexes issues, projects, and views.</p>
        </div>
      </article>

      <article class="cell">
        <div class="cell__visual">
          <div class="rows" aria-hidden="true">
            <div class="row-line"><i class="dot dot--prog"></i><span>v2.4 · ship</span></div>
            <div class="row-line"><i class="dot dot--todo"></i><span>v2.5 · plan</span></div>
          </div>
        </div>
        <h3 class="cell__title">Roadmap</h3>
      </article>

      <article class="cell">
        <div class="cell__visual">
          <span class="badge">local-first</span>
        </div>
        <h3 class="cell__title">Works offline</h3>
      </article>

    </div>
  </div>
</section>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Equal-size cells everywhere | That is a card grid, not a bento |
| Leave a hole in the composition | The tiling must be complete |
| Put only text in a cell | Every cell needs a visual |
| More than 12 cells | Stops reading as one object |
| Big gaps | Bento reads as one object because gaps are tight — 8–16px |
| Different radius per cell | Shared radius is what unifies the composition |
| Borders on some cells only | Uniform border treatment or none |
| A cell with three paragraphs | One idea per cell |

## Responsive strategy

Bento does not gracefully shrink — it restructures.

- **≥ 1024px**: 4 columns, full composition
- **900–1023px**: 2 columns, hero becomes `span 2 × 1`
- **< 560px**: 1 column, every cell `span 1`, order follows DOM

Do not attempt to preserve the composition on mobile. Stack it.

## Accessibility notes

- Cells are `<article>` with a heading inside, or `<div>` with a heading — never a bare div with text
- If a cell is clickable, the link is the heading's `<a>`, not an `onClick` div
- Decorative visuals get `aria-hidden="true"` (as above) so screen readers get the label, not the bars
- Contrast on `--ink-soft` over `--surface` must hit 4.5:1 — `#8a8f98` on `#101113` is ~4.6:1, tight but passing. Do not lighten it.

## Self-check before reporting

- [ ] Composition tiles completely — no holes
- [ ] Cells have at least two different sizes
- [ ] Every cell has a visual, not just text
- [ ] 4–12 cells total
- [ ] Shared `border-radius` and gap across all cells
- [ ] Every cell has a heading element
- [ ] Decorative visuals `aria-hidden`
- [ ] Restructures to 1 column on mobile, does not shrink
