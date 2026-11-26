---
name: ui-06-editorial-typographic
description: Build editorial and typographic UI where the page reads like a publication and type does the work of layout. Use for news, magazines, long-form content hubs, research publications, and any page where the reference standard is bloomberg.com and the headline is the product.
metadata:
  origin: ningx
  ui-type: 6
  reference: https://www.bloomberg.com
---

# UI Type 06 — Editorial / Typographic

The page reads like a publication. Type does the work that images and cards do elsewhere.

**Reference standard:** bloomberg.com

## When to reach for it

- Content volume is high and heterogeneous
- Headlines are the primary navigation
- The brand is authority, speed, and density
- Readers return daily and scan rather than browse

## The signature

1. **Display headline at 3–5× body size.** Not 1.5×. The ratio is the type.
2. **Kicker + headline + dek + meta** on every block. Four text roles, consistently applied.
3. **Dense multi-column grid with hairline rules.** Sections divided by 1px lines, not space.

## The four text roles

Every content block uses these, in this order, and nothing else:

```css
.kicker  { font: 700 11px/1 var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
.headline{ font: 400 clamp(1.5rem,3vw,2.75rem)/1.06 var(--font-display); letter-spacing: -.02em; }
.dek     { font: 400 1.0625rem/1.5 var(--font-body); color: var(--ink-soft); }
.meta    { font: 400 12px/1.4 var(--font-body); color: var(--muted); }
```

If a block lacks a kicker, it is not an editorial block. If two blocks have different headline sizes for the same importance, the hierarchy is broken.

## Tokens

```css
:root {
  --paper: #ffffff;
  --ink: #0a0a0a;
  --ink-soft: #3d3d3d;
  --muted: #767676;
  --rule: #dcdcdc;
  --accent: #d0021b;        /* one, used on kickers and links only */

  --font-display: "Tiempos Headline", Georgia, "Times New Roman", serif;
  --font-body: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;  /* for data only */

  --fs-display: clamp(2.25rem, 5vw, 4rem);
  --fs-lead: clamp(1.5rem, 3vw, 2.75rem);
  --fs-h2: 1.375rem;
  --fs-body: 1.0625rem;
  --fs-meta: 0.75rem;

  --max-w: 1280px;
  --gutter: clamp(1rem, 2vw, 1.75rem);
}
```

Two faces plus optional mono for numbers. Mono is for data tables and tickers only — never body copy.

## Anatomy

