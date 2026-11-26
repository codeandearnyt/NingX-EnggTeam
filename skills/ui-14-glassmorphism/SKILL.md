---
name: ui-14-glassmorphism
description: Build glassmorphism UI with translucent panels, backdrop blur, and light edge treatment floating over a background worth blurring. Use for OS-like interfaces, media players, overlays, and any page where the reference standard is apple.com and depth must come from transparency rather than shadow.
metadata:
  origin: ningx
  ui-type: 14
  reference: https://www.apple.com
---

# UI Type 14 — Glassmorphism (Frosted Glass)

Translucent panels with backdrop blur, floating over a background with real depth.

**Reference standard:** apple.com / macOS / visionOS

## The precondition nobody states

**Glassmorphism requires something behind the glass.**

If the panel sits on a flat white page, `backdrop-filter: blur()` produces a slightly grey box. That is not glass — it is a bug. Before you use this type, confirm there is a background worth blurring: a photograph, a gradient mesh, a 3D scene, a video, a colorful illustration.

No background, no glassmorphism. Pick a different type.

## When to reach for it

- The interface overlays content (media, maps, imagery)
- The product is an OS, player, or spatial app
- Depth hierarchy matters and you want it without heavy shadows
- The brand is premium and modern

## The signature

Three properties, all required:

```css
.glass {
  background: rgb(255 255 255 / 0.12);        /* 1. low-opacity fill */
  backdrop-filter: blur(20px) saturate(180%); /* 2. blur + saturation */
  border: 1px solid rgb(255 255 255 / 0.18);  /* 3. light edge */
}
```

Plus one optional but strongly recommended: an inner highlight on the top edge.

```css
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg, rgb(255 255 255 / .45), transparent 40%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
```

That gradient border is what makes it read as a physical pane catching light.

## Why `saturate(180%)`

Blur alone washes colors toward grey. Real frosted glass *amplifies* the color behind it because the light scatters through. `saturate(180%)` recreates that. Without it, glass looks like fog.

## Tokens

```css
:root {
  /* Glass surfaces */
  --glass-1: rgb(255 255 255 / 0.08);   /* subtle — sidebars, HUD */
  --glass-2: rgb(255 255 255 / 0.14);   /* standard — cards, panels */
  --glass-3: rgb(255 255 255 / 0.22);   /* raised — menus, popovers */
  --glass-border: rgb(255 255 255 / 0.18);
  --glass-border-strong: rgb(255 255 255 / 0.32);

  --blur-sm: blur(12px) saturate(160%);
  --blur:    blur(20px) saturate(180%);
  --blur-lg: blur(32px) saturate(200%);

  --ink: #ffffff;
  --ink-soft: rgb(255 255 255 / 0.72);
  --ink-mute: rgb(255 255 255 / 0.52);

  --radius: 20px;
  --radius-lg: 28px;
  --radius-sm: 12px;
}
```

Three glass levels. More than three and the hierarchy dissolves.

## The contrast problem

Glass over a variable background means contrast is **not fixed**. White text on `rgb(255 255 255/.14)` over a light photograph fails.

Three mitigations, in order of reliability:

1. **Darken the glass on light backgrounds.** Use `rgb(0 0 0 / .3)` instead of white tint when the backdrop is bright.
2. **Add a text shadow.** `text-shadow: 0 1px 2px rgb(0 0 0 / .4)` buys about one contrast step.
3. **Use a scrim behind the glass.** A gradient from black at 40% under the panel.

Never ship glass with body text and no mitigation. Test against the lightest part of the backdrop.

## Anatomy

```
<div class="stage">              background layer: image / gradient / canvas
  <div class="overlay">          glass panels above
    <header class="glass">       nav bar, blur-sm
    <aside class="glass">        sidebar, blur
    <div class="card glass">     content card, blur
  </div>
</div>
```

