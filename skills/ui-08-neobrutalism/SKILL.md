---
name: ui-08-neobrutalism
description: Build neobrutalist UI with thick black borders, hard offset shadows, saturated flat fills, and unapologetic geometry. Use for indie products, creator tools, playful brands, and any page where the reference standard is gumroad.com and softness would read as dishonesty.
metadata:
  origin: ningx
  ui-type: 8
  reference: https://gumroad.com
---

# UI Type 08 — Neobrutalism

Loud borders. Hard shadows. Saturated flat color. Zero softness.

**Reference standard:** gumroad.com

## Distinction from type 03

Type 03 (Brutalist HTML) is the **absence** of style. This is a **style**, and it is loud. If you are writing zero CSS, you want `ui-03-brutalist-html`. If you are writing `border: 3px solid #000`, you are here.

## When to reach for it

- The product is indie, playful, or anti-corporate
- You want to be memorable in a feed of soft gradients
- The audience tolerates personality
- The brand has a point of view

Do not use it for finance, healthcare, legal, or enterprise procurement. It reads as unserious to those buyers.

## The signature

1. **2–3px solid black border on every surface.** Not grey. Not 1px.
2. **Hard offset shadow with zero blur.** `4px 4px 0 #000`. Never `0 4px 8px rgba(...)`.
3. **Saturated flat fill.** One or two loud colors on a plain background.

## The shadow system

```css
:root {
  --border: 3px;
  --shadow-sm: 3px 3px 0 #000;
  --shadow: 4px 4px 0 #000;
  --shadow-lg: 6px 6px 0 #000;
}
```

Press behaviour is the whole interaction model — the element moves into its own shadow:

```css
.btn { box-shadow: var(--shadow); transform: translate(0,0); }
.btn:hover { box-shadow: var(--shadow-lg); transform: translate(-2px,-2px); }
.btn:active { box-shadow: 0 0 0 #000; transform: translate(4px,4px); }
```

That `:active` — shadow collapses to zero and the element travels exactly the shadow distance — is the tell that someone did this properly.

## Tokens

```css
:root {
  --ink: #000000;
  --paper: #f5f0e6;
  --surface: #ffffff;
  --yellow: #ffd43b;
  --pink: #ff90e8;
  --blue: #4d7cfe;
  --green: #a8e6a1;

  --font-display: "Archivo Black", Impact, "Arial Black", sans-serif;
  --font-body: "Space Grotesk", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;

  --fs-display: clamp(2.5rem, 7vw, 5rem);
  --fs-h2: clamp(1.5rem, 3vw, 2.25rem);
  --fs-body: 1.0625rem;

  --border-w: 3px;
  --shadow: 4px 4px 0 #000;
  --shadow-lg: 6px 6px 0 #000;
  --radius: 0;                 /* brutalist: zero, or 999px for pills. nothing between. */
  --max-w: 1120px;
}
```

Three saturated colors max. Four is a carnival.

## Anatomy

```
<header>                  border-bottom 3px, logo in a bordered box
<section>                 plain background, content in bordered cards
  .card                   border 3px + shadow 4px, saturated header strip optional
  .btn                    border 3px + shadow 4px, press-into-shadow
<footer>                  border-top 3px
```

