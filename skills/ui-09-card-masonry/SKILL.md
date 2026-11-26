---
name: ui-09-card-masonry
description: Build card-based and masonry UI where content tiles of variable height pack into balanced columns. Use for image feeds, inspiration boards, marketplaces, portfolios, and any page where the reference standard is pinterest.com and a uniform grid would flatten the content.
metadata:
  origin: ningx
  ui-type: 9
  reference: https://www.pinterest.com
---

# UI Type 09 — Card-Based & Masonry

Content as discrete tiles of varying height, packed into balanced columns.

**Reference standard:** pinterest.com

## When to reach for it

- Items have naturally different heights (images, snippets, mixed media)
- Volume is high and the user scans rather than reads
- The set is heterogeneous
- Browsing is the primary interaction

## Grid vs masonry — pick correctly

| | Grid | Masonry |
|---|---|---|
| Card heights | Equal | Varies with content |
| Alignment | Rows align | Columns align, rows do not |
| Works when | Content is uniform | Content is heterogeneous |
| CSS | `grid-template-columns: repeat(auto-fill, minmax(...))` | `columns` or JS packing |

If your cards are all the same height, you want a grid. Calling it masonry does not make it masonry.

## Two implementations

**CSS columns** — simplest, but fills column-by-column (order goes down then across). Acceptable for feeds where order is loose.

```css
.masonry {
  columns: 4 260px;          /* max 4 columns, min 260px each */
  column-gap: 16px;
}
.masonry > * {
  break-inside: avoid;
  margin-bottom: 16px;
}
```

**CSS grid with row-span** — preserves reading order, needs a known row unit.

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-auto-rows: 8px;        /* fine unit */
  gap: 16px;
}
.masonry > * { grid-row: span var(--rows); }  /* set --rows from JS: ceil(height/8) */
```

Use columns unless order matters. Use row-span when it does.

## Tokens

```css
:root {
  --paper: #ffffff;
  --ink: #111111;
  --ink-soft: #5f5f5f;
  --muted: #8e8e8e;
  --surface: #efefef;
  --radius: 16px;

  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
  --fs-body: 0.9375rem;
  --fs-meta: 0.8125rem;

  --gap: 16px;
  --max-w: 1600px;
}
```

Masonry palettes are near-neutral. The content supplies the color.

## Anatomy

```
<div class="masonry">
  <article class="card">
    <a class="card__link">           whole card is one link
      <img>                          explicit width/height OR aspect-ratio
      <div class="card__body">       title + meta, only if there is text
    </a>
  </article>
