---
name: design-system-tokens
description: Define and consume a three-layer design token system (primitive → semantic → component) in CSS custom properties, with naming rules, dark-mode strategy, and a migration path. Use before writing component styles in any project that will grow past one page.
metadata:
  origin: ningx
  layer: craft
---

# Design System Tokens

Three layers. Every component reads from layer 3, every layer 3 value points at layer 2, every layer 2 value points at layer 1.

## The three layers

```
primitive   raw values, no meaning       --gray-900: #0a0a0a
semantic    meaning, still context-free  --text-primary: var(--gray-900)
component   tied to a component          --btn-bg: var(--text-primary)
```

**The rule:** a component never reads a primitive. If you write `color: var(--gray-900)` inside `.btn`, the system has failed — dark mode, rebranding, and theming all break at that line.

## Layer 1 — primitives

Raw scales. No meaning. Never used by components.

```css
:root {
  /* Neutral ramp — 12 steps, perceptually spaced */
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

  /* Brand — 9 steps */
  --brand-50:  #eff6ff;
  --brand-100: #dbeafe;
  --brand-300: #93c5fd;
  --brand-500: #3b82f6;
  --brand-600: #2563eb;
  --brand-700: #1d4ed8;
  --brand-900: #1e3a8a;

  /* Status */
  --red-500:   #ef4444;
  --red-600:   #dc2626;
  --amber-500: #f59e0b;
  --green-500: #22c55e;
  --green-600: #16a34a;

  /* Type scale — 1.25 ratio, clamped at the ends */
  --text-xs:   0.75rem;    /* 12 */
  --text-sm:   0.875rem;   /* 14 */
  --text-base: 1rem;       /* 16 */
  --text-lg:   1.125rem;   /* 18 */
  --text-xl:   1.25rem;    /* 20 */
  --text-2xl:  1.5rem;     /* 24 */
  --text-3xl:  1.875rem;   /* 30 */
  --text-4xl:  2.25rem;    /* 36 */
  --text-5xl:  3rem;       /* 48 */
  --text-6xl:  3.75rem;    /* 60 */

  /* Space — 4px base, 8px rhythm */
  --space-1:  0.25rem;   /* 4  */
  --space-2:  0.5rem;    /* 8  */
  --space-3:  0.75rem;   /* 12 */
  --space-4:  1rem;      /* 16 */
  --space-5:  1.25rem;   /* 20 */
  --space-6:  1.5rem;    /* 24 */
  --space-8:  2rem;      /* 32 */
  --space-10: 2.5rem;    /* 40 */
  --space-12: 3rem;      /* 48 */
  --space-16: 4rem;      /* 64 */
  --space-24: 6rem;      /* 96 */

  /* Radius */
  --radius-none: 0;
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   20px;
  --radius-full: 9999px;

  /* Motion */
  --duration-fast:   120ms;
  --duration-base:   200ms;
  --duration-slow:   320ms;
  --ease-out:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:   cubic-bezier(0.7, 0, 0.84, 0);
  --ease-both: cubic-bezier(0.65, 0, 0.35, 1);

  /* Elevation */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.10);
  --shadow-lg: 0 12px 32px -8px rgb(0 0 0 / 0.16);

  /* Layout */
  --max-w-prose: 68ch;
  --max-w-page:  1280px;
  --gutter:      clamp(1rem, 4vw, 2rem);
}
```

## Layer 2 — semantic

Meaning. Still no component names. This is the layer that changes between themes.

```css
:root {
  /* Surfaces, ordered by elevation */
  --surface-base:     var(--gray-0);
  --surface-raised:   var(--gray-50);
  --surface-overlay:  var(--gray-0);
  --surface-sunken:   var(--gray-100);

  /* Text */
  --text-primary:     var(--gray-900);
  --text-secondary:   var(--gray-600);
  --text-tertiary:    var(--gray-500);
  --text-disabled:    var(--gray-400);
  --text-inverse:     var(--gray-0);

  /* Borders */
  --border-subtle:    var(--gray-200);
  --border-default:   var(--gray-300);
  --border-strong:    var(--gray-400);

  /* Interactive */
  --action-primary:        var(--brand-600);
  --action-primary-hover:  var(--brand-700);
  --action-on-primary:     var(--gray-0);
  --action-ghost-hover:    var(--gray-100);

  /* Feedback */
  --feedback-error:    var(--red-600);
  --feedback-warning:  var(--amber-500);
  --feedback-success:  var(--green-600);

  /* Focus — one ring for the whole app */
  --focus-ring: 0 0 0 2px var(--surface-base), 0 0 0 4px var(--brand-500);
}
```

## Layer 3 — component

Only where a component genuinely differs from the semantic default.

