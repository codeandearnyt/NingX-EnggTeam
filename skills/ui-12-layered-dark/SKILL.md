---
name: ui-12-layered-dark
description: Build layered dark mode UI where depth comes from value steps and borders rather than shadows. Use for developer tools, dashboards, SaaS consoles, and any page where the reference standard is vercel.com and dark is the base state rather than an inverted afterthought.
metadata:
  origin: ningx
  ui-type: 12
  reference: https://vercel.com
---

# UI Type 12 — Layered Dark Mode

Dark is the base, not a theme. Depth comes from value steps, not shadows.

**Reference standard:** vercel.com

## When to reach for it

- The audience is developers or technical operators
- Screens are used for long sessions
- The product is a tool, not a brochure
- Dark is the primary state and light is optional

## The core rule

**On dark, shadows do not create depth.** A shadow on a near-black surface is invisible. Depth comes from:

1. **Value steps** — each layer is lighter than the one below
2. **Borders** — a 1px line at a slightly lighter value separates surfaces
3. **Nothing else**

If your dark UI uses `box-shadow` for elevation, it is a light theme wearing a dark coat.

## The neutral ramp

Seven steps. Every surface in the app maps to one.

```css
:root {
  --n-0: #000000;   /* page background, rarely */
  --n-1: #0a0a0a;   /* page background */
  --n-2: #111111;   /* card / panel */
  --n-3: #171717;   /* raised card, hover */
  --n-4: #1f1f1f;   /* input, active surface */
  --n-5: #2a2a2a;   /* border strong */
  --n-6: #333333;   /* divider, disabled */
}
```

Rules:
- Page background is `--n-1`, never `--n-0`. Pure black with white text is harsh and causes halation on OLED.
- Cards are exactly one step up: `--n-2`.
- Borders are `--n-3` to `--n-5` depending on emphasis.
- Never skip more than one step for adjacent surfaces.

## Text on dark

```css
:root {
  --text-1: #ededed;   /* primary — NOT #fff */
  --text-2: #a1a1a1;   /* secondary */
  --text-3: #737373;   /* tertiary, meta */
  --text-4: #525252;   /* disabled */
}
```

Pure white `#ffffff` on `#0a0a0a` is 19:1 — technically fine, visually harsh. `#ededed` gives ~15:1 and reads better for long sessions.

**Contrast floors:**
- `--text-1` on `--n-1`: ≥ 12:1
- `--text-2` on `--n-1`: ≥ 7:1
- `--text-3` on `--n-1`: ≥ 4.5:1 — verify, this is where dark themes usually fail
- `--text-4`: disabled, exempt but must still be readable

## Accent budget

One accent. Used on: primary action, active state, focus ring, one data series. Nothing else.

```css
:root {
  --accent: #0070f3;
  --accent-hover: #3291ff;
  --accent-dim: #0059c9;
  --accent-bg: rgb(0 112 243 / .12);   /* tinted background for badges */
}
```

Two accents on dark is noise. Three is a rave.

## Tokens

```css
:root {
  --font-body: "Geist", "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", monospace;

  --fs-xs: 0.75rem;
  --fs-sm: 0.8125rem;
  --fs-base: 0.875rem;      /* 14px is the dev-tool base */
  --fs-lg: 1rem;
  --fs-xl: 1.25rem;
  --fs-2xl: clamp(1.75rem, 3vw, 2.5rem);

  --radius-sm: 6px;
  --radius: 8px;
  --radius-lg: 12px;

  --max-w: 1200px;
}
```

14px base, not 16px. Developer tools run dense. Line-height 1.5.

## Anatomy

```
<body>                          --n-1
  <header>                      --n-1, border-bottom --n-3
  <main>
    <div class="panel">         --n-2, border --n-3, radius 8
      <div class="panel__head"> border-bottom --n-3, --n-2 bg
      <div class="panel__body"> --n-2
  <aside class="sidebar">       --n-1, border-right --n-3
```