</div>
```

No card chrome beyond radius. No borders. No shadows unless hover.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Board — things worth keeping</title>
<style>
  :root{
    --paper:#fff; --ink:#111; --ink-soft:#5f5f5f; --muted:#8e8e8e; --surface:#efefef;
    --radius:16px;
    --font-body:system-ui,-apple-system,"Segoe UI",sans-serif;
    --fs-body:.9375rem; --fs-meta:.8125rem;
    --gap:16px; --max-w:1600px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font:var(--fs-body)/1.5 var(--font-body);-webkit-font-smoothing:antialiased}

  .wrap{max-width:var(--max-w);margin:0 auto;padding:0 clamp(1rem,3vw,2rem)}

  header{position:sticky;top:0;z-index:10;background:var(--paper);
         border-bottom:1px solid #e5e5e5}
  .nav{display:flex;align-items:center;gap:1.25rem;padding:.875rem 0}
  .brand{font-weight:700;font-size:1.125rem;text-decoration:none;color:inherit;letter-spacing:-.02em}
  .search{flex:1;max-width:520px;position:relative}
  .search input{
    width:100%;height:44px;padding:0 1rem 0 2.5rem;border:0;border-radius:999px;
    background:var(--surface);font:inherit;color:inherit;
  }
  .search input::placeholder{color:var(--muted)}
  .search svg{position:absolute;left:.875rem;top:50%;transform:translateY(-50%);
              width:18px;height:18px;stroke:var(--muted);fill:none;stroke-width:2}
  .avatar{width:36px;height:36px;border-radius:50%;background:var(--surface);
          display:grid;place-items:center;font-size:.75rem;font-weight:600;color:var(--ink-soft)}

  /* ---- masonry ---- */
  .masonry{columns:5 240px;column-gap:var(--gap);padding:1.5rem 0 4rem}
  .card{break-inside:avoid;margin:0 0 var(--gap)}
  .card__link{
    display:block;border-radius:var(--radius);overflow:hidden;
    text-decoration:none;color:inherit;position:relative;
    background:var(--surface);
    transition:transform 160ms ease,box-shadow 160ms ease;
  }
  .card__link:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgb(0 0 0 / .12)}
  .card__link:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
  .card img{display:block;width:100%;height:auto}
  .card__body{padding:.75rem .875rem 1rem}
  .card__body h2{font-size:.9375rem;font-weight:600;line-height:1.35;margin:0 0 .25rem}
  .card__body p{margin:0;font-size:var(--fs-meta);color:var(--muted)}

  .overlay{
    position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:space-between;
    gap:.5rem;padding:.875rem;color:#fff;
    background:linear-gradient(to top,rgb(0 0 0 / .55),transparent 55%);
    opacity:0;transition:opacity 160ms ease;
  }
  .card__link:hover .overlay,.card__link:focus-visible .overlay{opacity:1}
  .overlay span{font-size:var(--fs-meta);font-weight:600}

  @media (max-width:640px){
    .masonry{columns:2 160px}
    .overlay{display:none}
  }
  @media (prefers-reduced-motion:reduce){
    .card__link{transition:none}
    .card__link:hover{transform:none}
    .overlay{transition:none}
  }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <nav class="nav" aria-label="Main">
      <a class="brand" href="/">Board</a>
      <div class="search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
        <input type="search" placeholder="Search" aria-label="Search boards">
      </div>
      <div class="avatar" aria-hidden="true">AM</div>
    </nav>
  </div>
</header>

<main class="wrap">
  <div class="masonry">

    <article class="card">
      <a class="card__link" href="#">
        <img src="/img/a.jpg" width="600" height="900" alt="Concrete stairwell lit from a single skylight" loading="lazy">
        <div class="overlay"><span>Brutalist interiors</span><span>1.2k</span></div>
      </a>
    </article>

    <article class="card">
      <a class="card__link" href="#">
        <img src="/img/b.jpg" width="600" height="420" alt="A handwritten type specimen sheet" loading="lazy">
        <div class="overlay"><span>Type specimens</span><span>840</span></div>
      </a>
    </article>

    <article class="card">
      <a class="card__link" href="#">
        <img src="/img/c.jpg" width="600" height="760" alt="A long wooden table in an empty workshop" loading="lazy">
        <div class="card__body">
          <h2>Workshop lighting, north-facing only</h2>
          <p>Furniture · 2 days ago</p>
        </div>
      </a>
    </article>

    <article class="card">
      <a class="card__link" href="#">
        <img src="/img/d.jpg" width="600" height="340" alt="Grid of colour swatches pinned to a wall" loading="lazy">
        <div class="overlay"><span>Palettes</span><span>3.4k</span></div>
      </a>
    </article>

    <!-- repeat cards with varied aspect ratios -->

  </div>
</main>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Force equal card heights | That is a grid — masonry requires variation |
| Use uneven column gaps | Columns must be visually equal width |
| Add borders to every card | Radius and whitespace only |
| Fixed-height image containers with `object-fit: cover` everywhere | Kills the height variation that makes masonry work |
| Lazy-load without dimensions | Causes layout shift *and* masonry reflow jank |
| Put 5 lines of body text in a card | Cards are scannable units |
| Use `columns` when order matters | Column fill order is down-then-across |
| Animate cards in on scroll | Feeds scroll fast; entrance animations stutter |

## The CLS problem

Masonry is the highest-CLS layout on this list because every image changes the column height when it loads.

Fix, in order:

1. **Set `width` and `height` attributes on every `<img>`** — the browser reserves the box.
2. **Or use `aspect-ratio`** on the wrapper if dimensions are unknown.
3. **Never lazy-load the first viewport.**
4. If using row-span grid, reserve rows from known aspect ratios before images load.

A masonry page with CLS above 0.1 is a failed build regardless of how it looks.

## Responsive

- 5 columns → 4 → 3 → 2 as width drops
- Below 640px, 2 columns at 160px minimum
- Never 1 column — that is a list, not masonry

## Accessibility notes

- The whole card is one `<a>` — do not nest interactive elements inside it
- `alt` text is mandatory; these are content images
- The hover overlay must not contain the only copy of information — duplicate it in the DOM or the card body
- `loading="lazy"` on everything except the first viewport

## Self-check before reporting

- [ ] Card heights genuinely vary
- [ ] Every image has `width`, `height` (or wrapper `aspect-ratio`)
- [ ] CLS measured, under 0.1
- [ ] Column gaps equal
- [ ] No borders on cards
- [ ] Whole card is a single link, no nested interactives
- [ ] `alt` on every image
- [ ] First viewport not lazy-loaded
