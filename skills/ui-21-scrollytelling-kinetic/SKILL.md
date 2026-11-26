---
name: ui-21-scrollytelling-kinetic
description: Build scrollytelling and kinetic UI where scroll position drives a narrative timeline. Use for data journalism, product explainers, case studies, and any page where the reference standard is pudding.cool and a static chart would undersell the story.
metadata:
  origin: ningx
  ui-type: 21
  reference: https://pudding.cool
---

# UI Type 21 — Scrollytelling & Kinetic

Scroll position is a timeline. The page tells a story by advancing state.

**Reference standard:** pudding.cool

## When to reach for it

- The content is a sequence, not a collection
- Each step changes what the reader understands
- A static chart or diagram cannot carry the sequence
- The reader will scroll to the end because each step earns the next

## The signature

1. **A sticky visual pane.** It stays in place while text scrolls past.
2. **One state per text block.** Each step advances the visual by exactly one change.
3. **Measured progress**, not guessed — an `IntersectionObserver` or a scroll-progress value.

## The two-pane structure

```
┌──────────────┬──────────────┐
│              │  step 1      │  ← sticky pane
│   VISUAL     │  step 2      │     scrolls
│  (sticky)    │  step 3      │
│              │  step 4      │
└──────────────┴──────────────┘
```

The left pane is `position: sticky; top: 0; height: 100vh`. The right column is tall text blocks.

```css
.scrolly {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}
.sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  display: grid;
  place-items: center;
}
.steps > * {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
```

## The observer

Each step activates when it crosses the middle of the viewport:

```js
const steps = [...document.querySelectorAll('.step')];
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const index = steps.indexOf(entry.target);
    setState(index);
  }
}, {
  rootMargin: '-50% 0px -50% 0px',   // trigger at viewport middle
  threshold: 0
});
steps.forEach(s => io.observe(s));
```

That `rootMargin` is the whole trick. `-50% 0px -50% 0px` collapses the observation box to a 1px line at the viewport centre, so exactly one step is active at a time.

## The state function

Keep state changes declarative and reversible:

```js
const states = [
  { label: 'Before',  value: 12,  highlight: null },
  { label: 'Surge',   value: 94,  highlight: 'peak' },
  { label: 'Fall',    value: 31,  highlight: 'trough' },
  { label: 'Now',     value: 58,  highlight: null },
];

function setState(i) {
  const s = states[i];
  chart.dataset.state = s.highlight ?? '';
  bar.style.setProperty('--h', s.value + '%');
  label.textContent = s.label;
}
```

Never mutate DOM incrementally from a scroll delta. Recompute from an index.

## Tokens

```css
:root {
  --bg: #0b0b0e;
  --panel: #121216;
  --ink: #f4f4f5;
  --ink-soft: #a1a1aa;
  --ink-mute: #52525b;
  --accent: #facc15;
  --accent-2: #38bdf8;

  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --fs-display: clamp(2rem, 4vw, 3.25rem);
  --fs-step: clamp(1.25rem, 2vw, 1.75rem);
  --fs-body: 1.0625rem;

  --sticky-w: 46%;
}
```

## Anatomy

```
<section class="scrolly">
  <div class="sticky">
    <div class="visual">        chart, map, diagram, canvas
  </div>
  <div class="steps">
    <article class="step">      intro, sets the scene
    <article class="step">      state 1
    <article class="step">      state 2
    <article class="step">      resolution
  </div>
</section>
```

