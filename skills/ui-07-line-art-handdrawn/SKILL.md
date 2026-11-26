---
name: ui-07-line-art-handdrawn
description: Build line-art and hand-drawn UI where illustration is integrated into the layout rather than placed beside it. Use for product explainers, knowledge tools, education, and any page where the reference standard is notion.so and warmth should come from drawing rather than color.
metadata:
  origin: ningx
  ui-type: 7
  reference: https://www.notion.so
---

# UI Type 07 — Line-Art & Hand-Drawn

Thin strokes, imperfect geometry, illustration living inside the layout.

**Reference standard:** notion.so

## When to reach for it

- The product is conceptual and benefits from diagrams
- The audience is knowledge workers, students, or creators
- The brand is approachable without being childish
- You can produce or source consistent line art

Do not use it if you have no illustration capability. Hand-drawn type without hand-drawn art reads as a font choice, not a style.

## The signature

1. **One stroke weight across all art.** 1.5px at 24px icon size. Not 1px here and 2.5px there.
2. **Illustration sits inside content blocks**, not in a separate column.
3. **Ink-only.** No fills, no gradients, no shading. Maybe one accent fill used sparingly.

## The stroke discipline

The single most common failure is inconsistent stroke weight. Lock it:

```css
:root {
  --stroke: 1.5;              /* the one number */
  --stroke-color: #191919;
}
svg.icon, svg.spot {
  fill: none;
  stroke: var(--stroke-color);
  stroke-width: var(--stroke);
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;   /* keeps weight constant when scaled */
}
```

`vector-effect: non-scaling-stroke` is the trick that keeps a 24px icon and a 400px spot illustration looking like the same hand.

## Tokens

```css
:root {
  --paper: #ffffff;
  --paper-soft: #f7f7f5;
  --ink: #191919;
  --ink-soft: #5f5e5b;
  --muted: #91918e;
  --rule: #e9e9e7;
  --accent: #2f6f4e;          /* one, used on 5% of the page */

  --font-display: "Lyon Display", Georgia, serif;
  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-hand: "Caveat", "Segoe Script", cursive;   /* annotations only */

  --fs-display: clamp(2rem, 4vw, 3.25rem);
  --fs-h2: 1.5rem;
  --fs-body: 1rem;
  --fs-meta: 0.8125rem;

  --radius: 8px;
  --max-w: 1100px;
}
```

The hand face is for **marginalia only** — arrows, "this bit", callouts. Never body copy, never a headline.

## Anatomy

```
<section>
  <div class="inner">
    <div class="row">
      <div class="text">       heading + body
      <svg class="spot">       320×240 line illustration, same stroke
    </div>
    <div class="row row--rev">  alternate sides
  </div>
</section>
```