Rotate accents ±1–2deg. Never rotate the body text.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slab — sell anything, look like you meant it</title>
<style>
  :root{
    --ink:#000; --paper:#f5f0e6; --surface:#fff;
    --yellow:#ffd43b; --pink:#ff90e8; --blue:#4d7cfe; --green:#a8e6a1;
    --font-display:"Archivo Black",Impact,"Arial Black",sans-serif;
    --font-body:"Space Grotesk",system-ui,sans-serif;
    --font-mono:ui-monospace,"SF Mono",monospace;
    --fs-display:clamp(2.5rem,7vw,5rem); --fs-h2:clamp(1.5rem,3vw,2.25rem); --fs-body:1.0625rem;
    --bw:3px; --shadow:4px 4px 0 #000; --shadow-lg:6px 6px 0 #000;
    --max-w:1120px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font:var(--fs-body)/1.55 var(--font-body);-webkit-font-smoothing:antialiased}

  .wrap{max-width:var(--max-w);margin:0 auto;padding:0 clamp(1.25rem,4vw,2.5rem)}

  header{border-bottom:var(--bw) solid var(--ink);background:var(--surface)}
  .nav{display:flex;align-items:center;gap:1.5rem;padding:1rem 0}
  .brand{border:var(--bw) solid var(--ink);background:var(--yellow);
         box-shadow:var(--shadow);padding:.4rem .75rem;font-family:var(--font-display);
         font-size:1.125rem;text-decoration:none;color:var(--ink);letter-spacing:-.02em;
         transform:rotate(-1.5deg)}
  .nav ul{display:flex;gap:1.25rem;list-style:none;margin:0 0 0 auto;padding:0;font-weight:600}
  .nav a{color:var(--ink);text-decoration:none;border-bottom:3px solid transparent;padding-bottom:2px}
  .nav a:hover{border-bottom-color:var(--ink)}

  section{padding:clamp(3rem,7vw,5.5rem) 0}

  h1{font-family:var(--font-display);font-size:var(--fs-display);line-height:.95;
     letter-spacing:-.03em;margin:0 0 1.25rem;max-width:14ch;text-wrap:balance}
  h2{font-family:var(--font-display);font-size:var(--fs-h2);line-height:1.05;
     letter-spacing:-.02em;margin:0 0 .875rem}
  p{max-width:56ch;margin:0 0 1.5rem}

  .btn{
    display:inline-flex;align-items:center;gap:.5rem;min-height:52px;
    padding:0 1.5rem;border:var(--bw) solid var(--ink);border-radius:0;
    background:var(--pink);color:var(--ink);
    font:700 1rem/1 var(--font-body);text-decoration:none;cursor:pointer;
    box-shadow:var(--shadow);transform:translate(0,0);
    transition:box-shadow 90ms linear,transform 90ms linear;
  }
  .btn:hover{box-shadow:var(--shadow-lg);transform:translate(-2px,-2px)}
  .btn:active{box-shadow:0 0 0 #000;transform:translate(4px,4px)}
  .btn--alt{background:var(--blue);color:#fff}
  .btn--ghost{background:var(--surface)}

  .card{
    border:var(--bw) solid var(--ink);background:var(--surface);
    box-shadow:var(--shadow);padding:1.5rem;
  }
  .card__strip{
    margin:-1.5rem -1.5rem 1.25rem;padding:.625rem 1.5rem;
    border-bottom:var(--bw) solid var(--ink);
    font-family:var(--font-mono);font-size:.75rem;font-weight:700;
    letter-spacing:.12em;text-transform:uppercase;
  }
  .strip--yellow{background:var(--yellow)}
  .strip--green{background:var(--green)}
  .strip--pink{background:var(--pink)}

  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
        gap:1.75rem;margin-top:2.5rem}
  .card p{margin:0;font-size:.9375rem;color:#2b2b2b}

  .tag{
    display:inline-block;border:2px solid var(--ink);background:var(--yellow);
    padding:.2rem .5rem;font-family:var(--font-mono);font-size:.6875rem;
    font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    transform:rotate(1.5deg);margin-bottom:1rem;
  }

  .stat{display:flex;gap:2.5rem;flex-wrap:wrap;margin-top:2.5rem;
        border-top:var(--bw) solid var(--ink);padding-top:1.5rem}
  .stat div{font-family:var(--font-mono)}
  .stat b{display:block;font-family:var(--font-display);font-size:2rem;letter-spacing:-.02em}
  .stat span{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#444}

  footer{border-top:var(--bw) solid var(--ink);background:var(--surface);padding:2rem 0}
  footer p{margin:0;font-size:.875rem;color:#444}

  a:focus-visible,button:focus-visible{outline:3px solid var(--blue);outline-offset:3px}

  @media (prefers-reduced-motion:reduce){
    *{transition:none!important}
    .btn:hover{transform:none;box-shadow:var(--shadow)}
  }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <nav class="nav" aria-label="Main">
      <a class="brand" href="/">SLAB</a>
      <ul>
        <li><a href="#how">How</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#start">Sell</a></li>
      </ul>
    </nav>
  </div>
</header>

<main>

  <section>
    <div class="wrap">
      <span class="tag">No platform fee</span>
      <h1>Sell the thing. Keep the money.</h1>
      <p>SLAB is a checkout and a storefront in one file. You bring the product, we handle the page, the payment, and the receipt. Nothing else.</p>
      <a class="btn" href="#start">Start selling</a>
      <a class="btn btn--ghost" href="#how">See how it works</a>

      <div class="stat">
        <div><b>0%</b><span>Platform fee</span></div>
        <div><b>2 min</b><span>To first sale</span></div>
        <div><b>11k</b><span>Stores live</span></div>
      </div>
    </div>
  </section>

  <section id="how" style="border-top:var(--bw) solid var(--ink)">
    <div class="wrap">
      <h2>Three moving parts. That's it.</h2>
      <div class="grid">
        <article class="card">
          <div class="card__strip strip--yellow">01 — Upload</div>
          <p>Drop a file. Set a price. The page is generated before you close the tab.</p>
        </article>
        <article class="card">
          <div class="card__strip strip--green">02 — Share</div>
          <p>One URL. Works in a bio, an email, a DM. No app, no redirect chain.</p>
        </article>
        <article class="card">
          <div class="card__strip strip--pink">03 — Get paid</div>
          <p>Stripe or PayPal. Payout lands the next business day, minus processing.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="start" style="border-top:var(--bw) solid var(--ink)">
    <div class="wrap">
      <h2>Put something up today.</h2>
      <p>Free until you clear $1,000. Then 0%. We make money on the card fee, not on you.</p>
      <a class="btn btn--alt" href="#">Create a store</a>
    </div>
  </section>

</main>

<footer>
  <div class="wrap"><p>SLAB — built by two people who got tired of platform fees.</p></div>
</footer>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use `box-shadow: 0 4px 8px rgba(0,0,0,.1)` | Blur kills it. Offset only, zero blur. |
| Use 1px borders | 2px minimum, 3px is the standard |
| Use pastels | Saturated or nothing |
| Use grey borders | Black. Always black. |
| Round to 8px | Radius is 0 or 999px |
| Soften the type | Display face should be heavy and tight |
| Use more than 3 accent colors | Carnival |
| Animate on scroll | Press feedback is the only motion this type needs |

## Responsive

- Grid goes single column below 700px
- Shadow shrinks to `3px 3px 0` on mobile to preserve the effect at small sizes
- Rotations reduce to 1deg or drop entirely below 600px
- Buttons go full-width below 480px

## Accessibility notes

Neobrutalism is actually strong on accessibility if you keep three things:

- Black-on-saturated fills usually clear 4.5:1 — but **verify** each pair. Yellow `#ffd43b` with black text passes; white text on yellow fails.
- The `:active` transform is the press feedback — do not remove it for reduced-motion users, just remove the *transition*, keep the state change.
- Focus ring must be visible against saturated fills — a blue outline on pink works; black on black does not.

## Self-check before reporting

- [ ] Every surface has a 2–3px solid black border
- [ ] Every shadow is `Npx Npx 0 #000` — zero blur, zero spread
- [ ] `:active` collapses the shadow to zero and translates by the same distance
- [ ] Max three saturated accent colors
- [ ] Border-radius is 0 or 999px only
- [ ] Zero gradients, zero blur, zero opacity in shadows
- [ ] Contrast verified per color pair, not assumed
- [ ] Rotations applied to accents only, never body text
