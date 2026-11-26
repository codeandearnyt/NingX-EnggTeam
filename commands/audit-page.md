---
description: Audit an existing page or component against the anti-slop checks, accessibility floor, width ladder, and performance budget. Returns a numbered PASS/FAIL.
argument-hint: <file, route, or URL>
---

# /audit-page

Read-only. Finds problems, reports them precisely, does not fix them.

## Step 1 — Identify

State what is being audited: file path or route, and the UI type it claims to use.

If there is no `ui-type:` comment, that is finding **S1** immediately.

## Step 2 — Structural audit

| Check | What to look for |
|---|---|
| S1 | `ui-type:` comment present |
| S2 | Two types maximum, one structural one surface |
| S3 | Heading hierarchy: four distinct levels on a long page |
| S4 | First viewport answers: what, who, do what next |

## Step 3 — Visual audit

| Check | What to look for |
|---|---|
| C1 | One accent color (two if one is status) |
| C2 | Every color maps to a token with a role |
| C3 | Zero hex literals outside `tokens.css` |
| C4 | Every gradient models light or is deleted |
| T1 | Two type families maximum |
| T2 | Four-step type scale with a consistent ratio |
| T3 | Body 15–18px |
| T4 | Measure ≤ 75ch |
| T5 | Nothing centered that should be left-aligned |
| Sp1 | Spacing on the 4px scale |
| Sp2 | Section padding ≥ 64px |
| Sp3 | Space groups related things closer |
| Sh1 | Radius from a scale, or zero — not universal 12px |
| Sh2 | Shadows only on elevated surfaces |
| Sh3 | Squint test: the silhouette is recognizable |

## Step 4 — Content audit

| Check | What to look for |
|---|---|
| Co1 | Zero banned marketing phrases |
| Co2 | At least one concrete number |
| Co3 | CTAs say what happens |
| Co4 | Zero placeholder text |

## Step 5 — Motion audit

| Check | What to look for |
|---|---|
| M1 | Every animation has a purpose |
| M2 | `prefers-reduced-motion` present |
| M3 | Named easing curves, not the `ease` default |

## Step 6 — Craft audit

| Check | What to look for |
|---|---|
| Cr1 | No horizontal scroll at 320px |
| Cr2 | Content capped at 2560px |
| Cr3 | Focus visible at every stop |
| Cr4 | No placeholder images, no emoji as icons |

## Step 7 — Accessibility

Load `skills/accessibility-wcag/SKILL.md`.

```bash
npx axe-core --stdout <url>
npx lighthouse <url> --only-categories=accessibility --view
```

Then the manual pass: Tab from the top, Escape closes overlays, focus returns after close, primary task completable keyboard-only.

## Step 8 — Performance

```bash
npx lighthouse <url> --form-factor=mobile --throttling-method=simulate \
  --only-categories=performance --view
```

Report LCP, CLS, INP, TTFB, initial JS gzipped.

## Step 9 — Verdict

```
AUDIT — <page>
Verdict: PASS | FAIL (<n> violations)

[S1] no ui-type comment — src/pages/Pricing.tsx
[C4] purple-to-pink gradient behind hero, no light source — Hero.tsx:22
[Sh1] every card at border-radius: 12px — Card.module.css:14
[Co1] "Elevate your billing workflow" — Hero.tsx:31

LCP 3.1s (fail, budget 2.5s) · CLS 0.04 · JS 214KB gz (fail, budget 170KB)
Widths: 320 pass · 768 pass · 1440 pass · 2560 pass
Keyboard: pass · Reduced motion: missing
```

One FAIL blocks. No "mostly passing."
