---
name: ui-11-material-elevated
description: Build Material Design elevated-2D UI where a fixed elevation scale communicates hierarchy and state. Use for cross-platform apps, dashboards, enterprise tools, and any page where the reference standard is google.com and a systematic component language is worth more than brand expression.
metadata:
  origin: ningx
  ui-type: 11
  reference: https://www.google.com
---

# UI Type 11 — Material Design (Elevated 2D)

Layered surfaces. Meaningful elevation. Motion that explains state.

**Reference standard:** google.com / Material 3

## When to reach for it

- The product ships to Android, web, and maybe desktop
- You need a component system that scales to a large team
- Familiarity is a feature — users already know the grammar
- Accessibility requirements are strict and you want a system that already handles them

## The signature

1. **Elevation as a 5-step scale**, each step with a defined shadow and purpose.
2. **Type roles** applied consistently: display, headline, title, body, label.
3. **Motion that explains** — transitions that show where a surface came from.

## The elevation scale

| Level | Shadow | Used for |
|---|---|---|
| 0 | none | Background, flat content |
| 1 | `0 1px 2px rgb(0 0 0/.3), 0 1px 3px 1px rgb(0 0 0/.15)` | Cards, resting |
| 2 | `0 1px 2px rgb(0 0 0/.3), 0 2px 6px 2px rgb(0 0 0/.15)` | Card hover, raised |
| 3 | `0 4px 8px 3px rgb(0 0 0/.15), 0 1px 3px rgb(0 0 0/.3)` | FAB, dropdowns |
| 4 | `0 6px 10px 4px rgb(0 0 0/.15), 0 2px 3px rgb(0 0 0/.3)` | Nav drawer, modal |
| 5 | `0 8px 12px 6px rgb(0 0 0/.15), 0 4px 4px rgb(0 0 0/.3)` | Dialog |

Elevation must **mean** something. A shadow that does not indicate a layer is decoration and is a violation.

## The type roles

```css
:root {
  --md-display-large:  400 57px/64px var(--font);
  --md-display-medium: 400 45px/52px var(--font);
  --md-headline-large: 400 32px/40px var(--font);
  --md-headline-small:400 24px/32px var(--font);
  --md-title-large:    400 22px/28px var(--font);
  --md-title-medium:   500 16px/24px var(--font);
  --md-body-large:     400 16px/24px var(--font);
  --md-body-medium:    400 14px/20px var(--font);
  --md-label-large:    500 14px/20px var(--font);
  --md-label-small:    500 11px/16px var(--font);
}
```

Six roles is the whole system. Do not invent a seventh.

## The state layer

Material's interaction model is a state layer — an overlay at fixed opacity, not a color change:

| State | Overlay opacity |
|---|---|
| Hover | 8% |
| Focus | 12% |
| Pressed | 12% |
| Dragged | 16% |

```css
.btn { position: relative; isolation: isolate; }
.btn::after {
  content: ""; position: absolute; inset: 0;
  background: currentColor; opacity: 0; border-radius: inherit;
  transition: opacity 100ms ease;
}
.btn:hover::after  { opacity: .08; }
.btn:focus-visible::after { opacity: .12; }
.btn:active::after { opacity: .12; }
```

That single mechanism handles every button variant without per-state color tokens.

## Tokens

```css
:root {
  /* M3 light scheme */
  --md-primary: #6750a4;
  --md-on-primary: #ffffff;
  --md-primary-container: #eaddff;
  --md-on-primary-container: #21005d;

  --md-surface: #fef7ff;
  --md-surface-container-low: #f7f2fa;
  --md-surface-container: #f3edf7;
  --md-surface-container-high: #ece6f0;
  --md-on-surface: #1d1b20;
  --md-on-surface-variant: #49454f;
  --md-outline: #79747e;
  --md-outline-variant: #cac4d0;

  --md-error: #b3261e;

  --font: "Roboto Flex", Roboto, system-ui, sans-serif;
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 28px;
  --radius-full: 999px;
}
```

M3's radius scale is 4/8/12/16/28. Use it. Do not invent 6px.

