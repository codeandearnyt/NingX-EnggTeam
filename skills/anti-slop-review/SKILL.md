---
name: anti-slop-review
description: Review a built page or component against the AI-default failure modes and return a pass/fail with specific fixes. Catches gradient-hero sameness, three-card feature rows, generic copy, dead spacing, unearned radius, and the rest of the templated look. Use on every page before reporting it done.
metadata:
  origin: ningx
  layer: craft
---

# Anti-Slop Review

AI-generated interfaces converge. Given no direction, they produce the same page: dark gradient hero, three identical feature cards, "Elevate your workflow," 12px radius, Inter, purple accent.

This skill is the audit that catches it. Run it on every page before saying done.

## The verdict format

```
ANTI-SLOP REVIEW — <page name>
Verdict: PASS | FAIL (<n> violations)

[V1] <what> — <where> — <fix>
[V2] ...
```

A single FAIL blocks the ship. There is no "mostly passing."

## The 24 checks

### Structure

**S1 — Is the UI type named?**
Every page declares one structural UI type (01–24) and at most one surface type. If the file has no comment naming them, fail.

```html
<!-- ui-type: 05-swiss-grid (structural) -->
<!-- ui-type: 13-aurora (surface, hero only) -->
```

**S2 — Are there exactly two UI types maximum?**
Three types on one page is mush. Count them. Name them.

**S3 — Does the page have a hierarchy, or just a stack?**
Read the headings alone. If every `h2` is the same size and weight, there is no hierarchy. Display → section → sub → body. Four levels minimum on a long page.

**S4 — Is the first viewport doing work?**
Above the fold must answer: what is this, who is it for, what do I do next. A hero that is only a headline and a gradient answers one of three.

### Color

**C1 — How many accents?**
One. Two maximum if one is a status color. Three is a carnival. Count them.

**C2 — Is any color unearned?**
Every color must map to a token with a role. A color that exists because it looked nice in the mock is unearned.

**C3 — Is the palette from a system or invented per-component?**
Grep the CSS. Hex literals inside component rules = fail.

**C4 — Is the gradient doing anything?**
A gradient with no light source, no depth, no function — just a purple-to-blue rectangle behind the headline — is the single most common AI tell. Delete it or justify it.

### Type

**T1 — Two families maximum.**
Display + body. A third only if mono is used for data.

**T2 — Is there a real type scale?**
At least four distinct sizes with a consistent ratio. If everything is 16/20/24, the scale is missing.

**T3 — Is body text between 15–18px?**
14px body on desktop is too small for long reading. 20px is too large. Check.

**T4 — Is the measure capped?**
Lines of body text over ~75 characters are unreadable. `max-width: 65ch` on paragraphs.

**T5 — Is anything centered that should not be?**
Centered body copy over two lines. Centered lists. Centered forms. Centering is a choice, not a default.

### Space

**Sp1 — Is the spacing on a scale?**
4/8/12/16/24/32/48/64/96. Arbitrary values like 13px or 37px mean no system.

**Sp2 — Is there enough space?**
Sections need 64–120px vertical. If section padding is 32px, the page reads cramped regardless of the design.

**Sp3 — Is the space doing work, or is it uniform?**
Equal gaps everywhere = no grouping. Related things closer, unrelated things farther. Space is the hierarchy.

### Shape

**Sh1 — Is every radius 12px?**
The universal AI default. Either a deliberate scale (4/8/16/24) or zero. All-12px means nobody chose.

**Sh2 — Is there a shadow on a surface that is not elevated?**
Shadows mean "above." A shadow on a flat section is decoration.

**Sh3 — Does the design have a distinctive silhouette?**
Squint. Can you recognize the page from the blurred shape alone? If it could be any SaaS page, the silhouette is generic.

### Content

**Co1 — Is the copy specific?**
"Elevate your workflow" / "Unlock your potential" / "The future of X" / "Built for teams that move fast" — all banned. Copy must name a concrete thing.

| Banned | Replace with |
|---|---|
| Elevate your workflow | Cuts deploy time from 12 minutes to 40 seconds |
| Unlock your potential | One invoice, one page, no spreadsheet |
| The future of X | X, but the parts that were slow are now instant |
| Seamless integration | Imports from Stripe in four clicks, no API key |
| Built for modern teams | Built for the four-person team that ships on Fridays |

