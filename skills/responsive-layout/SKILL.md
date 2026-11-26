---
name: responsive-layout
description: Build layouts that hold at every width — intrinsic sizing, container queries, fluid type and space with clamp(), and the breakpoint strategy that avoids device-specific hacks. Use whenever a layout involves columns, cards, sidebars, or any element that must survive from 320px to 2560px.
metadata:
  origin: ningx
  layer: craft
---

# Responsive Layout

Layouts should respond to their container, not to a list of device widths.

## The breakpoint strategy

**Start with zero breakpoints.** Most layouts need three at most:

```css
/* 1. Mobile base — no media query */
/* 2. ~640px — the layout gains a second column */
/* 3. ~1024px — the layout gains a sidebar */
```

Every additional breakpoint is a place the design can break. If you have seven, you are compensating for a layout that should be intrinsic.

**The exception:** when the design genuinely changes structure (mobile nav drawer vs desktop nav bar), a breakpoint is correct. That is a component decision, not a layout decision.

## Intrinsic layouts — the four primitives

These cover ~80% of all layouts, with no media queries.

**1. The stack** — vertical rhythm.

```css
.stack > * + * {
  margin-block-start: var(--stack-space, 1rem);
}

/* modern equivalent */
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--stack-space, 1rem);
}
```

**2. The cluster** — wrapping horizontal group (tags, buttons, nav).

```css
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cluster-space, 0.75rem);
  align-items: center;
}
```

**3. The grid** — auto-fitting cards.

```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--grid-space, 1.5rem);
}
```

The `min(280px, 100%)` is critical. Without it, a 280px minimum overflows any container narrower than 280px — which is every phone in landscape with a sidebar.

**4. The sidebar** — content plus a fixed-width aside, collapsing when there is no room.

```css
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sidebar-gap, 2rem);
}
.with-sidebar > .sidebar {
  flex-basis: 280px;
  flex-grow: 1;
}
.with-sidebar > .main {
  flex-basis: 0;
  flex-grow: 999;
  min-width: min(60%, 100%);
}
```

The `flex-grow: 999` on main versus `1` on the sidebar means main takes all remaining space. When the container drops below `280px + 60%`, the sidebar wraps. No media query.

## Fluid type and space

```css
:root {
  /* clamp(min, preferred, max) — the preferred value does the work */
  --fs-sm:   clamp(0.8125rem, 0.78rem + 0.16vw, 0.875rem);
  --fs-base: clamp(1rem,      0.95rem + 0.25vw, 1.125rem);
  --fs-lg:   clamp(1.125rem,  1.05rem + 0.38vw, 1.375rem);
  --fs-xl:   clamp(1.375rem,  1.2rem  + 0.88vw, 1.875rem);
  --fs-2xl:  clamp(1.75rem,   1.4rem  + 1.75vw, 2.75rem);
  --fs-3xl:  clamp(2.25rem,   1.6rem  + 3.25vw, 4rem);

  --space-section: clamp(3rem, 2rem + 5vw, 7rem);
  --gutter:        clamp(1rem, 0.5rem + 2.5vw, 2.5rem);
}
```

Deriving the middle value: pick the min at 320px, the max at 1440px, then `preferred = min_rem + (max_rem - min_rem) * (100vw - 320px) / (1440 - 320)`. In practice, `preferred ≈ min_rem + slope * vw`. The `0.16vw`–`3.25vw` values above are already derived.

**Never** use `font-size: 2vw` alone — it ignores user zoom and breaks at both extremes.

## Container queries — the better tool

When a component's layout depends on **its own width**, not the viewport, use a container query. A card in a 300px sidebar and the same card in a 900px main column should not look the same, and no media query can know that.

```css
.card-wrap {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@container card (min-width: 480px) {
  .card {
    grid-template-columns: 160px 1fr;
    align-items: start;
  }
}
```

Support: all evergreen browsers since 2023. Safe to use.

## The viewport meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

