---
name: ui-01-terminal-cli
description: Build text-only terminal/CLI-style web UI where information density is the aesthetic. Use for news lists, changelogs, docs indexes, hacker-tool landing pages, or any page where the reference standard is ycombinator.com and decoration would be a downgrade.
metadata:
  origin: ningx
  ui-type: 1
  reference: https://news.ycombinator.com
---

# UI Type 01 — Text-Only / Terminal (CLI)

Dense monospace text. No images. No shadows. No cards. The list is the design.

**Reference standard:** ycombinator.com

## When to reach for it

- Content is a ranked or chronological list
- The reader is technical and scanning, not reading
- Load time matters more than brand impression
- The product's honesty is part of its appeal

Do not reach for it when the page must persuade a non-technical buyer. This type does not sell.

## The signature

Three things make this type work, and removing any one of them collapses it:

1. **Monospace or system font, small size.** 13–15px body. Never 16px+.
2. **Left-aligned rows with a numeric or symbol gutter.** The rank/prefix column is fixed-width.
3. **Underlined links as the only affordance.** No buttons. No pills. No hover backgrounds.

Everything else is optional. Those three are not.

## Tokens

```css
:root {
  --bg: #ffffff;
  --fg: #000000;
  --fg-muted: #828282;
  --link: #0000ee;
  --link-visited: #551a8b;
  --rule: #e0e0e0;

  --font: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
  --fs-body: 13px;
  --fs-meta: 11px;
  --lh: 1.45;

  --row-gap: 3px;
  --gutter: 32px;
  --max-w: 85ch;
}
```

Dark variant swaps `--bg: #111`, `--fg: #ddd`, `--link: #9ecbff`. That is the entire dark theme — do not add more.

## Anatomy

```
<main>                        max-width, centered or left-anchored
  <header>                    one line: site name + nav links, separated by |
  <ol class="rows">           the list — ordered because rank is meaningful
    <li class="row">
      <span class="rank">1.</span>
      <div class="body">
        <a class="title">...</a>
        <span class="domain">(example.com)</span>
        <div class="meta">42 points by user 3 hours ago | 18 comments</div>
      </div>
    </li>
  </ol>
  <footer>                    one line: pagination + about
</main>
```

No wrapper divs beyond what the grid needs. No section elements unless there are genuinely distinct sections.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Index</title>
<style>
  :root {
    --bg:#fff; --fg:#000; --muted:#828282; --link:#0000ee; --rule:#e0e0e0;
    --font: ui-monospace,"SF Mono","Cascadia Mono",Menlo,Consolas,monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#111; --fg:#ddd; --muted:#777; --link:#9ecbff; --rule:#2a2a2a; }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 12px;
    background: var(--bg); color: var(--fg);
    font: 13px/1.45 var(--font);
  }
  main { max-width: 85ch; margin: 0 auto; }
  header {
    border-bottom: 1px solid var(--rule);
    padding-bottom: 6px; margin-bottom: 8px;
    font-size: 13px;
  }
  header a { color: var(--fg); text-decoration: none; font-weight: 700; }
  header nav { display: inline; margin-left: 8px; color: var(--muted); }
  header nav a { font-weight: 400; color: var(--link); text-decoration: underline; }
  ol.rows { list-style: none; margin: 0; padding: 0; }
  .row {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 0 4px;
    padding: 2px 0;
    align-items: baseline;
  }
  .rank { color: var(--muted); text-align: right; font-size: 13px; }
  .title { color: var(--link); text-decoration: underline; }
  .title:visited { color: var(--link); }
  .domain { color: var(--muted); font-size: 11px; margin-left: 4px; }
  .meta { color: var(--muted); font-size: 11px; }
  .meta a { color: var(--muted); text-decoration: underline; }
  footer {
    border-top: 1px solid var(--rule);
    margin-top: 10px; padding-top: 6px;
    font-size: 11px; color: var(--muted);
  }
  a:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }
</style>
</head>
<body>
<main>
  <header>
    <a href="/">Index</a>
    <nav>| <a href="/new">new</a> | <a href="/past">past</a> | <a href="/about">about</a></nav>
  </header>

  <ol class="rows">
    <li class="row">
      <span class="rank">1.</span>
      <div class="body">
        <a class="title" href="#">A title that states the claim, not the topic</a>
        <span class="domain">(example.com)</span>
        <div class="meta">142 points by <a href="#">author</a> 3 hours ago | <a href="#">27&nbsp;comments</a></div>
      </div>
    </li>
    <!-- repeat .row -->
  </ol>

  <footer>1–30 of 412 | <a href="#">more</a></footer>
</main>
</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Add a card with border-radius and shadow | The list is the design. Cards fragment density. |
| Use a sans-serif body face | Loses the terminal lineage; reads as a blog |
| Center the text | Terminal output is left-aligned |
| Add a hero section | There is no hero. The first row is the hero. |
| Use icons | Text labels only |
| Generous padding | Density is the point. 2–4px row padding. |
| Add hover background on rows | Underline is the affordance |
| Load a webfont | System/mono stack only. Zero font requests. |

## Responsive

Below 600px the rank gutter shrinks to 24px and the domain drops to the meta line. Do not collapse the row into a card — that is a different type.

## Performance budget

- Total page weight under 40KB
- Zero webfonts
- Zero images above the fold
- First paint under 400ms on 3G

This type is the fastest on the list. If yours is slow, you added something.

## Self-check before reporting

- [ ] Monospace or system font only
- [ ] No hex colors outside `:root`
- [ ] Every link underlined, including visited state distinguishable
- [ ] Rows use a fixed-width rank gutter
- [ ] No border-radius, no box-shadow, no gradient anywhere
- [ ] Focus-visible ring present
- [ ] Page weight measured and under 40KB

If any box is unchecked, it is not this type yet.
