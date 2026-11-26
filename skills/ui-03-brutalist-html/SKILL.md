---
name: ui-03-brutalist-html
description: Build brutalist HTML UI using browser defaults deliberately, with zero aesthetic CSS. Use for legal pages, investor relations, plain-text-first products, documentation, or any page where the reference standard is berkshirehathaway.com and polish would be a lie.
metadata:
  origin: ningx
  ui-type: 3
  reference: https://www.berkshirehathaway.com
---

# UI Type 03 — Brutalist HTML

The browser's defaults, left alone. Brutalism here is an **absence**, not a style.

**Reference standard:** berkshirehathaway.com

## The distinction that matters

There are two things called brutalist on the web:

1. **Neobrutalism** (type 08) — thick borders, hard shadows, loud color. That is a *style*.
2. **Brutalist HTML** (this one) — no style at all. That is a *refusal*.

If you write `border: 2px solid black` on a button, you are doing 08, not 03. Go load `ui-08-neobrutalism`.

## When to reach for it

- The content is a document, not a product
- The audience values substance over presentation and will notice fakery
- Longevity matters — this page will look the same in 2040
- Legal, financial, archival, or standards material
- You want to prove you have nothing to hide

## The signature

1. **System font stack.** Times or the UA default serif. No webfont.
2. **Default link styling.** Blue, underlined, visited purple. Do not touch it.
3. **Zero layout CSS.** No flex, no grid, no max-width wrapper, no padding utilities.

The only permitted CSS is a `<style>` block that contains nothing. If you need a `<style>` tag, ask whether you need it.

## What is actually allowed

- Semantic HTML
- `<table>` with `border` attribute for tabular data (yes, the attribute)
- `<hr>` for separation
- `<ul>`/`<ol>` with default markers
- `<h1>`–`<h3>` with default sizing
- `<a>` with default styling
- `<img>` at natural size
- `<meta name="viewport">` — this one is allowed, mobile needs it

That is the whole vocabulary.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acme Holdings — Investor Relations</title>
<meta name="description" content="Annual reports, filings, and shareholder letters.">
</head>
<body>

<h1>Acme Holdings, Inc.</h1>

<p>Annual reports, SEC filings, and shareholder letters.</p>

<hr>

<h2>Annual Reports</h2>
<ul>
  <li><a href="/ar/2025.pdf">2025 Annual Report</a> (PDF, 2.4 MB)</li>
  <li><a href="/ar/2024.pdf">2024 Annual Report</a> (PDF, 2.1 MB)</li>
  <li><a href="/ar/2023.pdf">2023 Annual Report</a> (PDF, 1.9 MB)</li>
</ul>

<h2>Shareholder Letters</h2>
<ul>
  <li><a href="/letters/2025.html">2025 Letter to Shareholders</a></li>
  <li><a href="/letters/2024.html">2024 Letter to Shareholders</a></li>
</ul>

<h2>Quarterly Results</h2>
<table border="1" cellpadding="6" cellspacing="0">
  <caption>Revenue and operating income, USD millions</caption>
  <thead>
    <tr>
      <th scope="col">Quarter</th>
      <th scope="col">Revenue</th>
      <th scope="col">Operating income</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Q4 2025</th><td>1,284</td><td>412</td></tr>
    <tr><th scope="row">Q3 2025</th><td>1,201</td><td>388</td></tr>
    <tr><th scope="row">Q2 2025</th><td>1,150</td><td>361</td></tr>
  </tbody>
</table>

<hr>

<h2>Contact</h2>
<p>
  Investor Relations<br>
  1 Example Plaza, Suite 400<br>
  Omaha, NE 68102<br>
  <a href="mailto:ir@example.com">ir@example.com</a>
</p>

<hr>

<p><small>Last updated 2026-11-27. This page contains forward-looking statements.</small></p>

</body>
</html>
```

That is a complete, shippable brutalist page. Note there is no `<style>` element.

## The one concession

If the content is genuinely unreadable at full viewport width — long paragraphs on an ultrawide monitor — you may add **one** rule:

```html
<style>
  body { max-width: 46rem; margin: 0 auto; padding: 1rem; }
</style>
```

That is the entire budget. One rule. Not two. If you are writing a second rule, you have started designing.

## Anti-patterns

| Don't | Why |
|---|---|
| Add a webfont | The system stack is the point |
| Reset margins | Default margins are the rhythm |
| Add a nav bar with flexbox | A `<ul>` of links is a nav |
| Use CSS variables | There are no design tokens because there is no design layer |
| Add a dark mode | The UA handles it, or it does not |
| Add hover effects | Default link behavior is the interaction |
| Add a cookie banner with a card | Use a `<p>` |
| Use `border-radius` anywhere | Immediate disqualification |

## Accessibility

Brutalist HTML is often *more* accessible than designed pages because defaults carry semantics. Preserve them:

- Heading order sequential, one `<h1>`
- `<table>` has `<caption>` and `scope` attributes
- `<th scope="row">` on row headers
- Links describe destination, not "click here"
- `lang` on `<html>`
- `alt` on images — the only attribute you must remember to add

## Performance

This type should be the fastest page on the internet.

- Under 10KB total
- Zero requests beyond the HTML document
- No JS
- LCP is the `<h1>` text — effectively instant

If a brutalist page loads in over 200ms, something is wrong with the server, not the page.

## When NOT to use it

- The product must convert a cold buyer
- The brand is the product
- The audience is non-technical and will read it as broken
- You are being asked to "make it look professional"

In those cases, `ui-ux-director` picks a different type and says why.

## Self-check before reporting

- [ ] Zero `<style>` elements, or exactly one max-width rule
- [ ] No CSS framework, no reset, no normalize
- [ ] Default link colors preserved
- [ ] Tables use `<caption>` and `scope`
- [ ] `lang` set on `<html>`
- [ ] All images have `alt`
- [ ] Page weight measured, under 10KB
- [ ] No `border-radius` anywhere in the file

If you added a shadow, a radius, or a color, this is not type 03.
