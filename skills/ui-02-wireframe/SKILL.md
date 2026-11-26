---
name: ui-02-wireframe
description: Build deliberately low-fidelity wireframe UI where structure is proven before styling. Use for IA proposals, stakeholder alignment decks, UX specs, and any page where showing polished visuals would invite the wrong conversation.
metadata:
  origin: ningx
  ui-type: 2
  reference: https://balsamiq.com
---

# UI Type 02 — Wireframe / Low-Fidelity

The page admits it is unfinished. Fidelity above ~30% defeats the entire purpose.

**Reference standard:** balsamiq.com

## When to reach for it

- The conversation is about *structure*, not appearance
- Stakeholders will argue about color if you give them color
- You need sign-off before spending on design
- The deliverable is a spec, not a site

Never ship this as a production page unless the product *is* wireframing software.

## The signature

1. **Rough geometry.** Borders are 1.5–2px, slightly irregular. Corners are hand-drawn-ish.
2. **Grey blocks with an X for media.** Images are never real.
3. **Everything is annotated.** Each region carries a plain-text label stating its job.

Remove any of the three and it stops being a wireframe.

## The hand-drawn line

You do not need an SVG filter stack. One `border-radius` trick plus a slight rotation reads as "sketched" at small sizes:

```css
.sketch {
  border: 2px solid #333;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
}
```

That asymmetric radius set is the whole illusion. Use it on every box. Vary it by swapping the numbers between two or three variants so boxes do not look identical.

## Tokens

```css
:root {
  --paper: #fdfdfb;
  --ink: #2b2b2b;
  --ink-light: #9a9a9a;
  --fill: #ececec;
  --fill-strong: #d8d8d8;
  --note: #fff9c4;      /* sticky-note yellow for annotations */
  --font: "Comic Sans MS", "Segoe Print", "Bradley Hand", cursive;
  --font-ui: ui-monospace, monospace;
  --fs: 15px;
}
```

Two faces: a handwritten one for labels, a mono one for annotations. That contrast is what makes it read as a working document rather than a joke.

If Comic Sans is unacceptable in your context, use `ui-rounded` with a 1.5px letter-spacing and accept a slightly cleaner sketch.

## Anatomy

