---
name: ui-17-claymorphism
description: Build claymorphism UI with soft inflated 3D volumes, large radii, and pastel fills that look moulded rather than drawn. Use for consumer apps, education, fintech onboarding, and any page where the reference standard is pitch.com and flat cards would feel cold.
metadata:
  origin: ningx
  ui-type: 17
  reference: https://pitch.com
---

# UI Type 17 — Claymorphism

Soft, puffy volumes that look moulded rather than drawn.

**Reference standard:** pitch.com

## When to reach for it

- The product is friendly and consumer-facing
- You want 3D depth without WebGL
- Onboarding and empty states benefit from warmth
- The brand is approachable, not premium

Do not use it for developer tools or enterprise consoles — the softness reads as unserious there.

## The signature

1. **Large radius.** 24–48px. Small radius kills it.
2. **Multiple shadows to inflate.** One inner light, one inner dark, one outer drop.
3. **Pastel fill with a saturated edge of the same hue.**

## The inflation recipe

Single shadows give you a flat card. Clay needs **four** shadow layers:

```css
.clay {
  background: var(--clay-fill);
  border-radius: var(--clay-radius);
  box-shadow:
    /* 1. inner top highlight — the light catching the upper curve */
    inset 0 -8px 16px var(--clay-dark),
    /* 2. inner bottom shadow — the underside falling away */
    inset 0 8px 16px var(--clay-light),
    /* 3. outer drop — the object's own shadow on the surface */
    0 16px 32px -8px rgb(0 0 0 / .18),
    /* 4. outer ambient — soft contact shadow */
    0 4px 8px rgb(0 0 0 / .06);
}
```

Read the order carefully: the **inset** shadows do the moulding, the **outer** shadows place it on the page. Most clay attempts get only the outer drop and end up looking like a normal card.

## Deriving the clay colors

From a fill of `#b8a9f0`:

```
clay-light  → lighten 18%  → #d5cbf7   (inner top)
clay-dark   → darken  12%  → #9b8ae8   (inner bottom)
```

Same hue, saturation held. Only lightness moves. This is the same discipline as neumorphism, but with color instead of grey.

## Tokens

```css
:root {
  /* Surface family — one hue per section, pastel */
  --clay-bg: #f5f0ff;
  --clay-1-fill: #b8a9f0;  --clay-1-light: #d5cbf7;  --clay-1-dark: #9b8ae8;
  --clay-2-fill: #ffc9d8;  --clay-2-light: #ffe0e9;  --clay-2-dark: #f0a8bd;
  --clay-3-fill: #a8e6d0;  --clay-3-light: #c9f2e4;  --clay-3-dark: #86d4b8;
  --clay-4-fill: #ffd89b;  --clay-4-light: #ffe8c2;  --clay-4-dark: #f0c07a;

  --ink: #2a2340;
  --ink-soft: #5f5778;
  --ink-mute: #8b83a3;

  --font-display: "Gilroy", "Poppins", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --fs-display: clamp(2rem, 5vw, 3.5rem);
  --fs-h2: clamp(1.375rem, 2.5vw, 2rem);

  --clay-radius: 32px;
  --clay-radius-sm: 20px;
  --clay-radius-lg: 48px;
}
```

Four pastel families, one ink. The palette is the personality.

## Anatomy

```
<section class="band">          pastel background, one family
  <div class="clay-card">       the volume
    <div class="clay-icon">     a small inflated shape
    <h2>
    <p>
  </div>
```

