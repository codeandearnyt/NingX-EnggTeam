---
name: accessibility-wcag
description: Audit and fix a page against WCAG 2.2 AA — contrast, keyboard, focus, semantics, forms, motion, and the four criteria most often missed. Use on every build before shipping, and whenever a component involves interaction, motion, or color.
metadata:
  origin: ningx
  layer: craft
---

# Accessibility — WCAG 2.2 AA

Not a checklist bolted on at the end. A constraint that shapes the build from the first line.

## The four principles, translated into work

| Principle | What it means in code |
|---|---|
| **Perceivable** | Contrast, alt text, captions, no color-only meaning |
| **Operable** | Keyboard reachable, focus visible, no traps, enough time |
| **Understandable** | Labels, consistent navigation, errors that say what to do |
| **Robust** | Valid semantics, ARIA only where HTML cannot express it |

## Contrast — the numbers

| Content | Minimum ratio |
|---|---|
| Body text (< 18pt / < 14pt bold) | **4.5:1** |
| Large text (≥ 18pt / ≥ 14pt bold) | **3:1** |
| UI components (borders, icons that carry meaning) | **3:1** |
| Focus indicators | **3:1** against adjacent colors |
| Decorative | exempt — but if it looks like content, it is content |

WCAG 2.2 adds **1.4.11 Non-text Contrast** — a form field's border, a checkbox's tick, a chart's line all need 3:1. This is the criterion most builds fail.

```css
/* compute it, do not eyeball it */
/* relative luminance, sRGB */
function luminance([r, g, b]) {
  const c = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
```

## Keyboard — the reachability rule

Every interactive element must be:

1. Reachable by `Tab`
2. Activatable by `Enter` / `Space`
3. Visible when focused
4. Escapable if it opened something
5. In DOM order that matches visual order

```css
/* The only acceptable focus pattern */
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
  border-radius: inherit;
}

/* NEVER this */
*:focus { outline: none; }
```

`outline: none` with no replacement is a hard fail. There is no exception.

### Focus ring on dark and saturated backgrounds

`outline` alone can vanish on a saturated button. Use a two-tone ring:

```css
:focus-visible {
  outline: 2px solid var(--surface-base);
  box-shadow: 0 0 0 4px var(--action-primary);
}
```

The light ring separates the dark ring from the button fill. It works on any background.

### Skip link — mandatory on any page with nav

```html
<a class="skip" href="#main">Skip to content</a>
<main id="main" tabindex="-1">…</main>
```

```css
.skip {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: var(--surface-overlay);
  color: var(--text-primary);
}
.skip:focus {
  left: 0;
}
```

## Semantics — the HTML-first rule

| Need | Use | Not |
|---|---|---|
| Clickable action | `<button>` | `<div onclick>` |
| Navigation | `<a href>` | `<button>` that pushes history |
| Section with a heading | `<section aria-labelledby>` | `<div>` |
| Group of form fields | `<fieldset><legend>` | a `<div class="group">` |
| Current page | `aria-current="page"` | a class |
| Toggle | `aria-pressed` | a class swap |
| Expand/collapse | `aria-expanded` | a class swap |
| Modal | `<dialog>` | a fixed div with a manual trap |

`<dialog>` is native and handles focus trapping, Escape, and the backdrop. Use it.

```html
<dialog id="confirm">
  <form method="dialog">
    <h2>Delete this project?</h2>
    <p>This cannot be undone.</p>
    <menu>
      <button value="cancel">Cancel</button>
      <button value="confirm">Delete</button>
    </menu>
  </form>
</dialog>
```

## Forms — the most-failed area

```html
<div class="field">
  <label for="email">Email address</label>
  <input id="email" type="email" name="email"
         autocomplete="email" required
         aria-describedby="email-hint email-error">
  <p id="email-hint" class="hint">We only use this for receipts.</p>
  <p id="email-error" class="error" role="alert" hidden>
    Enter a complete email address, like name@example.com.
  </p>
</div>
```

Rules:

- **Every input has a `<label for>`.** Placeholder is not a label — it disappears on input.
- **Errors name the fix**, not the failure. "Enter a complete email address" not "Invalid input."
- **`aria-describedby`** links hint and error to the field.
- **`role="alert"`** on the error container announces it.
- **`aria-invalid="true"`** on the field when it fails.
- **Never disable the submit button** as validation. Users cannot discover why it is disabled. Validate on submit and show errors.

