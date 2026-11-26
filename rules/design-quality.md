---
name: design-quality
alwaysApply: true
description: The visual bar every page must clear. Applies to any file that renders UI.
---

# Design Quality Rules

These load on every session. They are not suggestions.

## R1 — Every page names its UI type

Before markup exists, the page declares:

```html
<!-- ui-type: 05-swiss-grid (structural) -->
<!-- ui-type: 13-aurora (surface, hero only) -->
```

No declaration, no page. A page without a named type defaults to slop.

## R2 — Two types maximum

One structural type from 01–24, at most one surface type. Three is mush.

Invalid pairs, hard fail:

| Pair | Why |
|---|---|
| 08-neobrutalism + 15-neumorphism | opposite light models |
| 11-material + 17-claymorphism | two competing depth systems |
| 03-brutalist-html + anything | brutalism is the absence of style |
| 05-swiss-grid + 10-bento-grid | two structural systems fighting |

## R3 — One accent color

Two if one is a status color. Three is a carnival. Count them before shipping.

## R4 — No hex literal in a component

```css
/* FAIL */ .card { background: #f5f5f5; }
/* PASS */ .card { background: var(--surface-raised); }
```

Hex is allowed only in `tokens.css` (layer 1) and nowhere else.

## R5 — Radius from a scale, or zero

```css
/* FAIL — the universal AI default */
border-radius: 12px;

/* PASS */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-full: 9999px;
```

Every card at 12px means nobody chose.

## R6 — Spacing on a 4px scale

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96. A 13px gap is a bug.

## R7 — Section padding is at least 64px

Below that the page reads cramped no matter what the design is.

## R8 — Two type families

Display + body. Mono only for data. A third family needs a written reason.

## R9 — Body text 15–18px, measure ≤ 75ch

14px body is too small. 20px is too large. Long lines are unreadable.

## R10 — One element is the largest thing on the page

If everything competes, nothing leads. Name the largest thing before building.

## R11 — Shadows mean elevation

A shadow on a flat section is decoration. Remove it or raise the section.

## R12 — Gradient must model light

A gradient with no light source, no depth, and no function is the single most common AI tell. Delete it or ground it.

## R13 — Copy names a concrete thing

Banned: elevate, unlock, seamless, empower, revolutionise, game-changing, cutting-edge, next-generation, state-of-the-art, leverage, synergy, holistic, best-in-class, world-class, future of, reimagine, supercharge, effortless.

Every one of those is a place the copy stopped thinking.

## R14 — At least one number on every page

"Fast" is a claim. "42ms p99" is evidence.

## R15 — CTAs say what happens

"Get started" says nothing. "Create a store" / "Read the docs" / "See pricing" say what happens.

## R16 — No placeholder text

Lorem ipsum, "Company Name", "Your headline here", `href="#"`, `<!-- TODO -->` — all fail. There is no "fill this in later."

## R17 — The squint test

Blur the page. If the silhouette could be any SaaS page, the composition is generic. Redo it.

## R18 — The three-card test

Three identical cards in a row, each with icon + heading + two lines, is a default, not a decision. Justify it or change it.

## Enforcement

`hooks/ui-guard.py` blocks writes that violate R2, R4, R5, R6, R13, R16 at the file level. The rest are caught by `anti-slop-review` before shipping.