Plus inline `<svg class="icon">` at 20–24px inside list items and buttons, same stroke.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fieldnote — a notebook that thinks with you</title>
<style>
  :root{
    --paper:#fff; --paper-soft:#f7f7f5; --ink:#191919; --ink-soft:#5f5e5b;
    --muted:#91918e; --rule:#e9e9e7; --accent:#2f6f4e;
    --font-display:Georgia,serif;
    --font-body:system-ui,-apple-system,"Segoe UI",sans-serif;
    --font-hand:"Segoe Script","Bradley Hand",cursive;
    --fs-display:clamp(2rem,4vw,3.25rem); --fs-h2:1.5rem; --fs-body:1rem; --fs-meta:.8125rem;
    --radius:8px; --max-w:1100px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font:var(--fs-body)/1.65 var(--font-body);-webkit-font-smoothing:antialiased}

  svg.icon,svg.spot{fill:none;stroke:var(--ink);stroke-width:1.5;
                    stroke-linecap:round;stroke-linejoin:round;
                    vector-effect:non-scaling-stroke}
  svg.icon{width:22px;height:22px;flex:none}

  .inner{max-width:var(--max-w);margin:0 auto;padding:0 clamp(1.25rem,4vw,2.5rem)}
  section{padding:clamp(3rem,7vw,5.5rem) 0}
  section+section{border-top:1px solid var(--rule)}

  .row{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,4.5rem);align-items:center}
  .row--rev .text{order:2}
  .row--rev svg.spot{order:1}

  h1,h2{font-family:var(--font-display);font-weight:400;letter-spacing:-.015em;margin:0 0 1rem}
  h1{font-size:var(--fs-display);line-height:1.1;max-width:16ch}
  h2{font-size:var(--fs-h2);line-height:1.25}
  p{max-width:54ch;margin:0 0 1.25rem;color:var(--ink-soft)}

  .hand{font-family:var(--font-hand);font-size:1.125rem;color:var(--accent);
        display:inline-block;transform:rotate(-1.5deg);margin-top:.5rem}

  .list{list-style:none;margin:1.75rem 0 0;padding:0;display:grid;gap:.875rem}
  .list li{display:flex;gap:.75rem;align-items:flex-start;color:var(--ink-soft)}

  .btn{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;
       padding:0 1.125rem;border:1.5px solid var(--ink);border-radius:var(--radius);
       background:var(--paper);color:var(--ink);text-decoration:none;
       font-weight:500;transition:background-color 160ms ease,color 160ms ease}
  .btn:hover{background:var(--ink);color:var(--paper)}
  .btn:hover svg{stroke:var(--paper)}

  .nav{display:flex;align-items:center;gap:2rem;padding:1.25rem 0}
  .brand{display:flex;align-items:center;gap:.625rem;font-weight:600;
         text-decoration:none;color:inherit}
  .nav ul{display:flex;gap:1.75rem;list-style:none;margin:0 0 0 auto;padding:0;font-size:.9375rem}
  .nav a{color:var(--ink-soft);text-decoration:none}
  .nav a:hover{color:var(--ink)}

  a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

  @media (max-width:860px){
    .row{grid-template-columns:1fr}
    .row--rev .text{order:1}
    .row--rev svg.spot{order:2}
    svg.spot{max-width:360px}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>

<header class="inner">
  <nav class="nav" aria-label="Main">
    <a class="brand" href="/">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5c3-1 5-1 8 .5v13c-3-1.5-5-1.5-8-.5z"/>
        <path d="M20 5.5c-3-1-5-1-8 .5v13c3-1.5 5-1.5 8-.5z"/>
      </svg>
      Fieldnote
    </a>
    <ul>
      <li><a href="#how">How it works</a></li>
      <li><a href="#notes">Notes</a></li>
      <li><a href="#start">Start</a></li>
    </ul>
  </nav>
</header>

<main>

  <section>
    <div class="inner row">
      <div class="text">
        <h1>A notebook that thinks alongside you.</h1>
        <p>Write the way you already write. Fieldnote finds the threads between pages and draws them, so the second draft starts from what you actually meant.</p>
        <ul class="list">
          <li>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>
            <span>Links appear as you type — no manual tagging</span>
          </li>
          <li>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>
            <span>Every page keeps its own history, restorable to the minute</span>
          </li>
          <li>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>
            <span>Plain text underneath. Export and leave whenever you want</span>
          </li>
        </ul>
        <span class="hand">no lock-in, ever →</span>
      </div>

      <svg class="spot" viewBox="0 0 320 240" role="img" aria-label="Two notebook pages connected by a curved line">
        <rect x="28" y="48" width="104" height="140" rx="4"/>
        <path d="M44 76h72M44 92h72M44 108h52"/>
        <rect x="188" y="48" width="104" height="140" rx="4"/>
        <path d="M204 76h72M204 92h48"/>
        <path d="M132 118c20-26 36-26 56 0" stroke-dasharray="4 5"/>
        <circle cx="160" cy="118" r="3"/>
        <path d="M28 200h264"/>
        <path d="M262 40l6-8 6 8" />
      </svg>
    </div>
  </section>

  <section id="how">
    <div class="inner row row--rev">
      <div class="text">
        <h2>It reads the shape, not the words.</h2>
        <p>Fieldnote indexes structure: what links to what, what came before, what you keep returning to. Your content stays on your device until you ask for a sync.</p>
        <span class="hand">local-first by default</span>
      </div>
      <svg class="spot" viewBox="0 0 320 240" role="img" aria-label="A graph of connected nodes with one highlighted">
        <circle cx="160" cy="120" r="26"/>
        <circle cx="72" cy="72" r="16"/>
        <circle cx="248" cy="76" r="16"/>
        <circle cx="80" cy="176" r="16"/>
        <circle cx="244" cy="180" r="16"/>
        <path d="M88 82l48 26M232 86l-46 22M94 168l44-32M230 172l-44-36"/>
        <path d="M160 94V66M160 146v28"/>
        <circle cx="160" cy="56" r="4"/>
        <circle cx="160" cy="184" r="4"/>
      </svg>
    </div>
  </section>

  <section id="start">
    <div class="inner" style="text-align:left">
      <h2>Start with one page.</h2>
      <p>No account, no sync, no tour. Write something and see what it finds.</p>
      <a class="btn" href="#">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        Open a blank page
      </a>
    </div>
  </section>

</main>
</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Mix 1px and 2px strokes | The single weight is the entire style |
| Use filled icons | Fill kills the line-art reading |
| Use a 3D or photo illustration | Contradicts the medium |
| Put illustrations in a separate sidebar | They live inside the layout |
| Use the hand font for body copy | Marginalia only |
| Add gradients to illustrations | Ink only |
| Use four different icon sets | One set, one weight |
| Skip `vector-effect` | Stroke weight will drift when scaled |

## Sourcing illustrations

If you cannot draw: use a single open line-icon set (Lucide, Feather, Phosphor "thin") and **never mix sets**. For spot illustrations, build them from the same primitives — circles, rounded rects, 1.5px paths. A 20-line hand-authored SVG beats a stock illustration.

## Responsive

- Rows go single column below 860px, text first
- Spot SVGs cap at 360px and keep `viewBox` intact
- Icons never shrink below 18px

## Accessibility notes

- Decorative SVGs get `aria-hidden="true"`
- Meaningful SVGs get `role="img"` and `aria-label`
- Never put text inside an SVG that is not also in the DOM
- Thin strokes at 1.5px on a 22px icon are fine visually but check against a dark background

## Self-check before reporting

- [ ] Every SVG uses the same `stroke-width` value
- [ ] `vector-effect: non-scaling-stroke` present
- [ ] Zero fills on line art
- [ ] Illustration is inline in the content flow, not a sidebar
- [ ] Hand font used only for marginalia
- [ ] One icon set, no mixing
- [ ] Decorative SVGs `aria-hidden`, meaningful ones labelled
- [ ] Body copy is a system/UI sans, not the hand face