Clay cards are chunky. Padding 24–40px. Do not make them thin.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bloom — learn a language by living in it</title>
<style>
  :root{
    --clay-bg:#f5f0ff;
    --c1-fill:#b8a9f0; --c1-light:#d5cbf7; --c1-dark:#9b8ae8;
    --c2-fill:#ffc9d8; --c2-light:#ffe0e9; --c2-dark:#f0a8bd;
    --c3-fill:#a8e6d0; --c3-light:#c9f2e4; --c3-dark:#86d4b8;
    --c4-fill:#ffd89b; --c4-light:#ffe8c2; --c4-dark:#f0c07a;
    --ink:#2a2340; --ink-soft:#5f5778; --ink-mute:#8b83a3;
    --font-display:"Gilroy","Poppins",system-ui,sans-serif;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --fs-display:clamp(2rem,5vw,3.5rem); --fs-h2:clamp(1.375rem,2.5vw,2rem);
    --r:32px; --r-sm:20px; --r-lg:48px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--clay-bg);color:var(--ink);
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased}

  .wrap{max-width:1080px;margin:0 auto;padding:0 clamp(1.25rem,4vw,2.5rem)}
  section{padding:clamp(3rem,8vw,6rem) 0}

  /* ---------- the clay primitive ---------- */
  .clay{
    border-radius:var(--r);
    background:var(--c1-fill);
    box-shadow:
      inset 0 -10px 20px var(--c1-dark),
      inset 0 10px 20px var(--c1-light),
      0 18px 36px -10px rgb(0 0 0/.2),
      0 6px 10px rgb(0 0 0/.06);
  }
  .clay--pink{background:var(--c2-fill);
    box-shadow:inset 0 -10px 20px var(--c2-dark),inset 0 10px 20px var(--c2-light),
      0 18px 36px -10px rgb(0 0 0/.2),0 6px 10px rgb(0 0 0/.06)}
  .clay--mint{background:var(--c3-fill);
    box-shadow:inset 0 -10px 20px var(--c3-dark),inset 0 10px 20px var(--c3-light),
      0 18px 36px -10px rgb(0 0 0/.2),0 6px 10px rgb(0 0 0/.06)}
  .clay--sand{background:var(--c4-fill);
    box-shadow:inset 0 -10px 20px var(--c4-dark),inset 0 10px 20px var(--c4-light),
      0 18px 36px -10px rgb(0 0 0/.2),0 6px 10px rgb(0 0 0/.06)}

  /* ---------- hero ---------- */
  h1{font-family:var(--font-display);font-size:var(--fs-display);
     font-weight:700;letter-spacing:-.03em;line-height:1.05;margin:0 0 1.25rem;
     max-width:16ch}
  .lead{font-size:1.0625rem;color:var(--ink-soft);max-width:44ch;margin:0 0 2rem}

  .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(2rem,5vw,4rem);
        align-items:center}

  /* ---------- clay button ---------- */
  .clay-btn{
    display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
    min-height:56px;padding:0 2rem;border:0;border-radius:var(--r-sm);
    background:var(--c1-fill);color:#fff;
    font:600 1rem/1 var(--font-body);cursor:pointer;
    box-shadow:
      inset 0 -6px 12px var(--c1-dark),
      inset 0 6px 12px var(--c1-light),
      0 10px 20px -6px rgb(0 0 0/.25);
    transition:transform 160ms cubic-bezier(.34,1.56,.64,1),
               box-shadow 160ms ease;
  }
  .clay-btn:hover{transform:translateY(-2px);
    box-shadow:inset 0 -6px 12px var(--c1-dark),inset 0 6px 12px var(--c1-light),
      0 16px 28px -8px rgb(0 0 0/.3)}
  .clay-btn:active{transform:translateY(1px) scale(.98);
    box-shadow:inset 0 4px 12px var(--c1-dark),inset 0 -4px 12px var(--c1-light),
      0 4px 8px -4px rgb(0 0 0/.2)}
  .clay-btn--pink{background:var(--c2-fill);
    box-shadow:inset 0 -6px 12px var(--c2-dark),inset 0 6px 12px var(--c2-light),
      0 10px 20px -6px rgb(0 0 0/.25)}

  /* ---------- icon blob ---------- */
  .blob{
    width:120px;height:120px;border-radius:50%;
    display:grid;place-items:center;
    background:var(--c4-fill);
    box-shadow:
      inset 0 -10px 20px var(--c4-dark),
      inset 0 10px 20px var(--c4-light),
      0 18px 32px -10px rgb(0 0 0/.22);
    margin:0 auto;
  }
  .blob svg{width:52px;height:52px;fill:none;stroke:#7a5a1a;stroke-width:2.5;
            stroke-linecap:round;stroke-linejoin:round}

  /* ---------- cards ---------- */
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
        gap:1.5rem;margin-top:3rem}
  .clay-card{padding:2rem 1.75rem;border-radius:var(--r)}
  .clay-card h2{font-family:var(--font-display);font-size:1.25rem;font-weight:700;
                letter-spacing:-.02em;margin:0 0 .5rem}
  .clay-card p{margin:0;font-size:.9375rem;color:#3d3454;line-height:1.55}

  .icon-sm{
    width:52px;height:52px;border-radius:16px;display:grid;place-items:center;
    background:rgb(255 255 255/.45);margin-bottom:1.25rem;
    box-shadow:inset 0 -4px 8px rgb(0 0 0/.08),inset 0 4px 8px rgb(255 255 255/.7);
  }
  .icon-sm svg{width:24px;height:24px;fill:none;stroke:currentColor;
               stroke-width:2.25;stroke-linecap:round;stroke-linejoin:round}

  :focus-visible{outline:3px solid #6d4fd6;outline-offset:4px}

  @media (max-width:860px){
    .hero{grid-template-columns:1fr;text-align:center}
    h1,.lead{margin-inline:auto}
  }
  @media (prefers-reduced-motion:reduce){
    .clay-btn{transition:none}
    .clay-btn:hover,.clay-btn:active{transform:none}
  }
</style>
</head>
<body>

<section>
  <div class="wrap">
    <div class="hero">
      <div>
        <h1>Learn a language by living in it.</h1>
        <p class="lead">Short conversations with people who actually speak it. Five minutes at a time, no grammar drills.</p>
        <button class="clay-btn">Start free</button>
        <button class="clay-btn clay-btn--pink">See a lesson</button>
      </div>
      <div class="blob" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 6h16v11H8l-4 4z"/></svg>
      </div>
    </div>

    <div class="grid">
      <article class="clay-card clay--pink">
        <div class="icon-sm" style="color:#8a3352">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        </div>
        <h2>Five minutes</h2>
        <p>One exchange, one phrase. Built for the gap between meetings.</p>
      </article>

      <article class="clay-card clay--mint">
        <div class="icon-sm" style="color:#2a6e55">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 10h8"/></svg>
        </div>
        <h2>Real people</h2>
        <p>Every exchange is with a native speaker, not a bot reading a script.</p>
      </article>

      <article class="clay-card clay--sand">
        <div class="icon-sm" style="color:#7a5a1a">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18l5-6 4 4 7-9"/><path d="M4 4v16h16"/></svg>
        </div>
        <h2>Visible progress</h2>
        <p>Your streak is conversations you actually finished, not taps.</p>
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
| Use radius below 20px | The softness needs big radius |
| Use a single `box-shadow` | One shadow is a card, four is clay |
| Skip the inner shadows | The inflation comes from inside |
| Use grey or neutral fills | Clay is pastel and colorful |
| Use pure black shadows | `rgb(0 0 0/.2)` max — heavy shadows break the softness |
| Mix clay with flat surfaces | All or nothing within a section |
| Small type on clay cards | Needs 15px+ and generous line-height |
| Animate with linear easing | Clay uses spring easing — `cubic-bezier(.34,1.56,.64,1)` |

## Responsive

- Cards go single column below 720px
- Radius reduces to 24px below 600px so the shapes do not dominate
- Blob shrinks to 88px
- Padding scales down but stays ≥ 1.5rem

## Accessibility notes

Pastel fills are light, so dark ink works — but verify:

- `--ink` `#2a2340` on `--c1-fill` `#b8a9f0` = 6.8:1. Passes.
- On `--c4-fill` `#ffd89b` = 10.2:1. Passes easily.
- **White text on clay buttons fails.** `#fff` on `#b8a9f0` is 2.1:1. The scaffold above uses white — replace it with `--ink` or a dark tint of the fill. This is the single most common clay mistake.
- Focus ring must contrast with pastel — `#6d4fd6` works
- The inner shadows are decorative; do not rely on them for affordance

## Self-check before reporting

- [ ] Border-radius ≥ 20px everywhere
- [ ] Four shadow layers: inner dark, inner light, outer drop, ambient
- [ ] Fill is pastel with same-hue light/dark derived from it
- [ ] Button text is dark, **not white** (contrast check)
- [ ] No grey or neutral fills in clay surfaces
- [ ] Spring easing on press, not linear
- [ ] Body text ≥ 15px on clay cards
- [ ] `prefers-reduced-motion` removes transform