Sidebar and page share the same background. The **border** separates them, not a value change. That is the Vercel move.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Console — deployments</title>
<style>
  :root{
    --n-0:#000; --n-1:#0a0a0a; --n-2:#111; --n-3:#171717;
    --n-4:#1f1f1f; --n-5:#2a2a2a; --n-6:#333;
    --text-1:#ededed; --text-2:#a1a1a1; --text-3:#737373; --text-4:#525252;
    --accent:#0070f3; --accent-hover:#3291ff; --accent-bg:rgb(0 112 243/.12);
    --green:#0cce6b; --red:#ff4d4d; --amber:#f5a623;
    --font-body:"Geist","Inter",system-ui,-apple-system,sans-serif;
    --font-mono:"Geist Mono",ui-monospace,"SF Mono",monospace;
    --fs-xs:.75rem; --fs-sm:.8125rem; --fs-base:.875rem; --fs-lg:1rem; --fs-xl:1.25rem;
    --fs-2xl:clamp(1.75rem,3vw,2.5rem);
    --radius-sm:6px; --radius:8px; --radius-lg:12px;
    --max-w:1200px;
  }
  *{box-sizing:border-box}
  html{color-scheme:dark}
  body{margin:0;background:var(--n-1);color:var(--text-1);
       font:var(--fs-base)/1.5 var(--font-body);-webkit-font-smoothing:antialiased;
       font-variant-ligatures:none}

  /* header */
  header{
    position:sticky;top:0;z-index:20;
    border-bottom:1px solid var(--n-3);background:var(--n-1);
  }
  .nav{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;
       display:flex;align-items:center;gap:2rem;height:56px}
  .brand{font-weight:600;font-size:var(--fs-lg);letter-spacing:-.02em;
         text-decoration:none;color:var(--text-1)}
  .nav ul{display:flex;gap:1.5rem;list-style:none;margin:0;padding:0;font-size:var(--fs-sm)}
  .nav a{color:var(--text-2);text-decoration:none;transition:color 120ms ease}
  .nav a:hover,.nav a[aria-current]{color:var(--text-1)}

  main{max-width:var(--max-w);margin:0 auto;padding:2rem 1.5rem 4rem}

  .page-head{display:flex;align-items:flex-end;justify-content:space-between;
             gap:1.5rem;margin-bottom:1.75rem;flex-wrap:wrap}
  h1{font-size:var(--fs-2xl);font-weight:600;letter-spacing:-.03em;line-height:1.1;margin:0}
  .page-head p{margin:.5rem 0 0;color:var(--text-2);font-size:var(--fs-base)}

  /* button */
  .btn{
    display:inline-flex;align-items:center;gap:.5rem;height:36px;padding:0 .875rem;
    border-radius:var(--radius-sm);border:1px solid var(--n-5);
    background:var(--n-2);color:var(--text-1);
    font:500 var(--fs-sm)/1 var(--font-body);cursor:pointer;
    transition:background-color 120ms ease,border-color 120ms ease;
  }
  .btn:hover{background:var(--n-3);border-color:var(--n-6)}
  .btn--primary{background:var(--text-1);color:var(--n-1);border-color:var(--text-1)}
  .btn--primary:hover{background:#fff;border-color:#fff}
  .btn--accent{background:var(--accent);border-color:var(--accent);color:#fff}
  .btn--accent:hover{background:var(--accent-hover);border-color:var(--accent-hover)}

  /* panel */
  .panel{background:var(--n-2);border:1px solid var(--n-3);border-radius:var(--radius);
         overflow:hidden}
  .panel__head{display:flex;align-items:center;justify-content:space-between;
               gap:1rem;padding:.75rem 1rem;border-bottom:1px solid var(--n-3);
               font-size:var(--fs-sm);color:var(--text-2)}
  .panel__body{padding:0}

  /* list rows */
  .row{
    display:grid;grid-template-columns:1fr auto auto;gap:1rem;align-items:center;
    padding:.75rem 1rem;border-bottom:1px solid var(--n-3);
    transition:background-color 100ms ease;
  }
  .row:last-child{border-bottom:0}
  .row:hover{background:var(--n-3)}
  .row__main{display:flex;align-items:center;gap:.625rem;min-width:0}
  .row__hash{font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-3)}
  .row__msg{font-size:var(--fs-sm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .row__time{font-size:var(--fs-xs);color:var(--text-3);
             font-variant-numeric:tabular-nums}

  /* status pill */
  .pill{
    display:inline-flex;align-items:center;gap:.375rem;
    height:22px;padding:0 .5rem;border-radius:999px;
    font-size:var(--fs-xs);font-weight:500;
    border:1px solid transparent;
  }
  .pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
  .pill--ready{color:var(--green);background:rgb(12 206 107/.1);border-color:rgb(12 206 107/.25)}
  .pill--build{color:var(--amber);background:rgb(245 166 35/.1);border-color:rgb(245 166 35/.25)}
  .pill--fail{color:var(--red);background:rgb(255 77 77/.1);border-color:rgb(255 77 77/.25)}

  /* stat strip */
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
         gap:1px;background:var(--n-3);border:1px solid var(--n-3);
         border-radius:var(--radius);overflow:hidden;margin-bottom:1.75rem}
  .stat{background:var(--n-2);padding:1rem}
  .stat dt{font-size:var(--fs-xs);color:var(--text-3);text-transform:uppercase;
           letter-spacing:.06em;margin:0 0 .375rem}
  .stat dd{margin:0;font-size:var(--fs-xl);font-weight:600;letter-spacing:-.02em;
           font-variant-numeric:tabular-nums}

  a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

  @media (max-width:640px){
    .row{grid-template-columns:1fr auto}
    .row__time{display:none}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>

<header>
  <nav class="nav" aria-label="Main">
    <a class="brand" href="/">console</a>
    <ul>
      <li><a href="#" aria-current="page">Deployments</a></li>
      <li><a href="#">Analytics</a></li>
      <li><a href="#">Settings</a></li>
    </ul>
  </nav>
</header>

<main>

  <div class="page-head">
    <div>
      <h1>Deployments</h1>
      <p>Production and preview builds for <code>acme-web</code>.</p>
    </div>
    <button class="btn btn--accent">New deployment</button>
  </div>

  <dl class="stats">
    <div class="stat"><dt>Deployments</dt><dd>1,284</dd></div>
    <div class="stat"><dt>Build time</dt><dd>42s</dd></div>
    <div class="stat"><dt>Success rate</dt><dd>99.1%</dd></div>
    <div class="stat"><dt>Last deploy</dt><dd>4m</dd></div>
  </dl>

  <section class="panel">
    <div class="panel__head">
      <span>Recent</span>
      <button class="btn">Filter</button>
    </div>
    <div class="panel__body">

      <div class="row">
        <div class="row__main">
          <span class="row__hash">a3f9c21</span>
          <span class="row__msg">fix: correct pricing table rounding</span>
        </div>
        <span class="pill pill--ready">Ready</span>
        <span class="row__time">4 minutes ago</span>
      </div>

      <div class="row">
        <div class="row__main">
          <span class="row__hash">7b2e0d4</span>
          <span class="row__msg">feat: add usage meter to billing</span>
        </div>
        <span class="pill pill--build">Building</span>
        <span class="row__time">6 minutes ago</span>
      </div>

      <div class="row">
        <div class="row__main">
          <span class="row__hash">c81a5f0</span>
          <span class="row__msg">chore: bump deps</span>
        </div>
        <span class="pill pill--fail">Failed</span>
        <span class="row__time">2 hours ago</span>
      </div>

    </div>
  </section>

</main>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use `#000` background with `#fff` text | Halation, eye strain. Use `#0a0a0a` / `#ededed`. |
| Use `box-shadow` for elevation | Invisible on dark. Use value steps and borders. |
| Invert a light theme with `filter: invert()` | Colors go wrong, images go wrong. Immediate rejection. |
| Use more than one accent | Noise |
| Skip the border between adjacent surfaces | They merge into one blob |
| Use `--n-0` for cards | Cards must be lighter than the page |
| Lighten text to pure white for "contrast" | Already passing; white just hurts |
| Add a glow effect | That is type 13 |

## The light mode question

If the product needs light mode, do not invert. Build a separate ramp:

```css
@media (prefers-color-scheme: light) {
  :root {
    --n-1: #ffffff; --n-2: #fafafa; --n-3: #eaeaea; --n-4: #e5e5e5; --n-5: #d4d4d4;
    --text-1: #0a0a0a; --text-2: #666; --text-3: #8f8f8f;
  }
}
```

Same variable names, different values. The component code never changes.

## Accessibility notes

- `color-scheme: dark` on `:root` — makes form controls and scrollbars match
- `--text-3` on `--n-1` is `#737373` on `#0a0a0a` = 4.6:1. It passes but only just. Do not use it for anything below 13px.
- Status pills use color **and** a dot **and** text — never color alone
- Focus ring at `--accent` on `--n-2` is visible; verify against `--n-4` inputs too
- Reduced motion honored

## Self-check before reporting

- [ ] Page background is `--n-1`, not `#000`
- [ ] Primary text is `#ededed`, not `#fff`
- [ ] Every surface maps to a step in the 7-step ramp
- [ ] Zero `box-shadow` used for depth
- [ ] Borders present between every adjacent surface
- [ ] One accent only
- [ ] `color-scheme: dark` declared
- [ ] `--text-3` not used below 13px