```css
:root {
  --btn-radius:       var(--radius-md);
  --btn-height-sm:    32px;
  --btn-height-md:    40px;
  --btn-height-lg:    48px;
  --btn-padding-x:    var(--space-4);
  --btn-font:         500 var(--text-sm) / 1 var(--font-sans);
  --btn-transition:   background-color var(--duration-fast) var(--ease-out);

  --input-height:     40px;
  --input-border:     1px solid var(--border-default);
  --input-bg:         var(--surface-base);

  --card-padding:     var(--space-6);
  --card-radius:      var(--radius-lg);
  --card-shadow:      var(--shadow-sm);
}
```

## Dark mode — remap layer 2, never layer 1 or 3

```css
@media (prefers-color-scheme: dark) {
  :root {
    --surface-base:    var(--gray-950);
    --surface-raised:  var(--gray-900);
    --surface-overlay: var(--gray-800);
    --surface-sunken:  var(--gray-950);

    --text-primary:    var(--gray-50);
    --text-secondary:  var(--gray-400);
    --text-tertiary:   var(--gray-500);
    --text-disabled:   var(--gray-600);
    --text-inverse:    var(--gray-950);

    --border-subtle:   var(--gray-800);
    --border-default:  var(--gray-700);
    --border-strong:   var(--gray-600);

    --action-primary:       var(--brand-500);
    --action-primary-hover: var(--brand-400, #60a5fa);
    --action-on-primary:    var(--gray-950);
    --action-ghost-hover:   var(--gray-800);

    --feedback-error:   var(--red-500);
    --feedback-success: var(--green-500);

    --focus-ring: 0 0 0 2px var(--surface-base), 0 0 0 4px var(--brand-500);
  }
}
```

Manual override:

```css
[data-theme="dark"]  { /* same block as above */ }
[data-theme="light"] { /* the light values */ }
```

Precedence: `[data-theme]` beats the media query because attribute selectors and media queries have the same specificity, and the later rule wins. Put `[data-theme]` after the media block.

## Naming rules

| Do | Don't |
|---|---|
| `--text-secondary` | `--gray-600` (in a component) |
| `--surface-raised` | `--card-background-color` (in a non-card) |
| `--action-primary` | `--blue-button` |
| `--space-4` | `--gap-medium` |

Names describe **role**, not appearance. `--action-primary` survives a rebrand to green; `--blue-button` does not.

## Consuming tokens

```css
.btn {
  height: var(--btn-height-md);
  padding-inline: var(--btn-padding-x);
  border: 0;
  border-radius: var(--btn-radius);
  background: var(--action-primary);
  color: var(--action-on-primary);
  font: var(--btn-font);
  cursor: pointer;
  transition: var(--btn-transition);
}
.btn:hover { background: var(--action-primary-hover); }
.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

Zero hex literals in the component. That is the test.

## The verification pass

Run this before declaring the token system done:

```bash
# 1. Every hex in the stylesheet should be in the primitive block only
grep -rn '#[0-9a-fA-F]\{3,8\}' src/styles --include='*.css' \
  | grep -v 'tokens.css'

# 2. No component should reference a primitive
grep -rn 'var(--gray-\|var(--brand-[0-9]\|var(--red-\|var(--green-\|var(--amber-' \
  src/components --include='*.css'

# 3. Every token used should be defined
# (build-time check; a missing var() silently resolves to nothing)
```

A non-empty result on #1 or #2 is a failing build.

## Dark mode contrast floors

Verify, do not assume:

| Pair | Minimum |
|---|---|
| `--text-primary` on `--surface-base` | 12:1 |
| `--text-secondary` on `--surface-base` | 7:1 |
| `--text-tertiary` on `--surface-base` | 4.5:1 |
| `--border-default` on `--surface-base` | 3:1 (UI components) |
| `--action-primary` text on its fill | 4.5:1 |

`--gray-500` `#71717a` on `--gray-950` `#09090b` is 4.6:1 — passes for `--text-tertiary`, fails for body. That distinction is the whole reason for having three text levels.

## Migration path for an existing project

Do not rewrite everything. Four passes:

1. **Extract.** Grep every hex, font-size, spacing value. Collect into a spreadsheet with counts. The top 20 values cover ~90% of uses.
2. **Name.** Map each collected value to a primitive step. Round to the nearest scale step — this is where the design quietly improves.
3. **Replace.** Mechanical find-and-replace from value to primitive. Verify visually after.
4. **Introduce semantic.** Only for the ~15 properties that actually vary (surfaces, text, borders, actions). Everything else stays primitive-referencing for now.

Passes 1–3 can be done in a day on a mid-size codebase. Pass 4 is where the leverage is, and it is worth doing properly.

## Self-check before reporting

- [ ] Three layers exist and are separated in files
- [ ] No component references a primitive token
- [ ] Dark mode remaps only layer 2
- [ ] `[data-theme]` overrides come after the media query
- [ ] Zero hex literals outside the primitive file
- [ ] Every semantic token resolves to a primitive
- [ ] Contrast verified per pair, not assumed
- [ ] One focus ring token used app-wide
- [ ] Spacing uses the 4px scale, no arbitrary values