```
<header class="masthead">        publication name, oversized, rule below
<nav class="sections">           horizontal list, uppercase, tracked
<main>
  <section class="lead">         one story: kicker, 4rem headline, dek, byline, image
  <section class="river">        3-col grid of secondary stories
    <article>                    kicker, h2, dek, meta
  <section class="data">        table or stat block using mono
</main>
<footer>                         dense link columns, small type
```

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Ledger — markets, policy, and the money between</title>
<style>
  :root{
    --paper:#fff; --ink:#0a0a0a; --ink-soft:#3d3d3d; --muted:#767676;
    --rule:#dcdcdc; --accent:#d0021b;
    --font-display:Georgia,"Times New Roman",serif;
    --font-body:system-ui,-apple-system,"Segoe UI",sans-serif;
    --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
    --fs-display:clamp(2.25rem,5vw,4rem);
    --fs-lead:clamp(1.5rem,3vw,2.75rem);
    --fs-h2:1.375rem; --fs-body:1.0625rem; --fs-meta:.75rem;
    --max-w:1280px; --gutter:clamp(1rem,2vw,1.75rem);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font:var(--fs-body)/1.6 var(--font-body);-webkit-font-smoothing:antialiased}
  .wrap{max-width:var(--max-w);margin:0 auto;padding:0 var(--gutter)}

  /* masthead */
  .masthead{border-bottom:3px solid var(--ink);padding:1.5rem 0 1rem}
  .masthead .wrap{display:flex;align-items:flex-end;justify-content:space-between;gap:2rem}
  .brand{font-family:var(--font-display);font-size:clamp(1.75rem,3vw,2.5rem);
         font-weight:700;letter-spacing:-.02em;text-decoration:none;color:inherit;line-height:1}
  .masthead time{font-size:var(--fs-meta);color:var(--muted);
                 text-transform:uppercase;letter-spacing:.1em}

  .sections{border-bottom:1px solid var(--rule)}
  .sections ul{display:flex;gap:1.75rem;list-style:none;margin:0;padding:.875rem 0;
               overflow-x:auto;font-size:var(--fs-meta);font-weight:700;
               letter-spacing:.12em;text-transform:uppercase}
  .sections a{color:var(--ink);text-decoration:none;white-space:nowrap}
  .sections a[aria-current]{color:var(--accent)}

  /* text roles */
  .kicker{display:block;font:700 11px/1 var(--font-body);letter-spacing:.12em;
          text-transform:uppercase;color:var(--accent);margin-bottom:.75rem}
  .headline{font-family:var(--font-display);font-weight:400;letter-spacing:-.02em;
            line-height:1.06;margin:0 0 1rem}
  h1.headline{font-size:var(--fs-display)}
  h2.headline{font-size:var(--fs-h2);line-height:1.2}
  h3.headline{font-size:1.0625rem;line-height:1.3;font-weight:600;font-family:var(--font-body);letter-spacing:0}
  .dek{font-size:1.0625rem;line-height:1.5;color:var(--ink-soft);margin:0 0 1rem;max-width:60ch}
  .meta{font-size:var(--fs-meta);color:var(--muted);text-transform:uppercase;
        letter-spacing:.06em}

  /* lead story */
  .lead{padding:2.5rem 0;border-bottom:1px solid var(--rule)}
  .lead .wrap{display:grid;grid-template-columns:1.4fr 1fr;gap:2.5rem;align-items:start}
  .lead .headline{font-size:var(--fs-display)}
  .lead figure{margin:0}
  .lead img{display:block;width:100%;height:auto}

  /* river */
  .river{padding:2.5rem 0}
  .river .wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem 1.75rem}
  .story{border-top:1px solid var(--rule);padding-top:1rem}
  .story h2{margin-bottom:.625rem}
  .story p.dek{font-size:.9375rem;line-height:1.5}
  .story a{color:inherit;text-decoration:none}
  .story a:hover .headline{text-decoration:underline;text-underline-offset:3px}

  /* data */
  .data{padding:2.5rem 0;border-top:3px solid var(--ink)}
  .data h2{font-family:var(--font-body);font-size:var(--fs-meta);font-weight:700;
           letter-spacing:.14em;text-transform:uppercase;margin:0 0 1.25rem}
  table{width:100%;border-collapse:collapse;font-family:var(--font-mono);font-size:.875rem}
  th{text-align:left;font-weight:600;color:var(--muted);text-transform:uppercase;
     font-size:.6875rem;letter-spacing:.1em;padding:.5rem 0;border-bottom:1px solid var(--rule)}
  td{padding:.625rem 0;border-bottom:1px solid var(--rule)}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  .up{color:#0a7f3f} .down{color:var(--accent)}

  a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

  @media (max-width:900px){
    .lead .wrap{grid-template-columns:1fr}
    .river .wrap{grid-template-columns:1fr}
  }
</style>
</head>
<body>

<header class="masthead">
  <div class="wrap">
    <a class="brand" href="/">The Ledger</a>
    <time datetime="2026-11-27">Thursday, 27 November 2026</time>
  </div>
</header>

<nav class="sections" aria-label="Sections">
  <div class="wrap">
    <ul>
      <li><a href="/markets" aria-current="page">Markets</a></li>
      <li><a href="/policy">Policy</a></li>
      <li><a href="/companies">Companies</a></li>
      <li><a href="/data">Data</a></li>
      <li><a href="/opinion">Opinion</a></li>
    </ul>
  </div>
</nav>

<main>

  <section class="lead">
    <div class="wrap">
      <article>
        <span class="kicker">Rates</span>
        <h1 class="headline">The long bond has stopped listening to the central bank</h1>
        <p class="dek">Thirty-year yields have risen for nine straight sessions while policy rates held. Traders say the term premium is repricing faster than the committee can respond.</p>
        <p class="meta">By A. Okonkwo · 27 Nov 2026 · 8 min read</p>
      </article>
      <figure>
        <img src="/img/yield-curve.png" width="900" height="600"
             alt="Chart of thirty-year Treasury yield rising from 4.1 to 4.8 percent over nine sessions">
      </figure>
    </div>
  </section>

  <section class="river">
    <div class="wrap">
      <article class="story">
        <span class="kicker">Companies</span>
        <h2 class="headline"><a href="#">Container shipping rates fall for the first time in eleven weeks</a></h2>
        <p class="dek">Spot rates on the Asia–Europe route dropped 6% as new capacity entered service ahead of schedule.</p>
        <p class="meta">3 hours ago</p>
      </article>
      <article class="story">
        <span class="kicker">Policy</span>
        <h2 class="headline"><a href="#">Regulator opens review of index inclusion rules</a></h2>
        <p class="dek">The review follows complaints that passive funds are forced to buy at the open, moving prices against their own holders.</p>
        <p class="meta">5 hours ago</p>
      </article>
      <article class="story">
        <span class="kicker">Opinion</span>
        <h2 class="headline"><a href="#">The term premium was never dead, only asleep</a></h2>
        <p class="dek">A decade of quantitative easing taught a generation of investors to ignore duration risk. That lesson is being unlearned.</p>
        <p class="meta">Yesterday</p>
      </article>
    </div>
  </section>

  <section class="data">
    <div class="wrap">
      <h2>Benchmark yields</h2>
      <table>
        <caption class="meta" style="text-align:left;padding-bottom:.75rem">US Treasuries, percent, 4pm ET</caption>
        <thead>
          <tr><th scope="col">Tenor</th><th scope="col" class="num">Yield</th><th scope="col" class="num">Change</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">2-year</th><td class="num">4.12</td><td class="num down">−0.03</td></tr>
          <tr><th scope="row">10-year</th><td class="num">4.58</td><td class="num up">+0.06</td></tr>
          <tr><th scope="row">30-year</th><td class="num">4.81</td><td class="num up">+0.09</td></tr>
        </tbody>
      </table>
    </div>
  </section>

</main>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use one type size for all headlines | The 3–5× display ratio is the type |
| Skip the kicker | Editorial blocks are four roles, not three |
| Use a neutral sans for headlines | The display face carries authority |
| Add card shadows and radius | Rules and space separate; boxes do not |
| Use body text above 18px | Density is the point |
| Center the headline | Publications are left-aligned |
| Use images as the primary hierarchy | Type leads; images support |
| Use mono for body copy | Mono is for data only |

## Responsive

- Lead story goes single column below 900px, image below text
- River goes 2-col at 900px, 1-col at 640px
- Section nav scrolls horizontally rather than collapsing to a menu
- Display headline floor at 2.25rem — below that it stops reading as editorial

## Accessibility notes

- Headline links: the whole `<h2>` should be the link target, not a "read more" appended after
- `aria-current="page"` on the active section
- Tables need `<caption>` and `scope`
- Don't rely on red/green for the change column — the +/− sign carries it
- Kicker color `--accent` on white must hit 4.5:1; `#d0021b` does at 11px bold

## Self-check before reporting

- [ ] Display headline is at least 3× body size
- [ ] Every content block has kicker, headline, dek, meta
- [ ] Sections separated by 1px rules, not background changes
- [ ] Two typefaces plus optional mono for data
- [ ] Data tables use `<caption>` and `scope`
- [ ] Zero box-shadows, zero border-radius above 2px
- [ ] Left-aligned throughout
- [ ] Sign (+/−) present on every change value, not color alone
