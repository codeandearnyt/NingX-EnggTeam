---
name: ui-13-aurora-mesh-gradient
description: Build aurora and mesh gradient UI where soft multi-stop color fields behave like light behind crisp content. Use for technical products that need warmth, fintech landing pages, AI products, and any page where the reference standard is stripe.com and a flat background would feel inert.
metadata:
  origin: ningx
  ui-type: 13
  reference: https://stripe.com
---

# UI Type 13 — Aurora / Mesh Gradient

Soft, large-scale color fields that behave like light. The gradient is atmosphere, not decoration.

**Reference standard:** stripe.com

## When to reach for it

- The product is abstract and needs to feel alive
- Content sits above the gradient, not inside it
- The brand has 2–4 colors that relate
- You want depth without 3D or glass

## The signature

1. **Multi-stop radial gradients at low opacity, heavily blurred, layered.**
2. **Confined to one region** — a hero band, a section background. Never the whole page.
3. **Content above is fully opaque** with no blur and no transparency.

That third point is the one people get wrong. The gradient is behind; the content is not part of it.

## The construction

A mesh gradient is 3–5 radial gradients, each with a distinct color, at 30–60% opacity, on a dark or light base, then blurred.

```css
.aurora {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #0a0a0a;
  z-index: 0;
}
.aurora::before,
.aurora::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}
.aurora::before {
  width: 70vw; height: 70vw;
  top: -30%; left: -10%;
  background: radial-gradient(circle at 30% 30%, #7c3aed 0%, transparent 60%);
  opacity: .55;
}
.aurora::after {
  width: 60vw; height: 60vw;
  top: 10%; right: -15%;
  background: radial-gradient(circle at 60% 40%, #0ea5e9 0%, transparent 60%);
  opacity: .45;
}
```

Add a third and fourth blob with different colors and positions for a full mesh. Blur 60–120px. Opacity 0.3–0.6 each.

## Why `filter: blur()` and not just a soft gradient

A radial gradient with a hard falloff reads as a spotlight. A blurred blob reads as light through fog. The blur is what makes it aurora rather than gradient.

Performance note: `filter: blur(80px)` on a large element is expensive on first paint. Mitigate with:
- `will-change: transform` (promotes to its own layer)
- `contain: paint` on the container
- Animating `transform` only, never `filter` or `opacity` of the blur itself

## Tokens

```css
:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --border: rgb(255 255 255 / .08);
  --ink: #ffffff;
  --ink-soft: rgb(255 255 255 / .68);
  --ink-mute: rgb(255 255 255 / .45);

  --a1: #7c3aed;
  --a2: #0ea5e9;
  --a3: #f472b6;
  --a4: #22d3ee;

  --font-display: "Inter Display", "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --fs-display: clamp(2.5rem, 6vw, 4.5rem);
  --fs-lead: clamp(1.0625rem, 1.6vw, 1.25rem);
  --max-w: 1120px;
}
```

Three to four accent hues that are adjacent or complementary. Purple/blue/cyan is the safe triad. Purple/pink/orange is warmer.

## The scrim rule

Text over an aurora **must** have contrast protection. Two options:

**Option A — scrim**
```css
.hero__content { position: relative; z-index: 1; }
.hero::after {
  content: ""; position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(ellipse at center, rgb(10 10 10/.75) 0%, rgb(10 10 10/.3) 70%);
}
```

**Option B — local backdrop**
Put the content in a solid or near-solid panel that sits above the aurora. This is what Stripe does with its code windows.