## Motion — WCAG 2.2 additions

**2.3.3 Animation from Interactions** — motion triggered by interaction must be disableable unless essential.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

But **do not stop at the CSS**. JS-driven animation needs the same guard:

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function animate(el, keyframes, options) {
  if (reduce.matches) {
    el.style.cssText = '';       // final state, no motion
    return { finished: Promise.resolve(), cancel() {} };
  }
  return el.animate(keyframes, options);
}
```

**2.2.2 Pause, Stop, Hide** — anything that moves for more than 5 seconds automatically must be pausable. Marquees, carousels, auto-scrolling tickers.

## Target size — WCAG 2.2 AA

**2.5.8 Target Size (Minimum)** — 24×24 CSS px, or 24px of spacing between targets.

In practice: **44×44** for touch, **24×24** for mouse-only. Build for 44.

```css
.icon-btn {
  min-width: 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
}
/* visually small, hit area large */
.icon-btn--sm {
  position: relative;
}
.icon-btn--sm::after {
  content: "";
  position: absolute;
  inset: -10px;         /* expands the hit area to 44px */
}
```

## Images and media

```html
<!-- informative -->
<img src="chart.png" width="800" height="400"
     alt="Revenue rose from 2.1 to 4.8 million between Q1 and Q4 2025">

<!-- decorative -->
<img src="divider.svg" alt="">

<!-- functional (inside a link) -->
<a href="/"><img src="logo.svg" alt="Acme home"></a>

<!-- complex -->
<figure>
  <img src="chart.png" alt="Bar chart of quarterly revenue, described in the table below.">
  <figcaption>Figure 1. Quarterly revenue.</figcaption>
</figure>
<table><!-- the data --></table>
```

Alt text describes the **content**, not the file. "chart.png" is not alt text.

## Live regions

```html
<!-- polite: announces when the user is idle -->
<p role="status" aria-live="polite">Saved 2 minutes ago</p>

<!-- assertive: interrupts. Use only for errors. -->
<p role="alert">Session expired. Sign in again.</p>
```

Do not put `aria-live` on a container that updates constantly. It will read everything forever.

## The audit — run this before shipping

```bash
# 1. Automated: catches ~35% of issues
npx axe-core --stdout https://localhost:3000

# 2. Keyboard-only pass, manual:
#    - Tab from the top. Is every control reachable?
#    - Is focus always visible?
#    - Does Escape close what opened?
#    - Is the skip link first?

# 3. Screen reader spot-check
#    - VoiceOver (macOS): Cmd+F5
#    - NVDA (Windows): Ctrl+Alt+N
#    - Does the page make sense with the screen off?

# 4. Zoom to 200% — does anything break or overlap?
# 5. Set prefers-reduced-motion — does anything still move?
```

Automated tools catch contrast, missing labels, missing alt. They miss focus order, meaningful alt text, and whether an error message is useful. Both passes are required.

## The ten failures I see most

1. `outline: none` with no replacement
2. Placeholder used as a label
3. `<div>` with `onclick` instead of `<button>`
4. Decorative SVG without `aria-hidden="true"`
5. Error state shown by red border only, no text
6. Icon-only button with no `aria-label`
7. Focus ring removed by a reset stylesheet
8. Motion with no `prefers-reduced-motion` path
9. Contrast at 4.4:1 on secondary text, assumed fine
10. Modal that does not trap focus or restore it on close

## Self-check before reporting

- [ ] Every text color measured against its actual background
- [ ] Every UI border/icon at 3:1
- [ ] `:focus-visible` styled everywhere, never removed
- [ ] Skip link is the first focusable element
- [ ] Every input has a real `<label for>`
- [ ] Errors use `role="alert"` and name the fix
- [ ] Every interactive element is a `<button>` or `<a>`
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative images `alt=""`, informative images described
- [ ] `prefers-reduced-motion` handled in CSS **and** JS
- [ ] Touch targets ≥ 44px
- [ ] Modal uses `<dialog>` or traps and restores focus
- [ ] Zoom to 200% does not break layout
- [ ] Keyboard-only pass completed by hand