```
<header>        logo placeholder + nav placeholders
<main>
  <section>     each section is a bordered sketch box with a label tag
    <figure>    image placeholder: grey box, X through it, caption
    <div>       text placeholder: 3 grey bars of decreasing width
    <button>    sketch button with label
  </section>
</main>
<aside>         annotation column or sticky notes
```

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wireframe — Homepage</title>
<style>
  :root{
    --paper:#fdfdfb; --ink:#2b2b2b; --ink-light:#9a9a9a;
    --fill:#ececec; --fill-strong:#d8d8d8; --note:#fff9c4;
    --font:"Comic Sans MS","Segoe Print","Bradley Hand",cursive;
    --font-ui:ui-monospace,monospace;
  }
  *{box-sizing:border-box}
  body{
    margin:0;padding:32px;background:var(--paper);color:var(--ink);
    font:15px/1.5 var(--font);
    background-image:radial-gradient(#00000008 1px,transparent 1px);
    background-size:16px 16px;
  }
  .sketch{border:2px solid var(--ink);border-radius:255px 15px 225px 15px/15px 225px 15px 255px;padding:16px}
  .sketch--alt{border-radius:15px 225px 15px 255px/255px 15px 225px 15px}
  .wrap{max-width:1000px;margin:0 auto;display:grid;gap:20px}

  .tag{
    display:inline-block;font:11px/1 var(--font-ui);letter-spacing:.08em;
    text-transform:uppercase;background:var(--ink);color:var(--paper);
    padding:4px 8px;margin-bottom:12px;
  }
  .nav{display:flex;gap:24px;align-items:center;padding:12px 16px}
  .nav .logo{width:96px;height:28px;background:var(--fill-strong);border:1.5px solid var(--ink)}
  .nav ul{display:flex;gap:18px;list-style:none;margin:0;padding:0;margin-left:auto}
  .nav li{width:56px;height:12px;background:var(--fill);border:1.5px solid var(--ink)}

  .hero{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;padding:28px 20px}
  .bars{display:grid;gap:10px}
  .bar{height:14px;background:var(--fill-strong);border:1.5px solid var(--ink)}
  .bar:nth-child(1){width:90%}
  .bar:nth-child(2){width:75%}
  .bar:nth-child(3){width:60%}
  .cta{width:120px;height:36px;background:var(--fill-strong);border:2px solid var(--ink);
       border-radius:255px 15px 225px 15px/15px 225px 15px 255px;margin-top:16px}

  .media{position:relative;aspect-ratio:16/10;background:var(--fill);border:2px solid var(--ink);
         border-radius:15px 225px 15px 255px/255px 15px 225px 15px;display:grid;place-items:center}
  .media::before,.media::after{
    content:"";position:absolute;inset:0;
    background:linear-gradient(to top right,transparent calc(50% - 1px),var(--ink-light) 50%,transparent calc(50% + 1px));
  }
  .media::after{background:linear-gradient(to bottom right,transparent calc(50% - 1px),var(--ink-light) 50%,transparent calc(50% + 1px))}
  .media span{position:relative;z-index:1;background:var(--fill);padding:4px 10px;font:11px var(--font-ui);letter-spacing:.06em;text-transform:uppercase}

  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .card{padding:16px;display:grid;gap:10px}

  .note{
    background:var(--note);border:1px solid #d9cf6a;padding:10px 12px;
    font:12px/1.5 var(--font-ui);transform:rotate(-1.2deg);
    box-shadow:2px 3px 0 #00000014;max-width:320px;
  }
  .note b{display:block;text-transform:uppercase;font-size:10px;letter-spacing:.08em;margin-bottom:4px}
</style>
</head>
<body>
<div class="wrap">

  <header class="sketch">
    <span class="tag">Header</span>
    <div class="nav">
      <div class="logo"></div>
      <ul><li></li><li></li><li></li><li></li></ul>
    </div>
  </header>

  <section class="sketch sketch--alt">
    <span class="tag">Hero</span>
    <div class="hero">
      <div class="bars">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div>
        <div class="cta"></div>
      </div>
      <div class="media"><span>Image</span></div>
    </div>
  </section>

  <section class="sketch">
    <span class="tag">Feature cards ×3</span>
    <div class="grid3">
      <div class="card sketch"><div class="media" style="aspect-ratio:1"><span>Icon</span></div><div class="bar"></div><div class="bar" style="width:70%"></div></div>
      <div class="card sketch sketch--alt"><div class="media" style="aspect-ratio:1"><span>Icon</span></div><div class="bar"></div><div class="bar" style="width:70%"></div></div>
      <div class="card sketch"><div class="media" style="aspect-ratio:1"><span>Icon</span></div><div class="bar"></div><div class="bar" style="width:70%"></div></div>
    </div>
  </section>

  <div class="note">
    <b>Annotation</b>
    Hero CTA is the primary conversion. Secondary CTA moves to nav on mobile.
  </div>

</div>
</body>
</html>
```

## Anti-patterns

| Don't | Why |
|---|---|
| Use real photography | Kills the "structure only" conversation |
| Pick a brand color | Stakeholders will debate it instead of the layout |
| Polish the spacing | Fidelity creep — you will be asked to ship it as-is |
| Add hover states | This is a document, not an interface |
| Use a design system | The point is that no system has been chosen yet |
| Skip annotations | Unlabelled wireframes get interpreted differently by everyone |

## Fidelity budget

Keep it at 20–30%. The check: show it to someone and ask "is this finished?" If they say yes, you went too far.

## Self-check before reporting

- [ ] Every region carries a text label stating its purpose
- [ ] All media is a grey placeholder with an X
- [ ] All body copy is grey bars, not real sentences
- [ ] Border radius is the asymmetric sketch set, not uniform
- [ ] At least one annotation note explains a decision
- [ ] No brand color, no real image, no webfont
- [ ] Looks unfinished to a non-designer
