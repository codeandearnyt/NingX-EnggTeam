---
name: accessibility
alwaysApply: true
description: WCAG 2.2 AA floor. Applies to any markup, style, or script that produces an interface.
---

# Accessibility Rules

WCAG 2.2 AA is the floor, not the goal. Every rule below is measured, never assumed.

## R1 — Contrast, measured

| Content | Minimum |
|---|---|
| Body text | 4.5:1 |
| Large text (≥ 24px, or ≥ 19px bold) | 3:1 |
| UI borders, icons that carry meaning | 3:1 |
| Focus indicator against adjacent colors | 3:1 |

Measure with the luminance formula, not by eye. A palette that cannot hit 4.5:1 is a palette problem.

## R2 — Focus is never removed

```css
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

`outline: none` without a replacement is a hard fail. On saturated backgrounds, use the two-tone ring:

```css
:focus-visible {
  outline: 2px solid var(--surface-base);
  box-shadow: 0 0 0 4px var(--action-primary);
}
```

## R3 — Semantic elements

| Wrong | Right |
|---|---|
| `<div onclick>` | `<button type="button">` |
| `<span class="link">` | `<a href="…">` |
| `<div class="header">` | `<header>` |
| `<div class="nav">` | `<nav aria-label="Main">` |
| `<div class="modal">` | `<dialog>` |
| `<h3 class="h1">` | `<h1>` + CSS |

## R4 — One `<h1>` per page, no skipped levels

Headings describe structure. They are not a font-size tool.

## R5 — Every input has a label

```html
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email" required
       aria-describedby="email-hint email-error">
<p id="email-hint">We only use this for receipts.</p>
<p id="email-error" role="alert" hidden>Enter a complete email address.</p>
```

Placeholder is not a label. Error text names the fix, not the failure. The submit button is never disabled as a validation strategy.

## R6 — Icon-only buttons have an accessible name

```html
<button aria-label="Close dialog"><svg aria-hidden="true">…</svg></button>
```

## R7 — Images

Decorative → `alt=""`. Informative → describe what it conveys, not what it is. Never `alt="image"`.

## R8 — Motion respects the setting

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

CSS alone is not enough. JS animation checks `matchMedia('(prefers-reduced-motion: reduce)')` too.

**The state change still happens.** The motion disappears, not the behaviour.

## R9 — Target size ≥ 44×44 CSS px

WCAG 2.2 SC 2.5.8 is 24×24 minimum; 44 is the practical bar for touch.

```css
.btn, .nav-link { min-height: 44px; display: inline-flex; align-items: center; }
```

## R10 — Zoom and reflow

200% zoom must not clip, overlap, or require horizontal scroll. Never `maximum-scale=1` or `user-scalable=no` in the viewport meta.

## R11 — Modal focus management

- Focus moves into the dialog on open
- `Tab` cycles inside the dialog
- `Escape` closes it
- Focus returns to the trigger on close

`<dialog>` with `showModal()` gives most of this for free. Use it.

## R12 — Skip link first

```html
<a class="skip" href="#main">Skip to content</a>
```

It must be the first focusable element and visible on focus.

## R13 — Live regions for async feedback

```html
<div role="status" aria-live="polite">Saved</div>
```

Errors use `role="alert"`. Never announce on every keystroke.

## R14 — The manual pass is mandatory

Automated tools catch roughly 35% of issues. Every build gets a by-hand keyboard pass:

1. `Tab` from the top — is the skip link first?
2. Every control reachable, in visual order?
3. Focus visible at every stop?
4. `Escape` closes overlays?
5. Focus returns to the trigger?
6. Primary task completable keyboard-only?

A "no" anywhere is a fail.

## Enforcement

`hooks/ui-guard.py` blocks `outline: none` without a replacement, `<div onclick>`, `<img>` without `alt`, `<input>` without an associated label, and animations with no reduced-motion block in the file.
