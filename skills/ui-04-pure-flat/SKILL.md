---
name: ui-04-pure-flat
description: Build pure flat design UI where color fields and type carry all hierarchy with no shadow, gradient, or texture. Use for brand-forward marketing pages, consumer products, and any page where the reference standard is mailchimp.com and depth would muddy the message.
metadata:
  origin: ningx
  ui-type: 4
  reference: https://mailchimp.com
---

# UI Type 04 — Pure Flat Design

No shadow. No gradient. No texture. Color blocks and type do all the work.

**Reference standard:** mailchimp.com

## When to reach for it

- One strong brand color needs to carry the page
- The audience is broad and non-technical
- Illustration is available and should lead
- You need to ship fast without a depth system

## The signature

1. **Full-bleed color bands.** Sections are solid fields, edge to edge.
2. **One accent, used in large areas.** Not a sprinkle — a field.
3. **Zero elevation.** Hierarchy comes from size, weight, and color value only.

## The hard rules

| Property | Allowed value |
|---|---|
| `box-shadow` | `none` — always |
| `background-image` | `none` except `url()` for illustration |
| `border-radius` | `0`, `4px`, or `999px` (pills only) |
| Gradients | Banned |
| Filters | Banned |
| Borders | 0 or 1px solid, used sparingly |

If a shadow appears anywhere, the build is rejected.

## Tokens

```css
:root {
  /* One accent hue, three values */
  --brand: #ffe01b;          /* the field color */
  --brand-ink: #241c15;      /* text on brand */
  --brand-deep: #d9be00;     /* hover */

  /* Neutral field */
  --paper: #ffffff;
  --ink: #241c15;
  --ink-soft: #5c534c;
  --rule: #e8e4e0;

  /* Secondary field — one, not three */
  --field-alt: #f6f3ef;

  --font-display: "Means Web", Georgia, serif;
  --font-body: "Graphik Web", system-ui, sans-serif;

  --fs-display: clamp(2.5rem, 6vw, 4.5rem);
  --fs-h2: clamp(1.75rem, 3.5vw, 2.75rem);
  --fs-lead: clamp(1.125rem, 1.8vw, 1.375rem);
  --fs-body: 1.0625rem;

  --space: 8px;
  --max-w: 1200px;
  --band-y: clamp(4rem, 9vw, 7rem);
}
```

Two faces only: a display serif and a body sans. That pairing is what keeps flat design from reading as generic startup.

## Anatomy

```
<header>                     transparent or brand field, no shadow
<section class="band">       full-bleed color field
  <div class="inner">        max-width container
    <h2>
    <p class="lead">
    <div class="actions">    solid button + text link
  </div>
</section>
<section class="band--alt">  alternating field
```