**Co2 — Is there a number anywhere?**
Specificity is credibility. "Fast" is a claim. "42ms p99" is evidence. Every page should have at least one number.

**Co3 — Do the CTAs say what happens?**
"Get started" says nothing. "Create a store" / "Read the docs" / "See pricing" say what happens on click.

**Co4 — Is there placeholder text left?**
Lorem ipsum, "Company Name", "Your headline here", `<!-- TODO -->`, "Learn more" pointing at `#`. Any of these = fail.

### Motion

**M1 — Does motion have a purpose?**
Entrance animations on scroll that just fade things in are noise. Motion should explain state, indicate direction, or confirm an action.

**M2 — Is there a reduced-motion path?**
`@media (prefers-reduced-motion: reduce)` must exist if anything animates. Non-negotiable.

**M3 — Is the easing default?**
`ease` everywhere is the tell. A designed system uses 2–3 named curves.

### Craft

**Cr1 — Does it work at 320px?**
No horizontal scroll. Test it.

**Cr2 — Does it work at 2560px?**
Content capped, not stretched.

**Cr3 — Is the focus state visible?**
Tab through it. If focus disappears anywhere, fail.

**Cr4 — Are the images real?**
Placeholder grey boxes, unsplash landscape photos with no relationship to the product, or emoji standing in for icons — all fail.

## The three-card test

The most reliable slop detector:

> **Are there three identical cards in a row, each with an icon, a heading, and two lines of text?**

If yes, ask: do these three things genuinely have equal importance and equal shape? If the answer is not an immediate yes, the row is a default, not a decision.

Three-card rows are not banned — they are legitimate when the content is genuinely three equal things. They are a fail when they exist because the generator had nothing better.

## The squint test

Blur the page (or step back three metres). What do you see?

- A grey rectangle with a purple blob → generic
- Distinct blocks with varied weight → a real composition
- Everything the same density → no hierarchy

Run it on the screenshot, not the code.

## The copy sweep

Grep for these. Any hit is a fail:

```bash
grep -rniE 'elevate|unlock|seamless|empower|revolutioni|game.chang|cutting.edge|next.generation|state.of.the.art|leverage|synerg|holistic|best.in.class|world.class|future.of|reimagin|supercharge|effortless' src/
```

Every one of those words is a place the copy stopped thinking.

## The component audit

For each repeated component, ask:

1. Does every instance look identical when it should? (Bad — content varies, presentation should too)
2. Does every instance look identical when it should not? (Fine — that is a system)
3. Is the component used exactly twice? (A pattern that has not earned abstraction)
4. Is there a variant nobody uses? (Dead code)

## Verdict examples

```
ANTI-SLOP REVIEW — Pricing page
Verdict: FAIL (4 violations)

[C1] Three accents: purple CTA, teal badge, amber highlight — reduce to purple + one status
[C4] Purple-to-pink gradient behind hero has no light source or function — remove or ground it
[Sh1] Every card is border-radius: 12px — move to the 4/8/16 scale or go to 0
[Co1] "Elevate your billing workflow" — replace with "Close the month in one screen"
```

```
ANTI-SLOP REVIEW — Documentation index
Verdict: PASS

One accent (link blue), type scale at 12/14/16/20/32/48,
spacing on the 4px scale, zero shadows, radius 0.
Copy specific throughout. No placeholder text.
```

## What PASS actually requires

All 24 checks. Not "mostly." Not "the important ones."

The checks exist because each one is a failure mode observed repeatedly in generated output. Passing 20 of 24 means the page still has four of the tells.

## Self-check before reporting

- [ ] UI type named in a file comment
- [ ] Two UI types maximum
- [ ] Heading hierarchy has four distinct levels
- [ ] One accent color
- [ ] Zero hex literals in component CSS
- [ ] Two type families maximum
- [ ] Body text 15–18px
- [ ] Measure capped at 75ch
- [ ] Spacing on the 4px scale
- [ ] Section padding ≥ 64px
- [ ] Radius from a scale or zero
- [ ] Zero banned marketing phrases
- [ ] At least one concrete number
- [ ] Zero placeholder text
- [ ] `prefers-reduced-motion` present
- [ ] Works at 320px and 2560px
- [ ] Focus visible everywhere
- [ ] Squint test passes — the silhouette is recognizable
- [ ] Three-card row justified if present
- [ ] Verdict written in the format above