Never place body text directly on the gradient with no protection. It will fail contrast on at least one color stop.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Orbit — payments infrastructure for platforms</title>
<style>
  :root{
    --bg:#0a0a0a; --surface:#111; --border:rgb(255 255 255/.08);
    --ink:#fff; --ink-soft:rgb(255 255 255/.68); --ink-mute:rgb(255 255 255/.45);
    --a1:#7c3aed; --a2:#0ea5e9; --a3:#f472b6; --a4:#22d3ee;
    --font-display:"Inter Display","Inter",system-ui,sans-serif;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
    --fs-display:clamp(2.5rem,6vw,4.5rem); --fs-lead:clamp(1.0625rem,1.6vw,1.25rem);
    --max-w:1120px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:1rem/1.6 var(--font-body);-webkit-font-smoothing:antialiased;
       overflow-x:hidden}

  /* ---------- aurora layer ---------- */
  .hero{position:relative;isolation:isolate;overflow:hidden;
        padding:clamp(5rem,12vw,9rem) 0 clamp(4rem,9vw,7rem)}
  .hero__aurora{position:absolute;inset:-20% -10%;z-index:-2;contain:paint}
  .blob{position:absolute;border-radius:50%;filter:blur(90px);
        will-change:transform;mix-blend-mode:screen}
  .blob--1{width:62vw;height:62vw;top:-18%;left:-8%;
           background:radial-gradient(circle at 35% 35%,var(--a1),transparent 62%);
           opacity:.55;animation:drift1 28s ease-in-out infinite alternate}
  .blob--2{width:54vw;height:54vw;top:2%;right:-12%;
           background:radial-gradient(circle at 60% 40%,var(--a2),transparent 62%);
           opacity:.45;animation:drift2 34s ease-in-out infinite alternate}
  .blob--3{width:44vw;height:44vw;bottom:-22%;left:22%;
           background:radial-gradient(circle at 50% 50%,var(--a3),transparent 62%);
           opacity:.38;animation:drift3 40s ease-in-out infinite alternate}
  .blob--4{width:36vw;height:36vw;top:34%;left:44%;
           background:radial-gradient(circle at 50% 50%,var(--a4),transparent 62%);
           opacity:.3;animation:drift1 46s ease-in-out infinite alternate-reverse}

  @keyframes drift1{to{transform:translate3d(6%,4%,0) scale(1.08)}}
  @keyframes drift2{to{transform:translate3d(-5%,6%,0) scale(1.12)}}
  @keyframes drift3{to{transform:translate3d(4%,-6%,0) scale(1.06)}}

  /* scrim so text always has a floor */
  .hero__scrim{position:absolute;inset:0;z-index:-1;
    background:radial-gradient(ellipse 70% 60% at 50% 45%,
      rgb(10 10 10/.82) 0%,rgb(10 10 10/.55) 55%,rgb(10 10 10/.15) 100%)}

  .wrap{max-width:var(--max-w);margin:0 auto;padding:0 clamp(1.25rem,4vw,2rem)}

  /* ---------- nav ---------- */
  .nav{position:absolute;top:0;left:0;right:0;z-index:2}
  .nav .wrap{display:flex;align-items:center;gap:2rem;height:72px}
  .brand{font-weight:600;font-size:1.0625rem;letter-spacing:-.02em;
         text-decoration:none;color:var(--ink)}
  .nav ul{display:flex;gap:1.75rem;list-style:none;margin:0 0 0 auto;padding:0;font-size:.9375rem}
  .nav a{color:var(--ink-soft);text-decoration:none;transition:color 140ms ease}
  .nav a:hover{color:var(--ink)}

  /* ---------- hero content ---------- */
  .hero__content{position:relative;z-index:1;text-align:center;max-width:52rem;margin:0 auto}
  .eyebrow{display:inline-flex;align-items:center;gap:.5rem;
           padding:.375rem .875rem;border-radius:999px;
           border:1px solid var(--border);background:rgb(255 255 255/.05);
           font-size:.8125rem;color:var(--ink-soft);margin-bottom:1.75rem}
  .eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--a4);
             box-shadow:0 0 12px var(--a4)}
  h1{font-family:var(--font-display);font-size:var(--fs-display);
     font-weight:600;letter-spacing:-.04em;line-height:1.02;margin:0 0 1.5rem;
     text-wrap:balance;
     background:linear-gradient(180deg,#fff 30%,rgb(255 255 255/.62) 100%);
     -webkit-background-clip:text;background-clip:text;color:transparent}
  .lead{font-size:var(--fs-lead);color:var(--ink-soft);max-width:38rem;
        margin:0 auto 2.25rem;line-height:1.55}

  .actions{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
  .btn{display:inline-flex;align-items:center;justify-content:center;
       height:48px;padding:0 1.5rem;border-radius:10px;
       font:500 .9375rem/1 var(--font-body);text-decoration:none;cursor:pointer;
       border:1px solid transparent;
       transition:transform 140ms ease,background-color 140ms ease,border-color 140ms ease}
  .btn--primary{background:#fff;color:#0a0a0a}
  .btn--primary:hover{transform:translateY(-1px);background:#f0f0f0}
  .btn--ghost{background:rgb(255 255 255/.06);color:var(--ink);
              border-color:var(--border);backdrop-filter:blur(8px)}
  .btn--ghost:hover{background:rgb(255 255 255/.1);border-color:rgb(255 255 255/.16)}

  /* ---------- product window ---------- */
  .showcase{position:relative;z-index:1;margin:clamp(3rem,6vw,4.5rem) auto 0;
            max-width:960px}
  .window{background:var(--surface);border:1px solid var(--border);
          border-radius:14px;overflow:hidden;
          box-shadow:0 24px 80px -20px rgb(0 0 0/.8),0 0 0 1px rgb(255 255 255/.03) inset}
  .window__bar{display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem;
               border-bottom:1px solid var(--border);background:rgb(255 255 255/.02)}
  .window__bar i{width:10px;height:10px;border-radius:50%;background:rgb(255 255 255/.14)}
  .window__bar span{margin-left:.75rem;font:400 .75rem/1 var(--font-mono);
                    color:var(--ink-mute)}
  .window__body{padding:1.25rem;font:400 .8125rem/1.9 var(--font-mono);
                color:var(--ink-soft);overflow-x:auto}
  .k{color:var(--a4)} .s{color:#a5f3a0} .n{color:#fbbf24}

  a:focus-visible,button:focus-visible{outline:2px solid var(--a4);outline-offset:3px}

  @media (prefers-reduced-motion:reduce){
    .blob{animation:none!important}
    *{transition:none!important}
  }
</style>
</head>
<body>

<section class="hero">
  <div class="hero__aurora" aria-hidden="true">
    <span class="blob blob--1"></span>
    <span class="blob blob--2"></span>
    <span class="blob blob--3"></span>
    <span class="blob blob--4"></span>
  </div>
  <div class="hero__scrim" aria-hidden="true"></div>

  <nav class="nav" aria-label="Main">
    <div class="wrap">
      <a class="brand" href="/">Orbit</a>
      <ul>
        <li><a href="#">Products</a></li>
        <li><a href="#">Docs</a></li>
        <li><a href="#">Pricing</a></li>
      </ul>
    </div>
  </nav>

  <div class="wrap">
    <div class="hero__content">
      <span class="eyebrow"><i></i>Now with instant payouts in 34 countries</span>
      <h1>Money movement, without the moving parts.</h1>
      <p class="lead">One API for collecting, holding, and paying out. Reconciliation is a field, not a spreadsheet.</p>
      <div class="actions">
        <a class="btn btn--primary" href="#">Start building</a>
        <a class="btn btn--ghost" href="#">Read the docs</a>
      </div>
    </div>

    <div class="showcase">
      <div class="window">
        <div class="window__bar"><i></i><i></i><i></i><span>payout.ts</span></div>
        <div class="window__body"><pre style="margin:0"><code><span class="k">const</span> payout = <span class="k">await</span> orbit.payouts.create({
  amount: <span class="n">2500_00</span>,
  currency: <span class="s">'usd'</span>,
  destination: <span class="s">'acct_1Nx8kL'</span>,
  idempotency_key: <span class="s">'order_8812'</span>,
});

<span class="k">if</span> (payout.status === <span class="s">'paid'</span>) {
  await orders.markSettled(<span class="s">'order_8812'</span>);
}</code></pre></div>
      </div>
    </div>
  </div>
</section>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Put the gradient across the whole page | It becomes wallpaper; the aurora must be a region |
| Put body text directly on the gradient | Fails contrast on at least one stop |
| Use `blur()` below 40px | Reads as a soft gradient, not light |
| Animate `filter` or `opacity` of the blur | Kills frame rate. Animate `transform` only. |
| Use more than 4 blobs | Muddy, no distinct color reads |
| Use `mix-blend-mode: screen` on light backgrounds | Only correct on dark |
| Stack the aurora above content | It is a background layer, `z-index: -1` or lower |
| Forget `contain: paint` | Blur bleeds and repaints the whole page |

## Light variant

On a light base, swap `mix-blend-mode: screen` for `multiply`, drop opacity to 0.25–0.4, and use lighter tints. The scrim becomes `rgb(255 255 255/.7)`.

## Performance

Blurred blobs are the most expensive thing on the page. Rules:

1. `contain: paint` on the aurora container
2. `will-change: transform` on each blob
3. Animate `transform` only
4. Cap blob size at ~70vw
5. On `prefers-reduced-motion`, stop the animation entirely
6. Below 640px, reduce to 2 blobs — the extra ones are invisible anyway

Measure: the hero should still hit LCP under 2.5s. If the blur delays it, render the blobs after the content paints.

## Accessibility notes

- The aurora is decorative: `aria-hidden="true"` on the container
- The scrim is what makes text pass. Verify the **worst case** — the lightest point of the gradient under the text.
- The gradient headline (`background-clip: text`) must still be readable. Test with a solid fallback:
  ```css
  @supports not (background-clip: text) { h1 { color: #fff; } }
  ```
- Focus ring `--a4` (cyan) on `#0a0a0a` is visible. On the purple blob region it may not be — the scrim helps.

## Self-check before reporting

- [ ] Gradient confined to one region, not the page
- [ ] 3–4 blobs, each with a distinct hue
- [ ] Blur ≥ 60px
- [ ] Content above has a scrim or a solid panel
- [ ] Only `transform` is animated
- [ ] `contain: paint` on the aurora container
- [ ] `prefers-reduced-motion` stops the animation
- [ ] Worst-case contrast measured where text sits over the lightest stop