Three to seven steps. Below three it is not a story; above seven people stop.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fourteen months — how the drought moved</title>
<style>
  :root{
    --bg:#0b0b0e; --panel:#121216; --ink:#f4f4f5; --ink-soft:#a1a1aa;
    --ink-mute:#52525b; --accent:#facc15; --accent-2:#38bdf8;
    --font-display:"Fraunces",Georgia,serif;
    --font-body:"Inter",system-ui,-apple-system,sans-serif;
    --fs-display:clamp(2rem,4vw,3.25rem); --fs-step:clamp(1.25rem,2vw,1.75rem);
    --fs-body:1.0625rem; --sticky-w:46%;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:var(--fs-body)/1.65 var(--font-body);-webkit-font-smoothing:antialiased}

  /* ---------- intro ---------- */
  .intro{min-height:100vh;display:grid;place-items:center;padding:2rem;text-align:center}
  .intro h1{font-family:var(--font-display);font-size:var(--fs-display);
            font-weight:400;letter-spacing:-.02em;line-height:1.08;margin:0 0 1rem;
            max-width:16ch}
  .intro p{max-width:44ch;color:var(--ink-soft);margin:0}
  .scroll-hint{margin-top:3rem;color:var(--ink-mute);font-size:.8125rem;
               letter-spacing:.16em;text-transform:uppercase}

  /* ---------- scrolly ---------- */
  .scrolly{display:grid;grid-template-columns:var(--sticky-w) 1fr;
           gap:clamp(2rem,5vw,5rem);
           max-width:1200px;margin:0 auto;padding:0 clamp(1.25rem,4vw,2rem)}

  .sticky{position:sticky;top:0;height:100vh;
          display:grid;place-items:center}

  .visual{width:100%;max-width:420px}

  /* the thing that changes */
  .gauge{
    position:relative;aspect-ratio:1;border-radius:50%;
    background:conic-gradient(var(--accent) 0deg,var(--accent) 0deg,
              #1e1e24 0deg,#1e1e24 360deg);
    display:grid;place-items:center;
    transition:background 700ms cubic-bezier(.22,1,.36,1);
  }
  .gauge::before{
    content:"";position:absolute;inset:14%;border-radius:50%;
    background:var(--panel);
  }
  .gauge__value{
    position:relative;font-family:var(--font-display);font-size:clamp(2.5rem,6vw,4rem);
    font-variant-numeric:tabular-nums;line-height:1;letter-spacing:-.03em;
  }
  .gauge__unit{position:relative;display:block;font-family:var(--font-body);
               font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;
               color:var(--ink-soft);margin-top:.5rem;text-align:center}
  .gauge__caption{text-align:center;margin-top:1.5rem;color:var(--ink-soft);
                  font-size:.875rem}

  /* steps */
  .steps{display:grid}
  .step{min-height:100vh;display:grid;align-content:center;padding:2rem 0}
  .step__num{font-family:var(--font-body);font-size:.75rem;letter-spacing:.18em;
             text-transform:uppercase;color:var(--accent);margin:0 0 1rem}
  .step h2{font-family:var(--font-display);font-weight:400;font-size:var(--fs-step);
           line-height:1.2;letter-spacing:-.015em;margin:0 0 1rem;max-width:24ch}
  .step p{color:var(--ink-soft);max-width:46ch;margin:0 0 1rem}
  .step p:last-child{margin-bottom:0}
  .step[data-active="true"] h2{color:var(--ink)}
  .step[data-active="false"]{opacity:.35;transition:opacity 400ms ease}
  .step[data-active="true"]{opacity:1;transition:opacity 400ms ease}

  /* ---------- outro ---------- */
  .outro{min-height:80vh;display:grid;place-items:center;text-align:center;
         padding:2rem;border-top:1px solid #1e1e24}
  .outro h2{font-family:var(--font-display);font-weight:400;font-size:var(--fs-display);
            margin:0 0 1rem;max-width:18ch;line-height:1.1}
  .outro p{color:var(--ink-soft);max-width:44ch;margin:0}

  @media (max-width:860px){
    .scrolly{grid-template-columns:1fr;gap:0}
    .sticky{position:sticky;top:0;height:46vh;z-index:2;
            background:var(--bg);padding:.5rem 0}
    .visual{max-width:240px}
    .steps{margin-top:-8vh}
    .step{min-height:80vh;padding:2rem 0}
  }
  @media (prefers-reduced-motion:reduce){
    .gauge{transition:none}
    .step{opacity:1!important;transition:none!important}
  }
</style>
</head>
<body>

<header class="intro">
  <div>
    <h1>Fourteen months of a drought that would not break.</h1>
    <p>Scroll. Each frame is one month of reservoir data from the same gauge.</p>
    <p class="scroll-hint">Scroll ↓</p>
  </div>
</header>

<section class="scrolly">

  <div class="sticky">
    <div class="visual">
      <div class="gauge" id="gauge" role="img" aria-labelledby="gauge-caption">
        <span class="gauge__value">
          <span id="value">62</span>
          <span class="gauge__unit">% capacity</span>
        </span>
      </div>
      <p class="gauge__caption" id="gauge-caption">Mar 2025 — normal for the season</p>
    </div>
  </div>

  <div class="steps" id="steps">
    <article class="step" data-value="62" data-angle="223" data-caption="Mar 2025 — normal for the season">
      <p class="step__num">01 · Baseline</p>
      <h2>March looked like any other March.</h2>
      <p>The reservoir sat at 62% of capacity, within a point of the ten-year median. Nothing in the gauge suggested the next fourteen months.</p>
    </article>

    <article class="step" data-value="48" data-angle="173" data-caption="Aug 2025 — first shortfall">
      <p class="step__num">02 · First shortfall</p>
      <h2>By August the inflow had stopped.</h2>
      <p>Snowmelt ran four weeks early. The gauge dropped fourteen points in a single season — the fastest spring-to-summer fall on record.</p>
    </article>

    <article class="step" data-value="21" data-angle="76" data-caption="Jan 2026 — lowest since 1977">
      <p class="step__num">03 · The bottom</p>
      <h2>January 2026: the lowest reading since 1977.</h2>
      <p>At 21%, the intake towers were above the waterline. The utility began pumping from the emergency basin for the first time in its history.</p>
    </article>

    <article class="step" data-value="37" data-angle="133" data-caption="Apr 2026 — one wet winter">
      <p class="step__num">04 · One wet winter</p>
      <h2>A single wet winter bought back sixteen points.</h2>
      <p>Enough to end the emergency. Not enough to change the trend line. The gauge reads 37% — still below where the drought started.</p>
    </article>
  </div>

</section>

<footer class="outro">
  <div>
    <h2>Recovery is not the same as resilience.</h2>
    <p>Fourteen months of data, one gauge, one basin. The pattern repeats in six others.</p>
  </div>
</footer>

<script>
  (() => {
    const steps   = [...document.querySelectorAll('.step')];
    const gauge   = document.getElementById('gauge');
    const value   = document.getElementById('value');
    const caption = document.getElementById('gauge-caption');

    function apply(step) {
      const v = step.dataset.value;
      const a = step.dataset.angle;
      value.textContent = v;
      caption.textContent = step.dataset.caption;
      gauge.style.background =
        `conic-gradient(var(--accent) 0deg, var(--accent) ${a}deg, #1e1e24 ${a}deg, #1e1e24 360deg)`;
      for (const s of steps) s.dataset.active = String(s === step);
    }

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) apply(e.target);
      }
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    steps.forEach(s => io.observe(s));
    apply(steps[0]);
  })();