## Anatomy

```
<header class="app-bar">        elevation 2, sticky
<main>
  <section class="card">         elevation 1, radius 12
    .card__media                16:9 image, clipped to radius
    .card__body                 title-medium + body-medium
    .card__actions              text buttons, right-aligned
  </section>
  <button class="fab">           elevation 3, fixed bottom-right
</main>
<nav class="bottom-nav">         elevation 2, 3-5 destinations
```

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tasks</title>
<style>
  :root{
    --md-primary:#6750a4; --md-on-primary:#fff;
    --md-primary-container:#eaddff; --md-on-primary-container:#21005d;
    --md-surface:#fef7ff; --md-surface-container-low:#f7f2fa;
    --md-surface-container:#f3edf7; --md-surface-container-high:#ece6f0;
    --md-on-surface:#1d1b20; --md-on-surface-variant:#49454f;
    --md-outline:#79747e; --md-outline-variant:#cac4d0; --md-error:#b3261e;
    --font:"Roboto Flex",Roboto,system-ui,sans-serif;
    --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:28px; --r-full:999px;

    --el1:0 1px 2px rgb(0 0 0/.3),0 1px 3px 1px rgb(0 0 0/.15);
    --el2:0 1px 2px rgb(0 0 0/.3),0 2px 6px 2px rgb(0 0 0/.15);
    --el3:0 4px 8px 3px rgb(0 0 0/.15),0 1px 3px rgb(0 0 0/.3);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--md-surface);color:var(--md-on-surface);
       font:400 16px/24px var(--font);-webkit-font-smoothing:antialiased}

  /* app bar */
  .app-bar{
    position:sticky;top:0;z-index:20;
    display:flex;align-items:center;gap:1rem;
    height:64px;padding:0 1rem;
    background:var(--md-surface-container);
    box-shadow:var(--el1);
  }
  .app-bar h1{font:400 22px/28px var(--font);margin:0;flex:1}
  .icon-btn{
    width:48px;height:48px;border:0;border-radius:var(--r-full);
    background:transparent;display:grid;place-items:center;cursor:pointer;
    color:var(--md-on-surface-variant);position:relative;isolation:isolate;
  }
  .icon-btn::after{content:"";position:absolute;inset:0;border-radius:inherit;
                   background:currentColor;opacity:0;transition:opacity 100ms ease}
  .icon-btn:hover::after{opacity:.08}
  .icon-btn:focus-visible::after{opacity:.12}
  .icon-btn svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;
                stroke-linecap:round;stroke-linejoin:round}

  main{max-width:840px;margin:0 auto;padding:1rem 1rem 6rem}

  /* card */
  .card{
    background:var(--md-surface-container-low);
    border-radius:var(--r-md);
    box-shadow:var(--el1);
    overflow:hidden;
    margin-bottom:1rem;
    transition:box-shadow 200ms cubic-bezier(.2,0,0,1);
  }
  .card:hover{box-shadow:var(--el2)}
  .card__body{padding:1rem 1rem .5rem}
  .card__title{font:500 16px/24px var(--font);margin:0 0 .25rem}
  .card__text{font:400 14px/20px var(--font);color:var(--md-on-surface-variant);margin:0}
  .card__actions{display:flex;gap:.5rem;justify-content:flex-end;padding:.5rem 1rem 1rem}

  /* buttons */
  .btn{
    position:relative;isolation:isolate;
    display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
    min-height:40px;padding:0 1.5rem;border:0;border-radius:var(--r-full);
    font:500 14px/20px var(--font);cursor:pointer;
    transition:box-shadow 200ms cubic-bezier(.2,0,0,1);
  }
  .btn::after{content:"";position:absolute;inset:0;border-radius:inherit;
              background:currentColor;opacity:0;transition:opacity 100ms ease}
  .btn:hover::after{opacity:.08}
  .btn:focus-visible::after{opacity:.12}
  .btn:active::after{opacity:.12}

  .btn--filled{background:var(--md-primary);color:var(--md-on-primary)}
  .btn--tonal{background:var(--md-primary-container);color:var(--md-on-primary-container)}
  .btn--text{background:transparent;color:var(--md-primary);padding:0 .75rem}

  /* fab */
  .fab{
    position:fixed;right:1.25rem;bottom:1.5rem;z-index:30;
    display:inline-flex;align-items:center;gap:.75rem;
    height:56px;padding:0 1.25rem;border:0;border-radius:var(--r-lg);
    background:var(--md-primary-container);color:var(--md-on-primary-container);
    box-shadow:var(--el3);font:500 14px/20px var(--font);cursor:pointer;
    transition:box-shadow 200ms cubic-bezier(.2,0,0,1),transform 200ms cubic-bezier(.2,0,0,1);
  }
  .fab:hover{box-shadow:0 6px 10px 4px rgb(0 0 0/.15),0 2px 3px rgb(0 0 0/.3)}
  .fab:active{transform:scale(.97)}
  .fab svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;
           stroke-linecap:round;stroke-linejoin:round}

  :focus-visible{outline:3px solid var(--md-primary);outline-offset:2px}

  @media (prefers-reduced-motion:reduce){
    *{transition:none!important;animation:none!important}
    .fab:active{transform:none}
  }