The `stage` is `position: relative` with the background. Panels are `position: absolute` or in normal flow above it.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sound — now playing</title>
<style>
  :root{
    --glass-1:rgb(255 255 255/.08); --glass-2:rgb(255 255 255/.14); --glass-3:rgb(255 255 255/.22);
    --glass-border:rgb(255 255 255/.18); --glass-border-strong:rgb(255 255 255/.32);
    --blur-sm:blur(12px) saturate(160%); --blur:blur(20px) saturate(180%); --blur-lg:blur(32px) saturate(200%);
    --ink:#fff; --ink-soft:rgb(255 255 255/.72); --ink-mute:rgb(255 255 255/.52);
    --radius-sm:12px; --radius:20px; --radius-lg:28px;
    --font:system-ui,-apple-system,"SF Pro Display","Segoe UI",sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;font:1rem/1.5 var(--font);color:var(--ink);
       -webkit-font-smoothing:antialiased;overflow:hidden}

  /* ---------- stage: the thing worth blurring ---------- */
  .stage{
    position:relative;min-height:100vh;
    background:
      radial-gradient(circle at 18% 22%, #ff6b9d 0%, transparent 45%),
      radial-gradient(circle at 82% 18%, #4d7cfe 0%, transparent 45%),
      radial-gradient(circle at 62% 82%, #22d3ee 0%, transparent 45%),
      radial-gradient(circle at 28% 78%, #a855f7 0%, transparent 45%),
      #0b0b12;
    display:grid;place-items:center;padding:clamp(1rem,4vw,3rem);
  }

  /* ---------- glass primitive ---------- */
  .glass{
    position:relative;
    background:var(--glass-2);
    backdrop-filter:var(--blur);
    -webkit-backdrop-filter:var(--blur);
    border:1px solid var(--glass-border);
    border-radius:var(--radius);
    box-shadow:0 20px 60px -20px rgb(0 0 0/.5);
  }
  /* top-edge light catch */
  .glass::before{
    content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;
    background:linear-gradient(180deg,rgb(255 255 255/.5),transparent 42%);
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor;mask-composite:exclude;
    pointer-events:none;
  }

  /* ---------- player ---------- */
  .player{width:min(420px,100%);padding:1.75rem;border-radius:var(--radius-lg)}
  .player__art{
    width:100%;aspect-ratio:1;border-radius:var(--radius);
    background:
      conic-gradient(from 210deg at 50% 50%, #ff6b9d, #a855f7, #4d7cfe, #22d3ee, #ff6b9d);
    box-shadow:0 12px 40px -12px rgb(0 0 0/.6);
    margin-bottom:1.5rem;
  }
  .player__title{font-size:1.375rem;font-weight:600;letter-spacing:-.02em;margin:0 0 .25rem}
  .player__artist{font-size:.9375rem;color:var(--ink-soft);margin:0 0 1.5rem}

  .scrub{position:relative;height:4px;border-radius:999px;
         background:rgb(255 255 255/.18);margin-bottom:.5rem;cursor:pointer}
  .scrub__fill{position:absolute;inset:0 38% 0 0;border-radius:999px;
               background:rgb(255 255 255/.85)}
  .scrub__fill::after{content:"";position:absolute;right:-6px;top:50%;
                      width:12px;height:12px;border-radius:50%;background:#fff;
                      transform:translateY(-50%);box-shadow:0 1px 4px rgb(0 0 0/.4)}
  .times{display:flex;justify-content:space-between;font-size:.75rem;
         color:var(--ink-mute);font-variant-numeric:tabular-nums;margin-bottom:1.5rem}

  .controls{display:flex;align-items:center;justify-content:center;gap:1.25rem}
  .ctl{
    display:grid;place-items:center;width:44px;height:44px;border-radius:50%;
    border:0;background:transparent;color:var(--ink);cursor:pointer;
    transition:background-color 140ms ease;
  }
  .ctl:hover{background:rgb(255 255 255/.12)}
  .ctl--play{
    width:64px;height:64px;background:var(--glass-3);
    border:1px solid var(--glass-border-strong);
    backdrop-filter:var(--blur-sm);-webkit-backdrop-filter:var(--blur-sm);
  }
  .ctl--play:hover{background:rgb(255 255 255/.32)}
  .ctl svg{width:22px;height:22px;fill:currentColor}
  .ctl--play svg{width:26px;height:26px}

  /* ---------- floating HUD ---------- */
  .hud{
    position:fixed;top:1.25rem;left:50%;transform:translateX(-50%);
    display:flex;align-items:center;gap:.75rem;
    padding:.625rem 1rem;border-radius:999px;
    background:var(--glass-1);
    backdrop-filter:var(--blur-sm);-webkit-backdrop-filter:var(--blur-sm);
    border:1px solid var(--glass-border);
    font-size:.8125rem;color:var(--ink-soft);
    white-space:nowrap;
  }
  .hud i{width:7px;height:7px;border-radius:50%;background:#4ade80;
         box-shadow:0 0 10px #4ade80}

  :focus-visible{outline:2px solid #fff;outline-offset:3px}

  @media (max-width:520px){
    .player{padding:1.25rem}
    .hud{display:none}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}

  /* fallback when backdrop-filter is unsupported */
  @supports not (backdrop-filter:blur(1px)){
    .glass,.hud,.ctl--play{background:rgb(20 20 30/.88)}
  }
</style>
</head>
<body>

<div class="stage">

  <div class="hud"><i></i>Connected · lossless</div>

  <section class="glass player" aria-label="Now playing">
    <div class="player__art" role="img" aria-label="Album artwork"></div>
    <h1 class="player__title">Slow Architecture</h1>
    <p class="player__artist">Mira Halden — Concrete Gardens</p>

    <div class="scrub" role="slider" tabindex="0" aria-label="Seek"
         aria-valuemin="0" aria-valuemax="100" aria-valuenow="62">
      <div class="scrub__fill"></div>
    </div>
    <div class="times"><span>2:41</span><span>4:18</span></div>

    <div class="controls">
      <button class="ctl" aria-label="Previous">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h2v14H7zM20 5v14l-11-7z"/></svg>
      </button>
      <button class="ctl ctl--play" aria-label="Pause">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
      </button>
      <button class="ctl" aria-label="Next">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5h2v14h-2zM4 5l11 7-11 7z"/></svg>
      </button>
    </div>
  </section>

</div>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Glass on a flat solid background | Nothing to blur — it is a grey box |
| `backdrop-filter` without `saturate()` | Reads as fog, not glass |
| Make every surface glass | Then nothing is elevated. 2–3 glass layers max. |
| Use glass for body text containers | Contrast is unpredictable |
| Skip the top-edge highlight | The pane loses its physicality |
| Stack glass on glass on glass | Blur compounds into mush |
| Use glass with `overflow: hidden` on the parent | Clips the backdrop sample, breaks the effect |
| Forget the `@supports` fallback | Firefox/Safari older builds show unreadable panels |

## Performance

`backdrop-filter` is expensive — it forces the compositor to re-sample the backdrop every frame.

Rules:
1. Limit to 2–3 glass surfaces on screen at once
2. Never animate a glass element's size or position on scroll
3. `will-change: backdrop-filter` only on elements that actually move
4. Disable blur below 640px if frame rate suffers — swap to solid
5. Do not put `backdrop-filter` inside a `filter` context — it breaks

## Accessibility notes

- Contrast is the whole risk. White text on `--glass-2` over a **bright** backdrop fails. Test the lightest region.
- Add `text-shadow: 0 1px 2px rgb(0 0 0/.35)` to text inside glass as a floor
- The `@supports` fallback must be a solid color with verified contrast
- Focus ring white on glass works; verify against the brightest backdrop area
- Respect `prefers-reduced-transparency` where supported:
  ```css
  @media (prefers-reduced-transparency: reduce) {
    .glass { background: rgb(20 20 30 / .95); backdrop-filter: none; }
  }
  ```

## Self-check before reporting

- [ ] A real background exists behind the glass (image, gradient, canvas)
- [ ] Every glass surface has `backdrop-filter` with `saturate()`
- [ ] Top-edge highlight present
- [ ] No more than 3 glass levels
- [ ] `@supports not (backdrop-filter)` fallback present
- [ ] Contrast tested against the lightest backdrop region
- [ ] No glass inside a `filter` context
- [ ] `prefers-reduced-transparency` handled
