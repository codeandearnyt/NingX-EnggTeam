---
description: Build a complete page at the reference-site bar — picks the UI type, writes the direction block, builds it, audits it, reports numbers.
argument-hint: <page description, e.g. "pricing page for a dev tool, 3 tiers">
---

# /build-page

Build one page properly. Not a scaffold, not a starting point — a page that would survive a design review at the reference site for its type.

## Step 1 — Read the brief

Restate the page in one line: what it is, who it is for, what the visitor does.

If the brief does not answer those three, assume the most likely reading and state the assumption in one line. Do not ask.

## Step 2 — Pick the UI type

Load `DESIGN-LAW.md`. Answer the two questions:

1. **What is the content?** Sparse and expensive → 05. Dense and heterogeneous → 06. Visual and varied → 09. Unequal-weight features → 10. A sequence → 21. An object → 22. A place → 24.
2. **What does the brand need to say?** Confidence → 05. Authority → 06. Warmth → 07 or 17. Volume → 08. Calm → 04. Precision → 12. Atmosphere → 13.

If they conflict, the content wins.

Load the matching `skills/ui-NN-*/SKILL.md`. Read the signature, the tokens, the anatomy, the scaffold.

**Two types maximum.** One structural, one surface. Name both in a file comment.

## Step 3 — Write the direction block

Before markup:

```
PAGE: /<route>
UI type: <NN>-<slug> (structural) — <why>
Surface: <NN>-<slug> — <where, and why>
Reference: <site>

Palette
  <role>  <value>  <what it is for>

Type
  <family> <role> <size>/<line-height>
  <family> <role> <size>/<line-height>

Composition
  Largest thing: <element>
  Sticky: <element or none>
  Rejected: <type> (<why>)
```

The palette is two or three colors with roles. One accent. Contrast measured, not assumed.

## Step 4 — Build

- Tokens first. `tokens.css` holds every raw value. Components read `var(--…)` only.
- Structure: semantic landmarks, one `<h1>`, ordered headings.
- Every list gets four states: loading, error, empty, data.
- Every image gets `width`, `height`, `alt`.
- Every interactive element is `<button>` or `<a href>`.
- Animation only `transform` / `opacity`, with a `prefers-reduced-motion` path.
- Copy names concrete things. At least one number.

## Step 5 — Audit

Run `skills/anti-slop-review/SKILL.md` over the result. Twenty-four checks. Write the verdict.

Then:

```bash
npx lighthouse http://localhost:3000 --form-factor=mobile \
  --throttling-method=simulate --only-categories=performance,accessibility --view
```

## Step 6 — Report

```
PAGE: /<route>
UI type: <NN> (structural) + <NN> (surface)
Anti-slop: PASS
LCP 1.4s · CLS 0.01 · INP 70ms · JS 88KB gz
Widths checked: 320 / 768 / 1440 / 2560
Keyboard: pass · Reduced motion: pass
Files: <list>
```

Numbers, not adjectives. A caveated PASS is a FAIL.
