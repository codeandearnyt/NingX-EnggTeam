---
name: ui-05-swiss-grid
description: Build minimalist Swiss-grid UI where restraint signals authority and the grid is felt but never drawn. Use for premium commerce, editorial products, portfolios, and any page where the reference standard is aesop.com and generous space is the design.
metadata:
  origin: ningx
  ui-type: 5
  reference: https://www.aesop.com
---

# UI Type 05 — Minimalist / Swiss Grid

The grid is visible in the result even though it is never drawn. Restraint is the product.

**Reference standard:** aesop.com

## When to reach for it

- The product is expensive and the page should say so without saying so
- Content is sparse enough to survive large margins
- The brand is confidence, not enthusiasm
- Photography is good enough to be the only ornament

Do not use it for feature-rich SaaS. Sparse layout makes a long feature list look thin.

## The signature

1. **Asymmetric column split.** Content occupies 3–5 of 12 columns. Never all 12.
2. **Small type in large space.** Body at 15–16px with 1.7 line-height and a 60ch measure.
3. **Near-monochrome.** One ink, one paper, one muted. Hairline rules instead of boxes.

## The grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 5vw, 5rem);
}
.grid > .col-5 { grid-column: 2 / span 5; }   /* left-anchored, offset by one */
.grid > .col-4 { grid-column: 8 / span 4; }   /* right block, gap in the middle */
```

The **gap in the middle** is the move. Left block ends at column 6, right block starts at column 8. That empty column is what reads as Swiss.

## Tokens

```css
:root {
  --paper: #f4f2ee;
  --ink: #1a1a1a;
  --muted: #7a7671;
  --rule: #d8d4ce;
  --accent: #6b6b4a;        /* optional, used once on the whole page */

  --font-display: "Aesop", Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;

  --fs-display: clamp(2rem, 4.5vw, 3.5rem);
  --fs-h2: clamp(1.25rem, 2vw, 1.75rem);
  --fs-body: 0.9375rem;     /* 15px */
  --fs-meta: 0.75rem;       /* 12px, uppercase, tracked */

  --lh-body: 1.75;
  --measure: 58ch;
  --section-y: clamp(4rem, 10vw, 9rem);
}
```

Body at 15px is deliberate. Most pages over-size body text; small text in large space is the entire gesture.

## Anatomy

```
<header>            logo left, nav right, hairline rule below
<section>
  <div class="grid">
    <div class="col-5">    heading + body, left-anchored, offset one column
    <div class="col-4">    image or secondary content, separated by empty column
  </div>
