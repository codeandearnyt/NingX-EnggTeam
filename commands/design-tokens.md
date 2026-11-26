---
description: Generate or extend the three-layer token system — primitives, semantics, components — with dark mode, contrast-verified pairs, and lint enforcement.
argument-hint: <brand color, or "from scratch">
---

# /design-tokens

Produces `tokens.css` plus the lint config that keeps components out of it.

## Step 1 — The primitive layer

Raw values. No meaning. Never consumed by a component.

```css
:root {
  /* neutral ramp — 11 steps, perceptually even */
  --gray-0:   #ffffff;
  --gray-50:  #fafafa;
  --gray-100: #f4f4f5;
  --gray-200: #e4e4e7;
  --gray-300: #d4d4d8;
  --gray-400: #a1a1aa;
  --gray-500: #71717a;
  --gray-600: #52525b;
  --gray-700: #3f3f46;
  --gray-800: #27272a;
  --gray-900: #18181b;
  --gray-950: #09090b;

  /* brand ramp — one hue, derived by moving lightness only */
  --brand-50:  #eef6ff;
  --brand-100: #d9ebff;
  --brand-300: #7cc0ff;
  --brand-500: #2f90f5;
  --brand-600: #1d74d0;
  --brand-700: #175ba4;

  /* status */
  --green-500: #16a34a;
  --amber-500: #d97706;
  --red-500:   #dc2626;

  /* type scale — four steps minimum, consistent ratio */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.25rem;
  --text-xl:   1.5rem;
  --text-2xl:  2rem;
  --text-3xl:  2.75rem;
  --text-4xl:  3.75rem;

  /* space — 4px scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* radius — a scale, or zero */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* motion */
  --dur-fast: 140ms;
  --dur-base: 220ms;
  --dur-slow: 360ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-both: cubic-bezier(0.65, 0, 0.35, 1);

  /* elevation */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 12px 32px rgb(0 0 0 / 0.12);
}
```

## Step 2 — The semantic layer

Meaning. This is the layer components read.

```css
:root {
  --surface-base:    var(--gray-0);
  --surface-raised:  var(--gray-50);
  --surface-sunken:  var(--gray-100);

  --text-primary:    var(--gray-900);
  --text-secondary:  var(--gray-600);
  --text-muted:      var(--gray-500);
  --text-on-accent:  var(--gray-0);

  --border-subtle:   var(--gray-200);
  --border-strong:   var(--gray-300);

  --action-primary:      var(--brand-600);
  --action-primary-hover: var(--brand-700);
  --action-secondary:    var(--gray-900);

  --feedback-success: var(--green-500);
  --feedback-warning: var(--amber-500);
  --feedback-danger:  var(--red-500);

  --focus-ring: var(--brand-500);
}
```

## Step 3 — Dark mode remaps layer 2 only

```css
@media (prefers-color-scheme: dark) {
  :root {
    --surface-base:   var(--gray-950);
    --surface-raised: var(--gray-900);
    --surface-sunken: var(--gray-800);
    --text-primary:   var(--gray-50);
    --text-secondary: var(--gray-300);
    --text-muted:     var(--gray-400);
    --border-subtle:  var(--gray-800);
    --border-strong:  var(--gray-700);
    --action-primary: var(--brand-500);
    --focus-ring:     var(--brand-300);
  }
}

[data-theme="dark"] { /* identical block, after the media query */ }
[data-theme="light"] { /* the light values, after both */ }
```

Layer 2 only. A component that styles itself differently in dark mode has escaped the system.

## Step 4 — The component layer

Only where a component genuinely differs.

```css
--btn-bg:       var(--action-primary);
--btn-bg-hover: var(--action-primary-hover);
--btn-fg:       var(--text-on-accent);
--btn-radius:   var(--radius-md);
```

## Step 5 — Verify contrast

```js
const lum = ([r, g, b]) => {
  const c = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
```

Report the ratio for every pair that carries text:

```
text-primary on surface-base      15.9:1  pass
text-secondary on surface-base     6.4:1  pass
text-muted on surface-base         4.6:1  pass (borderline)
text-on-accent on action-primary   5.1:1  pass
focus-ring on surface-base         3.4:1  pass
```

## Step 6 — Enforce

```jsonc
// .stylelintrc.json
{
  "rules": {
    "color-no-hex": [true, { "ignoreFiles": ["**/tokens.css"] }],
    "declaration-property-value-disallowed-list": {
      "/^(color|background|background-color|border-color)$/": ["/^#/"],
      "transition": ["/\\ball\\b/"],
      "outline": ["none"]
    }
  }
}
```

## Step 7 — Report

```
TOKENS — <project>
Layers:      primitive / semantic / component, separated
Dark mode:   layer 2 remapped, data-theme override after the media query
Contrast:    5 pairs measured, 5 pass
Enforcement: stylelint color-no-hex outside tokens.css
Dead tokens: 0
```