Bands alternate. That alternation *is* the section separation — no dividers, no shadows.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Postcards — send better email</title>
<style>
  :root{
    --brand:#ffe01b; --brand-ink:#241c15; --brand-deep:#d9be00;
    --paper:#fff; --ink:#241c15; --ink-soft:#5c534c; --rule:#e8e4e0;
    --field-alt:#f6f3ef;
    --font-display:Georgia,"Times New Roman",serif;
    --font-body:system-ui,-apple-system,"Segoe UI",sans-serif;
    --fs-display:clamp(2.5rem,6vw,4.5rem);
    --fs-h2:clamp(1.75rem,3.5vw,2.75rem);
    --fs-lead:clamp(1.125rem,1.8vw,1.375rem);
    --fs-body:1.0625rem;
    --max-w:1200px;
    --band-y:clamp(4rem,9vw,7rem);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--paper);color:var(--ink);
       font:var(--fs-body)/1.6 var(--font-body);
       -webkit-font-smoothing:antialiased}

  .inner{max-width:var(--max-w);margin:0 auto;padding:0 clamp(1.25rem,4vw,2.5rem)}

  .band{padding:var(--band-y) 0}
  .band--brand{background:var(--brand);color:var(--brand-ink)}
  .band--alt{background:var(--field-alt)}

  h1,h2{font-family:var(--font-display);font-weight:400;margin:0 0 .5em;line-height:1.08;letter-spacing:-.02em}
  h1{font-size:var(--fs-display)}
  h2{font-size:var(--fs-h2)}
  .lead{font-size:var(--fs-lead);color:var(--ink-soft);max-width:52ch;margin:0 0 2rem;line-height:1.5}
  .band--brand .lead{color:var(--brand-ink);opacity:.78}

  .actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
  .btn{
    display:inline-flex;align-items:center;justify-content:center;
    min-height:52px;padding:0 1.75rem;border:0;border-radius:999px;
    font:600 1rem/1 var(--font-body);cursor:pointer;
    background:var(--ink);color:var(--paper);
    transition:background-color 160ms ease;
  }
  .btn:hover{background:#000}
  .band--brand .btn{background:var(--brand-ink);color:var(--brand)}
  .band--brand .btn:hover{background:#000;color:var(--brand)}
  .btn--ghost{background:transparent;color:inherit;text-decoration:underline;padding:0;min-height:44px}
  .btn--ghost:hover{background:transparent;text-decoration-thickness:2px}

  a:focus-visible,.btn:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
  .band--brand a:focus-visible,.band--brand .btn:focus-visible{outline-color:var(--brand-ink)}

  .grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:clamp(2rem,5vw,4rem)}
  .grid3 h3{font-family:var(--font-display);font-size:1.375rem;font-weight:400;margin:0 0 .5rem}
  .grid3 p{margin:0;color:var(--ink-soft);max-width:38ch}

  header{background:var(--paper)}
  .nav{display:flex;align-items:center;gap:2rem;padding:1.25rem 0}
  .nav .logo{font-family:var(--font-display);font-size:1.5rem;text-decoration:none;color:inherit}
  .nav ul{display:flex;gap:1.75rem;list-style:none;margin:0 0 0 auto;padding:0;font-size:.9375rem}
  .nav a{color:inherit;text-decoration:none}
  .nav a:hover{text-decoration:underline;text-underline-offset:4px}

  @media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
</style>
</head>
<body>

<header class="inner">
  <nav class="nav" aria-label="Main">
    <a class="logo" href="/">Postcards</a>
    <ul>
      <li><a href="#features">Features</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#start">Start free</a></li>
    </ul>
  </nav>
</header>

<section class="band band--brand">
  <div class="inner">
    <h1>Email that looks like<br>you meant it.</h1>
    <p class="lead">Design a campaign in an afternoon. Send it to a list of one or one million. See who opened it before lunch.</p>
    <div class="actions">
      <a class="btn" href="#start">Start free</a>
      <a class="btn btn--ghost" href="#demo">Watch the demo</a>
    </div>
  </div>
</section>

<section class="band band--alt" id="features">
  <div class="inner">
    <h2>Three things it does well</h2>
    <div class="grid3">
      <div><h3>Drag, don't code</h3><p>Blocks that behave. No table hacks, no fighting the editor at 11pm.</p></div>
      <div><h3>Sends that arrive</h3><p>Deliverability handled at the infrastructure layer, not in a settings panel.</p></div>
      <div><h3>Numbers you can read</h3><p>Opens, clicks, and revenue in one view. No export to a spreadsheet.</p></div>
    </div>
  </div>
</section>

<section class="band" id="start">
  <div class="inner">
    <h2>Start with 500 sends, free.</h2>
    <p class="lead">No card. No call. Cancel by closing the tab.</p>
    <div class="actions"><a class="btn" href="#">Create an account</a></div>
  </div>
</section>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Add a subtle shadow to the button | Elevation is the thing this type removes |
| Use a gradient on the hero | That is type 13 |
| Add a second accent color | One accent. The palette is brand + neutrals. |
| Round everything to 12px | Radius is 0, 4, or pill. Nothing else. |
| Use three type sizes in a card | Six sizes per page, total |
| Put the illustration in a card | Illustration sits in the field, uncontained |
| Add a border to separate sections | Bands separate sections |

## Responsive

- Bands stack; padding scales via `clamp`
- Nav collapses to a single "Menu" text button below 720px — no hamburger icon, use the word
- Display type never drops below 2rem
- Buttons go full-width below 480px

## Accessibility notes

Flat design's weakness is that color is doing structural work. Guard it:

- Never encode state by color alone — pair with text or icon
- Brand yellow on white fails contrast for text; use it as a field, not as text
- Focus rings must be visible against both the brand field and white — use `outline-color` overrides per band
- Buttons at 52px min-height clear the 44px touch target

## Self-check before reporting

- [ ] Zero `box-shadow` in the file
- [ ] Zero gradients
- [ ] Exactly one accent hue
- [ ] Border-radius only 0, 4px, or 999px
- [ ] Sections separated by alternating color bands, not borders
- [ ] Two typefaces maximum
- [ ] Focus ring visible on every band color
- [ ] `prefers-reduced-motion` block present
