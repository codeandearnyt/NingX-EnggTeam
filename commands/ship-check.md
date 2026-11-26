---
description: The final gate. Runs every check that must pass before a page or build is called done, and returns SHIP or DO-NOT-SHIP with evidence.
argument-hint: <page, route, or "everything">
---

# /ship-check

Nothing passes this without evidence. A claim without a check is not a result.

## Step 1 — The mechanical checks

```bash
# banned copy
grep -rniE 'elevate|unlock|seamless|empower|revolutioni|game.chang|cutting.edge|next.generation|state.of.the.art|leverage|synerg|holistic|best.in.class|world.class|future.of|reimagin|supercharge|effortless' src/

# placeholder content
grep -rniE 'lorem ipsum|TODO|FIXME|coming soon|Company Name|Your headline' src/
grep -rn 'href="#"' src/

# CSS violations
grep -rn 'transition: all' src/
grep -rn 'outline: none' src/
grep -rn 'border-radius: 12px' src/
grep -rn 'width: 100vw' src/

# hex outside the token layer
grep -rnE '#[0-9a-fA-F]{3,8}' src/ --include=*.css --include=*.tsx --include=*.jsx \
  | grep -v 'tokens.css'

# secrets
grep -rnE 'sk_live_|sk-[A-Za-z0-9]{32}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30}' src/
```

Every one of those must return zero lines.

## Step 2 — Anti-slop

Load `skills/anti-slop-review/SKILL.md`. Run all 24 checks. Write the verdict block.

A single FAIL blocks.

## Step 3 — Accessibility

```bash
npx axe-core --stdout <url>
npx lighthouse <url> --only-categories=accessibility --view
```

Then by hand:

- [ ] Skip link is first and works
- [ ] Every control reachable by Tab, in visual order
- [ ] Focus visible at every stop
- [ ] `Escape` closes overlays
- [ ] Focus returns to the trigger
- [ ] Primary task completes keyboard-only
- [ ] 200% zoom does not break layout

## Step 4 — Performance

```bash
npx lighthouse <url> --form-factor=mobile --throttling-method=simulate \
  --only-categories=performance --view
```

| Metric | Budget | Measured |
|---|---|---|
| LCP | ≤ 2.5s | |
| CLS | ≤ 0.1 | |
| INP | ≤ 200ms | |
| TTFB | ≤ 800ms | |
| Initial JS | ≤ 170KB gz | |

## Step 5 — Responsive

| Width | Pass |
|---|---|
| 320px | |
| 375px | |
| 768px | |
| 812×375 landscape | |
| 1024px | |
| 1440px | |
| 1920px | |
| 2560px | |

## Step 6 — Content

- [ ] Every list has four states: loading, error, empty, data
- [ ] Zero placeholder text
- [ ] Zero `href="#"`
- [ ] At least one concrete number per page
- [ ] Every CTA says what happens
- [ ] One `<h1>` per page, headings ordered

## Step 7 — Reduced motion

- [ ] `prefers-reduced-motion` block present in CSS
- [ ] JS animations check `matchMedia`
- [ ] State changes still occur with motion off
- [ ] Shader renders one frame, then stops

## Step 8 — Verdict

```
SHIP CHECK — <page>

Mechanical:      PASS (0 hits)
Anti-slop:       PASS
Accessibility:   PASS (axe 0 critical, keyboard pass)
Performance:     LCP 1.4s · CLS 0.01 · INP 70ms · JS 88KB gz
Responsive:      PASS (8 widths + 200% zoom)
Content:         PASS
Reduced motion:  PASS

VERDICT: SHIP
```

or

```
SHIP CHECK — <page>

Mechanical:      FAIL — 3 hits (2 × "seamless", 1 × href="#")
Accessibility:   FAIL — search input has no label

VERDICT: DO-NOT-SHIP

Blocking:
  1. src/pages/Hero.tsx:18 — "Seamless integration" → name the actual integration
  2. src/pages/Hero.tsx:44 — "seamless" in the subhead → rewrite
  3. src/components/Nav.tsx:12 — href="#" → /docs
  4. src/features/search/SearchBar.tsx:8 — add <label for="q">
```

There is no conditional SHIP. Either every gate passes or the build does not go.
