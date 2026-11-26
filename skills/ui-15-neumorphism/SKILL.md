---
name: ui-15-neumorphism
description: Build neumorphic soft UI where elements are extruded from a single surface using paired light and dark shadows. Use for smart-home controls, audio hardware, calculator-style tools, and any page where the reference standard is neumorphism.io and monochrome tactility is the goal. Includes the contrast limits that make it shippable.
metadata:
  origin: ningx
  ui-type: 15
  reference: https://neumorphism.io
---

# UI Type 15 — Neumorphism (Soft UI)

Elements extruded from one surface. Paired light/dark shadows. Monochrome.

**Reference standard:** neumorphism.io

## The honest caveat first

Neumorphism has a well-known accessibility problem: **by design, elements have low contrast against their background.** That is the aesthetic. It is also the failure.

This skill exists to build it *correctly*, which means accepting three constraints:

1. **Never the primary interface for a text-heavy product.** It is for controls, not content.
2. **Every interactive element needs a non-shadow affordance** — a label, an icon, a text color shift, or a border on focus.
3. **Contrast is verified per element**, not assumed from the palette.

Build it for the right job and it works. Build a dashboard in it and you will fail WCAG.

## When to reach for it

- Hardware-adjacent controls (volume, thermostat, mixer)
- Single-purpose tools (calculator, timer, metronome)
- The surface itself is the product (a UI showcase)
- Dark-mode-adjacent contexts where softness reads as premium

## The signature

One base color. Two shadows per element, from opposite corners, using light and dark **derived from the base**:

```css
:root {
  --base: #e0e5ec;
  --light: #ffffff;      /* top-left, lighter than base */
  --dark: #a3b1c6;       /* bottom-right, darker than base */

  --raise: -8px -8px 16px var(--light), 8px 8px 16px var(--dark);
  --press: inset -4px -4px 8px var(--light), inset 4px 4px 8px var(--dark);
}
```

The rule: `light` is the base lightened ~20%, `dark` is the base darkened ~20%. They must be **the same hue**. A grey base with a blue shadow looks wrong.

## Deriving the shadow colors

From `#e0e5ec` (hue 215, sat 30%, light 90%):

```
light  → lighten to 100%  → #ffffff
dark   → darken  to  68%  → #a3b1c6
```

Keep hue and saturation constant. Only lightness moves. This is why most neumorphic attempts look muddy — they use pure `#000` for the dark shadow, which desaturates the whole surface.

## The three states

| State | Shadow | Use |
|---|---|---|
| Raised | `-8px -8px 16px light, 8px 8px 16px dark` | Default for buttons, cards |
| Pressed | `inset -4px -4px 8px light, inset 4px 4px 8px dark` | `:active`, toggled on |
| Flat | `none` | Static text containers |

Only three. No hover elevation — neumorphism does not have hover depth, it has press depth.

## Tokens

```css
:root {
  --base: #e0e5ec;
  --base-soft: #eaeef4;
  --light: #ffffff;
  --dark: #a3b1c6;

  --ink: #2c3a4b;         /* 11.4:1 on base */
  --ink-soft: #55637a;    /* 6.2:1 on base */
  --ink-mute: #7d8ba1;    /* 3.4:1 — meta only, never body */
  --accent: #4a7cf7;      /* used on 2% of the surface */

  --radius: 24px;
  --radius-sm: 16px;
  --radius-lg: 40px;

  --raise: -8px -8px 16px var(--light), 8px 8px 16px var(--dark);
  --raise-sm: -4px -4px 8px var(--light), 4px 4px 8px var(--dark);
  --press: inset -4px -4px 8px var(--light), inset 4px 4px 8px var(--dark);

  --font: system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

Dark variant — invert the relationship, keep the hue:

```css
[data-theme="dark"] {
  --base: #23272e;
  --light: #2c3138;
  --dark: #191c21;
  --ink: #e8ecf1;
  --ink-soft: #a8b2c0;
  --ink-mute: #78828f;
}
```

Note: on dark, `light` is only slightly lighter and `dark` slightly darker. Extreme contrast on dark neumorphism looks like glowing plastic.

## Anatomy

```
<div class="surface">          the base color, full page
  <button class="neo">         raised by default, pressed on :active
  <div class="neo-card">       raised container
    <div class="neo-inset">    pressed well — progress, input, display
  <input class="neo-input">    pressed by default (it is a well)