</section>
<section>            alternate: image left, text right
```

Sections are separated by `--section-y` padding only. No dividers, no background changes.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maru — objects for the desk</title>
<style>
  :root{
    --paper:#f4f2ee; --ink:#1a1a1a; --muted:#7a7671; --rule:#d8d4ce; --accent:#6b6b4a;
    --font-display:Georgia,"Times New Roman",serif;
    --font-body:system-ui,-apple-system,"Segoe UI",sans-serif;
    --fs-display:clamp(2rem,4.5vw,3.5rem);
    --fs-h2:clamp(1.25rem,2vw,1.75rem);
    --fs-body:.9375rem; --fs-meta:.75rem;
    --measure:58ch; --section-y:clamp(4rem,10vw,9rem);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font:var(--fs-body)/1.75 var(--font-body);
       -webkit-font-smoothing:antialiased}

  .grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));
        gap:clamp(1rem,2vw,2rem);max-width:1440px;margin:0 auto;
        padding:0 clamp(1.5rem,5vw,5rem)}
  .col-5{grid-column:2/span 5}
  .col-4{grid-column:8/span 4}

  header{border-bottom:1px solid var(--rule)}
  .nav{display:flex;align-items:baseline;justify-content:space-between;
       padding:1.75rem 0}
  .brand{font-family:var(--font-display);font-size:1.125rem;letter-spacing:.18em;
         text-transform:uppercase;text-decoration:none;color:inherit}
  .nav ul{display:flex;gap:2.25rem;list-style:none;margin:0;padding:0;
          font-size:var(--fs-meta);letter-spacing:.12em;text-transform:uppercase}
  .nav a{color:var(--ink);text-decoration:none}
  .nav a:hover{color:var(--muted)}

  section{padding:var(--section-y) 0}
  .eyebrow{font-size:var(--fs-meta);letter-spacing:.16em;text-transform:uppercase;
           color:var(--muted);margin:0 0 1.75rem}
  h1{font-family:var(--font-display);font-weight:400;font-size:var(--fs-display);
     line-height:1.12;letter-spacing:-.015em;margin:0 0 1.75rem;max-width:20ch}
  h2{font-family:var(--font-display);font-weight:400;font-size:var(--fs-h2);
     line-height:1.25;margin:0 0 1.25rem;max-width:26ch}
  p{max-width:var(--measure);margin:0 0 1.5rem;color:var(--ink)}
  p.soft{color:var(--muted)}

  .link{display:inline-block;font-size:var(--fs-meta);letter-spacing:.14em;
        text-transform:uppercase;color:var(--ink);text-decoration:none;
        border-bottom:1px solid var(--ink);padding-bottom:.35rem;
        transition:border-color 160ms ease,color 160ms ease}
  .link:hover{border-color:var(--muted);color:var(--muted)}

  figure{margin:0}
  figure img{display:block;width:100%;height:auto}
  figcaption{margin-top:.875rem;font-size:var(--fs-meta);letter-spacing:.06em;
             color:var(--muted)}

  a:focus-visible,button:focus-visible{outline:1px solid var(--ink);outline-offset:6px}

  @media (max-width:900px){
    .col-5,.col-4{grid-column:1/-1}
    .col-4{order:-1}
    h1{max-width:14ch}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>

<header>
  <div class="grid">
    <nav class="nav" style="grid-column:1/-1" aria-label="Main">
      <a class="brand" href="/">Maru</a>
      <ul>
        <li><a href="#objects">Objects</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#stockists">Stockists</a></li>
      </ul>
    </nav>
  </div>
</header>

<section>
  <div class="grid">
    <div class="col-5">
      <p class="eyebrow">Made in Kyoto since 1974</p>
      <h1>Objects that outlast the desk they sit on.</h1>
      <p>Twelve pieces, turned from a single block. No coating, no lacquer — the surface is the material, finished by hand until it stops changing.</p>
      <a class="link" href="#objects">View the collection</a>
    </div>
    <figure class="col-4">
      <img src="/img/desk-set.jpg" width="800" height="1000"
           alt="Three turned wooden desk objects arranged on a pale surface">
      <figcaption>Set No. 3 — ash, oiled</figcaption>
    </figure>
  </div>
</section>

<section>
  <div class="grid">
    <figure class="col-4">
      <img src="/img/workshop.jpg" width="800" height="600"
           alt="A lathe in a narrow workshop with shavings on the floor">
      <figcaption>The workshop, Nakagyo ward</figcaption>
    </figure>
    <div class="col-5">
      <p class="eyebrow">The method</p>
      <h2>One block, one turn, one finish.</h2>
      <p class="soft">Nothing is glued. Nothing is veneered. Each piece comes off the lathe as a single solid form, then rests for six weeks before it is oiled.</p>
    </div>
  </div>
</section>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Center anything | Swiss is left-aligned, always |
| Fill all 12 columns | The empty column is the design |
| Use a sans-serif display face | The serif/grotesque contrast carries the authority |
| Add a second accent | One accent, used once, or none |
| Increase body to 18px | Small text in large space is the gesture |
| Add cards | No boxes. Hairlines only. |
| Add hover animations | Underline color shift is the entire motion budget |
| Use a hero image full-bleed | Images sit in a column, not across |

## Responsive

- Below 900px, single column, image first
- Margins shrink but never below 1.5rem
- Display type floor at 2rem
- Nav collapses to the brand + one "Menu" link

## Accessibility notes

Near-monochrome palettes fail contrast easily. Verify:

- `--muted` on `--paper` must hit 4.5:1 for body, 3:1 for 12px uppercase meta is **not** acceptable — meta text is still text. Either darken `--muted` or raise meta to 13px.
- Hairline rules at 1px `--rule` are decorative; do not rely on them for structure
- Focus outline at 1px is thin — use `outline-offset` to make it visible, or bump to 2px
- Images need real `width`/`height` to prevent CLS

## Self-check before reporting

- [ ] Content never fills all 12 columns
- [ ] At least one empty column between left and right blocks
- [ ] Body text 15–16px with ≥1.7 line-height
- [ ] Measure capped at 60ch
- [ ] Left-aligned throughout — zero centering
- [ ] One accent color maximum, used once
- [ ] No cards, no shadows, no border-radius above 2px
- [ ] Contrast checked on `--muted` against `--paper`
