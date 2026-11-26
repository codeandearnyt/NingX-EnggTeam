# Checklists

Copy-paste gates. If a box is unchecked, the work is not done.

## Before the first line of code

- [ ] Page purpose stated in one line: what, who, what they do next
- [ ] UI type chosen (01–24), reference site named
- [ ] At most one surface type, and where it applies
- [ ] Direction block written: palette, type, composition, largest thing
- [ ] Palette ≤ 3 colors, all named by role
- [ ] Contrast measured for every text/background pair
- [ ] Type pairing: two families, named, with fallback stack
- [ ] Rendering strategy decided (static / SSR / client) and why
- [ ] Performance budget written down
- [ ] Dependency list: nothing over 20KB gzipped without a justification

## Component

- [ ] Purpose in one sentence
- [ ] Props typed, no `any`, no optional-everything
- [ ] States: default, hover, focus, active, disabled, loading, error
- [ ] Keyboard reachable, focus visible
- [ ] Role and label correct
- [ ] Responsive at 320px and 2560px
- [ ] Zero raw color, space, or radius values — tokens only
- [ ] No `transition: all`
- [ ] Animation has a `prefers-reduced-motion` path
- [ ] Test covers behaviour, not implementation

## Page

- [ ] `ui-type:` comment naming both types
- [ ] One `<h1>`, heading levels ordered
- [ ] Semantic landmarks: `header`, `nav`, `main`, `footer`
- [ ] Skip link is the first focusable element
- [ ] Every list has four states: loading, error, empty, data
- [ ] Skeleton matches the real layout height
- [ ] Every image has `width`, `height`, `alt`
- [ ] Every input has a `<label for>`
- [ ] Every CTA says what happens
- [ ] At least one concrete number in the copy
- [ ] Zero banned marketing phrases
- [ ] Zero placeholder text, zero `href="#"`
- [ ] Metadata: unique title ≤ 60, description 120–155, canonical, OG 1200×630

## Responsive

- [ ] 320px — no horizontal scroll
- [ ] 375px
- [ ] 768px
- [ ] 812×375 landscape
- [ ] 1024px
- [ ] 1440px
- [ ] 1920px
- [ ] 2560px — content capped, not stretched
- [ ] 200% zoom — nothing clipped or overlapping
- [ ] Hover effects behind `@media (hover: hover)`
- [ ] Touch targets ≥ 44px

## Accessibility

- [ ] Body text ≥ 4.5:1, large text ≥ 3:1, borders ≥ 3:1
- [ ] Focus visible at every stop, never `outline: none` alone
- [ ] `<button>` for actions, `<a href>` for navigation
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative images `alt=""`, informative images described
- [ ] Errors use `role="alert"` and name the fix
- [ ] Modal traps focus, `Escape` closes, focus returns to trigger
- [ ] `prefers-reduced-motion` handled in CSS **and** JS
- [ ] Keyboard-only pass completed by hand
- [ ] axe reports zero critical

## Performance

- [ ] LCP ≤ 2.5s on mobile throttling
- [ ] LCP image preloaded, `fetchpriority="high"`, never lazy
- [ ] CLS ≤ 0.1
- [ ] INP ≤ 200ms
- [ ] TTFB ≤ 800ms
- [ ] Initial JS ≤ 170KB gzipped
- [ ] Initial CSS ≤ 50KB gzipped
- [ ] Fonts: swap, preloaded, subset, ≤ 2 families, ≤ 100KB
- [ ] No render-blocking script in `<head>`
- [ ] Only `transform` / `opacity` animate
- [ ] Numbers reported, not adjectives

## Backend

- [ ] Every endpoint has a written contract block
- [ ] Every input validated with a schema at the boundary
- [ ] Money is integer cents
- [ ] Every array capped with `.max()`
- [ ] Authorization scoped in the query, not checked after
- [ ] One error shape across every endpoint
- [ ] No stack trace reaches the client
- [ ] Multi-row writes in a transaction
- [ ] Every list paginates, cursor-based where data changes
- [ ] Migrations additive-first and reversible
- [ ] Env validated at boot
- [ ] No secret in a client-visible variable
- [ ] Rate limiting on auth and write paths
- [ ] Health and readiness endpoints

## Ship

- [ ] Mechanical grep suite returns zero hits
- [ ] Anti-slop review PASS (all 24)
- [ ] Accessibility PASS (axe + keyboard pass)
- [ ] Performance within budget
- [ ] Responsive PASS at all eight widths
- [ ] Reduced motion PASS
- [ ] Zero console errors or warnings
- [ ] Zero broken links, zero missing assets
- [ ] Verdict written with evidence, not adjectives