That is the whole thing. Do not add `maximum-scale=1` or `user-scalable=no` — they block zoom, which is a WCAG failure.

## Images and media in a responsive layout

```css
img, video, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

/* the escape hatch for a deliberately full-bleed element */
.bleed {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
}
```

`width: 100vw` includes the scrollbar width and causes horizontal scroll. Use this instead:

```css
.bleed {
  width: 100%;
  margin-inline: calc(50% - 50cqw);   /* container-relative */
}
```

Or simply let the parent have no padding and skip the trick.

## Overflow — the horizontal scroll bug

Horizontal scroll on mobile is almost always one of these:

| Cause | Fix |
|---|---|
| `width: 100vw` | Use `100%` |
| Fixed-width child (e.g. `min-width: 600px`) | `min-width: 0` on the flex child |
| Long unbreakable string | `overflow-wrap: anywhere` |
| Negative margin | Reduce or use `margin-inline` |
| `grid-template-columns` with fixed px | `minmax(0, 1fr)` |
| Positioned element outside bounds | `overflow-x: clip` on the parent |

```css
/* the universal guard, use during development then remove */
* { outline: 1px solid red; }
```

Better — this bookmarklet finds the offender:

```js
[...document.querySelectorAll('*')]
  .filter(el => el.scrollWidth > el.clientWidth + 1)
  .forEach(el => console.log(el, el.scrollWidth, el.clientWidth));
```

## Flex and grid — the two traps

**Flex child overflow.** A flex child with long content will not shrink below its content size unless `min-width: 0`.

```css
.flex-row { display: flex; gap: 1rem; }
.flex-row > * { min-width: 0; }   /* the fix */
```

**Grid track overflow.** `1fr` means `minmax(auto, 1fr)`, and `auto` is at least the content size.

```css
/* overflows */
grid-template-columns: 1fr 1fr;

/* never overflows */
grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
```

## Touch and pointer

```css
/* hover effects only where hover exists */
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
}

/* touch targets */
.btn, .nav-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

/* safe areas on notched devices */
.page {
  padding-inline: max(var(--gutter), env(safe-area-inset-left),
                      env(safe-area-inset-right));
  padding-block-end: max(1rem, env(safe-area-inset-bottom));
}
```

## Landscape phone — the forgotten case

A phone in landscape is 812×375. It is wider than 640px but shorter than any tablet. Height-based queries handle it:

```css
@media (max-height: 500px) and (orientation: landscape) {
  .hero { min-height: auto; padding-block: 2rem; }
  .nav { position: static; }
}
```

## The width ladder — test at these

| Width | Represents |
|---|---|
| 320px | iPhone SE, smallest realistic |
| 375px | iPhone mini / standard |
| 414px | Large phone |
| 768px | Tablet portrait |
| 812px × 375px | Phone landscape |
| 1024px | Tablet landscape / small laptop |
| 1280px | Standard laptop |
| 1440px | Large laptop |
| 1920px | Desktop |
| 2560px | Ultrawide — verify the max-width caps |

At 2560px, content should be capped (`max-width: 1280px; margin-inline: auto`), not stretched. Full-bleed text at 2560px is unreadable.

## Self-check before reporting

- [ ] No horizontal scroll at 320px
- [ ] No horizontal scroll at 2560px
- [ ] Tested at all ten widths in the ladder
- [ ] Tested at 200% browser zoom
- [ ] Tested in landscape on a phone-sized viewport
- [ ] `min(280px, 100%)` used in every `minmax()` minimum
- [ ] `min-width: 0` on flex children that hold text
- [ ] `minmax(0, 1fr)` instead of bare `1fr` in grid
- [ ] Fluid type uses `clamp()`, never bare `vw`
- [ ] Hover effects behind `@media (hover: hover)`
- [ ] Touch targets ≥ 44px
- [ ] `maximum-scale` not present in the viewport meta
- [ ] Container queries used where a component's layout depends on its container