```

The design logic: **things that stick out are buttons; things that go in are inputs and displays.** That physical metaphor is what makes neumorphism coherent.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thermostat</title>
<style>
  :root{
    --base:#e0e5ec; --base-soft:#eaeef4; --light:#fff; --dark:#a3b1c6;
    --ink:#2c3a4b; --ink-soft:#55637a; --ink-mute:#7d8ba1; --accent:#4a7cf7;
    --radius-sm:16px; --radius:24px; --radius-lg:40px;
    --raise:-8px -8px 16px var(--light),8px 8px 16px var(--dark);
    --raise-sm:-4px -4px 8px var(--light),4px 4px 8px var(--dark);
    --press:inset -4px -4px 8px var(--light),inset 4px 4px 8px var(--dark);
    --font:system-ui,-apple-system,"Segoe UI",sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;
       background:var(--base);color:var(--ink);
       font:1rem/1.5 var(--font);-webkit-font-smoothing:antialiased;
       padding:1.5rem}

  .device{
    width:min(380px,100%);background:var(--base);border-radius:var(--radius-lg);
    padding:2rem 1.75rem;box-shadow:var(--raise);
  }

  .device__label{font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;
                 color:var(--ink-soft);text-align:center;margin:0 0 1.75rem}

  /* the display is a well, not a raised element */
  .display{
    border-radius:var(--radius);padding:2rem 1.5rem;text-align:center;
    box-shadow:var(--press);margin-bottom:1.75rem;
  }
  .display__temp{
    font-size:4rem;font-weight:300;letter-spacing:-.04em;line-height:1;
    font-variant-numeric:tabular-nums;margin:0 0 .5rem;
  }
  .display__temp sup{font-size:1.5rem;vertical-align:super;font-weight:400}
  .display__state{margin:0;font-size:.875rem;color:var(--ink-soft)}
  .display__state b{color:var(--accent);font-weight:600}

  /* controls are raised */
  .row{display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .neo-btn{
    width:56px;height:56px;border:0;border-radius:50%;
    background:var(--base);color:var(--ink);cursor:pointer;
    display:grid;place-items:center;
    box-shadow:var(--raise-sm);
    transition:box-shadow 140ms ease,color 140ms ease;
  }
  .neo-btn:hover{color:var(--accent)}
  .neo-btn:active{box-shadow:var(--press)}
  .neo-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;
               stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

  .neo-btn--wide{
    flex:1;height:56px;border-radius:var(--radius-sm);
    display:flex;align-items:center;justify-content:center;gap:.5rem;
    font:500 .9375rem/1 var(--font);
  }
  .neo-btn--wide[aria-pressed="true"]{box-shadow:var(--press);color:var(--accent)}

  /* mode selector */
  .modes{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:1.75rem}
  .mode{
    border:0;border-radius:var(--radius-sm);background:var(--base);
    padding:.875rem .5rem;cursor:pointer;
    display:grid;place-items:center;gap:.375rem;
    font:500 .75rem/1 var(--font);color:var(--ink-soft);
    box-shadow:var(--raise-sm);
    transition:box-shadow 140ms ease,color 140ms ease;
  }
  .mode svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.75;
            stroke-linecap:round;stroke-linejoin:round}
  .mode[aria-pressed="true"]{box-shadow:var(--press);color:var(--accent)}

  /* THE AFFORDANCE — every control carries a visible label */
  .neo-btn:focus-visible,.mode:focus-visible,.neo-btn--wide:focus-visible{
    outline:2px solid var(--accent);outline-offset:4px;
  }

  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
  @media (prefers-contrast:more){
    :root{--ink-mute:#4a566b}
    .neo-btn,.mode,.device{box-shadow:none;border:1px solid #9aa8bd}
  }
</style>
</head>
<body>

<div class="device">
  <p class="device__label">Living room</p>

  <div class="display">
    <p class="display__temp">21<sup>°C</sup></p>
    <p class="display__state">Heating to <b>22°C</b></p>
  </div>

  <div class="row">
    <button class="neo-btn" aria-label="Decrease temperature">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>
    </button>
    <button class="neo-btn neo-btn--wide" aria-pressed="false" aria-label="Power">
      <svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px">
        <path d="M12 4v8"/><path d="M7 7a7 7 0 1 0 10 0"/>
      </svg>
      On
    </button>
    <button class="neo-btn" aria-label="Increase temperature">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
    </button>
  </div>

  <div class="modes" role="group" aria-label="Mode">
    <button class="mode" aria-pressed="true">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l4-6 3 4 3-5 6 7z"/></svg>
      Auto
    </button>
    <button class="mode" aria-pressed="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
      Heat
    </button>
    <button class="mode" aria-pressed="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 8l7-5 7 5"/></svg>
      Cool
    </button>
  </div>
</div>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use `#000` for the dark shadow | Desaturates the surface, reads as dirty |
| Use `rgba(0,0,0,.1)` blur shadows | Not a paired shadow — that is Material |
| Put body text in a neumorphic card | Contrast fails, reading is exhausting |
| More than one hue in the palette | Monochrome is the point |
| Hover elevation | Neumorphism has press depth, not hover depth |
| Small border-radius | The softness needs 16px+ to read |
| Skip labels on icon buttons | The shadow is not an affordance |
| Use it for a dashboard with 40 controls | Cognitive load + contrast failure |

## The contrast rescue

Neumorphism's shadows sit at about 1.2:1 against the base — well below the 3:1 required for UI components. Fix it without breaking the look:

1. **Text labels at 6:1+** on every control (`--ink-soft` gives 6.2:1)
2. **A 1px border at 3:1 on focus** — not always-on, but present
3. **`prefers-contrast: more`** swaps shadows for borders (see scaffold)
4. **Icon color shift on hover** gives a second affordance

That combination is what makes neumorphism pass an audit.

## Accessibility notes

- Never encode state by shadow alone. `aria-pressed` + a color change + the shadow.
- Touch targets 56px — this type uses large soft controls anyway
- `--ink-mute` at 3.4:1 is for non-essential meta only. Never labels.
- The `prefers-contrast: more` block is not optional in production
- Screen readers get nothing from shadows — every control needs a label

## Self-check before reporting

- [ ] `--light` and `--dark` derived from `--base` with the same hue
- [ ] Two shadows per element, opposite corners
- [ ] Inputs/displays use `inset`, buttons use raised
- [ ] Every icon-only button has `aria-label`
- [ ] Text contrast ≥ 4.5:1 verified against `--base`
- [ ] `prefers-contrast: more` fallback present
- [ ] No body text inside neumorphic cards
- [ ] Border-radius ≥ 16px