</style>
</head>
<body>

<header class="app-bar">
  <button class="icon-btn" aria-label="Open navigation">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
  <h1>Tasks</h1>
  <button class="icon-btn" aria-label="Search">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
  </button>
</header>

<main>

  <article class="card">
    <div class="card__body">
      <h2 class="card__title">Ship the settings page</h2>
      <p class="card__text">Due today · assigned to you</p>
    </div>
    <div class="card__actions">
      <button class="btn btn--text">Snooze</button>
      <button class="btn btn--tonal">Mark done</button>
    </div>
  </article>

  <article class="card">
    <div class="card__body">
      <h2 class="card__title">Review the migration plan</h2>
      <p class="card__text">Due Friday · 2 comments</p>
    </div>
    <div class="card__actions">
      <button class="btn btn--text">Open</button>
    </div>
  </article>

</main>

<button class="fab">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
  New task
</button>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use a shadow not on the scale | The scale is the system |
| Elevate for decoration | Every level must mean a layer |
| Change color on hover instead of state layer | Breaks the interaction model |
| Invent a 6th type role | Six roles, fixed |
| Use radius 6px or 10px | The scale is 4/8/12/16/28 |
| Animate without Material easing | `cubic-bezier(.2,0,0,1)` is the standard curve |
| Put a FAB on desktop without need | FAB is a mobile-primary pattern |
| Use pure black text on pure white | M3 surfaces are tinted |

## Motion spec

| Interaction | Duration | Easing |
|---|---|---|
| State layer | 100ms | linear |
| Button elevation | 200ms | `cubic-bezier(.2,0,0,1)` |
| Card hover | 200ms | `cubic-bezier(.2,0,0,1)` |
| FAB press | 200ms | `cubic-bezier(.2,0,0,1)` |
| Page transition | 300ms | `cubic-bezier(.2,0,0,1)` |

## Accessibility notes

Material handles a lot, but not everything:

- State layers alone do not meet focus visibility — keep the `:focus-visible` outline
- Touch targets: 48×48dp minimum. The `.icon-btn` is 48px for this reason.
- `aria-label` on icon-only buttons — mandatory
- Color roles carry meaning: `--md-error` for destructive, `--md-primary` for affirmative. Do not swap.
- Contrast: `--md-on-surface-variant` on `--md-surface` is 7:1+. On `--md-surface-container` it drops to ~5.5:1. Still passes.

## Self-check before reporting

- [ ] Every shadow comes from the 5-step elevation scale
- [ ] Every elevation level has a stated meaning
- [ ] Type roles limited to the six defined
- [ ] Interaction uses state-layer opacity, not color change
- [ ] Border-radius only from the 4/8/12/16/28 scale
- [ ] Icon-only buttons have `aria-label`
- [ ] Touch targets ≥ 48px
- [ ] Material easing curve used for all transitions