</script>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Scroll-jacking (`scrollTo` on wheel) | Breaks the platform, breaks accessibility |
| Change the visual on every scroll pixel | Nauseating; state must be discrete |
| A step that changes nothing | Wasted scroll; every step must advance |
| More than 7 steps | Attention is gone by step 6 |
| No reduced-motion path | Hard failure |
| Sticky pane taller than the viewport | Content hides behind it |
| Animate with a scroll delta | Recompute from an index instead |
| Put the visual below the text on desktop | Two-pane means side by side |

## Reduced motion

Scrollytelling without motion is still a valid article. Collapse it:

```css
@media (prefers-reduced-motion: reduce) {
  .sticky { position: relative; height: auto; }
  .step { min-height: auto; padding: 3rem 0; opacity: 1 !important; }
  .scrolly { grid-template-columns: 1fr; }
}
```

Then the reader gets a linear illustrated article. That is the correct fallback — not a broken sticky pane.

## Mobile

The two-pane layout does not fit. Move the sticky visual to the top:

- `position: sticky; top: 0; height: 46vh` above the steps
- Steps scroll beneath it
- Shrink the visual to ~240px
- Reduce step height to 80vh

The visual must stay visible; a scrollytelling page where you cannot see the change is just a long article.

## Accessibility notes

- Each step is an `<article>` with a heading
- The sticky visual needs `role="img"` and an `aria-labelledby` pointing at the caption — the caption must update
- Do not rely on opacity alone to show the active step — screen readers ignore it, and low-vision users lose the inactive text. The `opacity: .35` is decorative; the content is still in the DOM and readable.
- No scroll-jacking. Native scroll only.
- Keyboard: `PageDown` must move one step. Native scroll already does this — do not intercept it.

## Self-check before reporting

- [ ] Sticky pane uses `position: sticky`, not JS positioning
- [ ] `rootMargin: '-50% 0px -50% 0px'` on the observer
- [ ] State applied from an index, not a scroll delta
- [ ] 3–7 steps, each changing the visual
- [ ] `prefers-reduced-motion` collapses to a linear article
- [ ] Mobile puts the visual above the steps
- [ ] Visual has `role="img"` and an updating caption
- [ ] No scroll-jacking anywhere
