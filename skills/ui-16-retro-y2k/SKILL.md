---
name: ui-16-retro-y2k
description: Build retro Y2K glossy and chrome UI with hard gradient stops, bevels, pixel type, and late-90s optimism. Use for music and game products, nostalgic brands, event sites, and any page where the reference standard is poolsuite.net and modern softness would kill the joke.
metadata:
  origin: ningx
  ui-type: 16
  reference: https://poolsuite.net
---

# UI Type 16 — Retro / Y2K Glossy & Chrome

Late-90s and early-2000s optimism: gloss, chrome, bevels, tiny type, gradients everywhere.

**Reference standard:** poolsuite.net

## When to reach for it

- The product is music, games, or nightlife
- Nostalgia is the brand
- The audience is old enough to remember, or young enough to find it novel
- You want to be unmistakable in a feed

Do not use it for B2B, finance, or anything requiring trust. It reads as a joke to those buyers.

## The signature

1. **Hard gradient stops.** Chrome is 4–6 stops with visible bands, not a smooth blend.
2. **Bevels from 1px borders.** Light on top-left, dark on bottom-right — the Win95 rule.
3. **Gloss.** A white highlight across the top 40% of any raised surface.

Modern softness is the enemy. If it looks smooth, it looks wrong.

## The chrome gradient

```css
.chrome {
  background: linear-gradient(
    180deg,
    #f0f0f0 0%,
    #d8d8d8 18%,
    #ffffff 38%,
    #b8b8b8 42%,
    #6e6e6e 50%,
    #b8b8b8 58%,
    #e8e8e8 72%,
    #9a9a9a 88%,
    #c8c8c8 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 1px #4a4a4a;
}
```

The `38% → 42%` white-to-grey jump is the chrome horizon. Without a hard stop there, it is just a grey gradient.

## The gloss

```css
.gloss { position: relative; overflow: hidden; }
.gloss::after {
  content: "";
  position: absolute;
  inset: 0 0 55% 0;
  background: linear-gradient(180deg, rgb(255 255 255 / .75), rgb(255 255 255 / .05));
  border-radius: inherit inherit 50% 50% / inherit inherit 100% 100%;
  pointer-events: none;
}
```

The asymmetric bottom radius on the highlight is what makes it read as a curved plastic surface catching light.

## The bevel

```css
.bevel {
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;  /* top right bottom left */
  background: #c0c0c0;
}
.bevel--pressed {
  border-color: #808080 #ffffff #ffffff #808080;
}
```

That four-value border-color is the entire Win95 button. Swap the pairs for pressed state.

## Tokens

```css
:root {
  --bg: #0a1a3a;
  --panel: #c0c0c0;
  --panel-light: #e8e8e8;
  --bevel-light: #ffffff;
  --bevel-dark: #808080;
  --bevel-darker: #404040;

  --ink: #0a0a0a;
  --ink-invert: #ffffff;
  --lime: #9eff00;
  --cyan: #00e5ff;
  --magenta: #ff00a0;
  --amber: #ffb300;

  --font-display: "VT323", "Press Start 2P", "Courier New", monospace;
  --font-body: "MS Sans Serif", "Tahoma", system-ui, sans-serif;
  --font-mono: "VT323", "Courier New", monospace;

  --fs-display: clamp(2.5rem, 8vw, 5rem);
  --fs-body: 13px;         /* small. this era used small type. */
  --fs-meta: 11px;

  --radius: 0;             /* Y2K is square. zero radius. */
}
```

Zero border-radius. That single rule does more for authenticity than any gradient.

## Anatomy

```
<body>                    a background image or a deep gradient
  <div class="window">    an OS window: title bar + body
    <div class="titlebar"> gradient, drag-handle look, 3 bevel buttons
    <div class="window__body">
      <div class="gloss"> a glossy button or panel
  <div class="taskbar">   fixed bottom, bevel, start button
```

The window metaphor is the organizing principle. Build the page as a desktop.

## Working scaffold

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>POOLSUITE — FM 98.6</title>
<style>
  :root{
    --bg:#0a1a3a; --panel:#c0c0c0; --panel-light:#e8e8e8;
    --bevel-light:#fff; --bevel-dark:#808080; --bevel-darker:#404040;
    --ink:#0a0a0a; --lime:#9eff00; --cyan:#00e5ff; --magenta:#ff00a0; --amber:#ffb300;
    --font-display:"VT323","Courier New",monospace;
    --font-body:"MS Sans Serif",Tahoma,system-ui,sans-serif;
    --fs-display:clamp(2.5rem,8vw,5rem); --fs-body:13px; --fs-meta:11px;
  }
  *{box-sizing:border-box}
  body{
    margin:0;min-height:100vh;padding:24px 16px 72px;
    background:
      radial-gradient(ellipse at 50% 0%,#1e3a6e 0%,transparent 60%),
      repeating-linear-gradient(0deg,#0a1a3a 0 2px,#0b1c3e 2px 4px);
    color:var(--ink);font:var(--fs-body)/1.4 var(--font-body);
    -webkit-font-smoothing:none;
  }

  /* ---------- window ---------- */
  .window{
    max-width:640px;margin:0 auto;
    background:var(--panel);
    border:2px solid;
    border-color:var(--bevel-light) var(--bevel-darker) var(--bevel-darker) var(--bevel-light);
    box-shadow:4px 4px 0 rgb(0 0 0/.5);
  }
  .titlebar{
    display:flex;align-items:center;gap:6px;
    padding:3px 3px 3px 6px;margin:2px;
    background:linear-gradient(90deg,#000080,#1084d0);
    color:#fff;font-weight:700;font-size:12px;
    letter-spacing:.02em;user-select:none;
  }
  .titlebar span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .win-btn{
    width:18px;height:16px;border:1px solid;
    border-color:var(--bevel-light) var(--bevel-darker) var(--bevel-darker) var(--bevel-light);
    background:var(--panel);font:700 9px/1 var(--font-body);
    display:grid;place-items:center;cursor:pointer;padding:0;color:var(--ink);
  }
  .win-btn:active{
    border-color:var(--bevel-darker) var(--bevel-light) var(--bevel-light) var(--bevel-darker);
  }

  .window__body{padding:14px;background:var(--panel)}

  /* ---------- logo ---------- */
  .logo{
    font-family:var(--font-display);
    font-size:var(--fs-display);line-height:.9;letter-spacing:.02em;
    text-align:center;margin:8px 0 4px;
    background:linear-gradient(180deg,#f0f0f0 0%,#d8d8d8 18%,#fff 38%,#b8b8b8 42%,
      #6e6e6e 50%,#b8b8b8 58%,#e8e8e8 72%,#9a9a9a 88%,#c8c8c8 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent;
    -webkit-text-stroke:1.5px #2a2a2a;
    filter:drop-shadow(2px 2px 0 rgb(0 0 0/.45));
  }
  .tagline{
    text-align:center;font-size:var(--fs-meta);letter-spacing:.28em;
    text-transform:uppercase;color:var(--bevel-darker);margin:0 0 16px;
  }

  /* ---------- inset display ---------- */
  .display{
    border:2px solid;
    border-color:var(--bevel-darker) var(--bevel-light) var(--bevel-light) var(--bevel-darker);
    background:#0a0a0a;color:var(--lime);
    font-family:var(--font-display);font-size:28px;line-height:1;
    padding:10px 12px;text-align:center;letter-spacing:.08em;
    text-shadow:0 0 8px rgb(158 255 0/.7);
    margin-bottom:14px;
  }
  .display small{display:block;font-size:13px;color:var(--cyan);letter-spacing:.2em;
                 margin-top:4px;text-shadow:0 0 6px rgb(0 229 255/.7)}

  /* ---------- glossy button ---------- */
  .btn{
    position:relative;overflow:hidden;
    display:block;width:100%;padding:12px 16px;margin-bottom:10px;
    border:2px solid;
    border-color:var(--bevel-light) var(--bevel-darker) var(--bevel-darker) var(--bevel-light);
    background:linear-gradient(180deg,#ff6ec7 0%,#ff2ea6 48%,#c4007a 52%,#ff5cb8 100%);
    color:#fff;font:700 14px/1 var(--font-body);letter-spacing:.06em;
    text-transform:uppercase;text-align:center;cursor:pointer;
    text-shadow:0 1px 0 rgb(0 0 0/.5);
  }
  .btn::after{
    content:"";position:absolute;inset:0 0 52% 0;
    background:linear-gradient(180deg,rgb(255 255 255/.8),rgb(255 255 255/.06));
    border-radius:0 0 50% 50% / 0 0 100% 100%;
    pointer-events:none;
  }
  .btn:hover{filter:brightness(1.1)}
  .btn:active{
    border-color:var(--bevel-darker) var(--bevel-light) var(--bevel-light) var(--bevel-darker);
    filter:brightness(.9);
  }
  .btn--alt{background:linear-gradient(180deg,#5ce1ff 0%,#00b8e6 48%,#0088b3 52%,#4dd6f5 100%)}
  .btn--amber{background:linear-gradient(180deg,#ffd54f 0%,#ffb300 48%,#c98a00 52%,#ffc233 100%);color:#2a1a00}

  /* ---------- marquee strip ---------- */
  .marquee{
    overflow:hidden;white-space:nowrap;
    border:2px solid;
    border-color:var(--bevel-darker) var(--bevel-light) var(--bevel-light) var(--bevel-darker);
    background:#000;color:var(--amber);
    font-family:var(--font-display);font-size:16px;letter-spacing:.1em;
    padding:6px 0;margin-top:14px;
  }
  .marquee span{display:inline-block;padding-left:100%;
                 animation:scroll 18s linear infinite}
  @keyframes scroll{to{transform:translateX(-100%)}}

  /* ---------- taskbar ---------- */
  .taskbar{
    position:fixed;left:0;right:0;bottom:0;z-index:10;
    display:flex;align-items:center;gap:6px;padding:3px;
    background:var(--panel);
    border-top:2px solid var(--bevel-light);
    box-shadow:0 -1px 0 var(--bevel-darker);
  }
  .start{
    display:flex;align-items:center;gap:5px;padding:3px 10px;
    border:2px solid;
    border-color:var(--bevel-light) var(--bevel-darker) var(--bevel-darker) var(--bevel-light);
    background:var(--panel);font:700 12px/1 var(--font-body);cursor:pointer;
  }
  .start:active{
    border-color:var(--bevel-darker) var(--bevel-light) var(--bevel-light) var(--bevel-darker);
  }
  .clock{
    margin-left:auto;padding:4px 10px;
    border:2px solid;
    border-color:var(--bevel-darker) var(--bevel-light) var(--bevel-light) var(--bevel-darker);
    font:12px/1 var(--font-body);font-variant-numeric:tabular-nums;
  }

  :focus-visible{outline:1px dotted #000;outline-offset:-3px}

  @media (prefers-reduced-motion:reduce){
    .marquee span{animation:none;padding-left:0}
    *{transition:none!important}
  }
</style>
</head>
<body>

<div class="window">
  <div class="titlebar">
    <span>POOLSUITE.EXE — FM 98.6</span>
    <button class="win-btn" aria-label="Minimise">_</button>
    <button class="win-btn" aria-label="Maximise">□</button>
    <button class="win-btn" aria-label="Close">×</button>
  </div>

  <div class="window__body">

    <h1 class="logo">POOLSUITE</h1>
    <p class="tagline">endless summer radio</p>

    <div class="display">
      98.6 FM
      <small>NOW PLAYING · MIDNIGHT DRIVE</small>
    </div>

    <button class="btn">▶ Tune in</button>
    <button class="btn btn--alt">☰ Station list</button>
    <button class="btn btn--amber">★ Favourite</button>

    <div class="marquee">
      <span>★ WELCOME TO POOLSUITE ★ 24 HOUR SUMMER ★ NO ADS, EVER ★ BROADCASTING FROM THE BEACH ★</span>
    </div>

  </div>
</div>

<div class="taskbar">
  <button class="start">▣ Start</button>
  <div class="clock" id="clock">00:00</div>
</div>

<script>
  const clock = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    clock.textContent = String(d.getHours()).padStart(2,'0') + ':' +
                        String(d.getMinutes()).padStart(2,'0');
  };
  tick();
  setInterval(tick, 30000);
</script>

</body>
</html>
```

## Anti-patterns

| Don't | Why it breaks the type |
|---|---|
| Use `border-radius` above 0 | Y2K is square. Immediate tell. |
| Smooth gradients | Needs hard stops. Chrome is banded. |
| Modern sans-serif body type | Use Tahoma/Verdana/MS Sans Serif |
| Soft box-shadows | Hard offset `4px 4px 0`, no blur |
| One-color flat buttons | Needs a 3–4 stop vertical gradient plus gloss |
| Dark mode | This era was light. The dark version is type 12. |
| Inter or Geist anywhere | Wrong century |
| Animations with easing | Linear, stepped, or `steps()` only |

## Type

The era's vocabulary:

- **Display**: VT323, Press Start 2P, Silkscreen — pixel fonts
- **Body**: Tahoma, Verdana, MS Sans Serif, Trebuchet
- **Accent**: Courier New for terminal bits

Load at most two webfonts. If you use a pixel font for display, use a system face for body — two pixel fonts is unreadable.

## Accessibility notes

This type is genuinely difficult to make accessible. Minimums:

- Small type (11–13px) is period-accurate but fails legibility — bump body to 14px minimum
- Gloss overlays reduce contrast: verify text contrast **through** the gloss
- Bevel borders at `#fff`/`#808080` give about 1.9:1 — these are decorative, so the text must carry the affordance
- The `:focus-visible` dotted outline is period-accurate **and** visible — keep it
- Marquee text must be pausable (WCAG 2.2.2). Add a pause control or respect reduced-motion (done above)
- Buttons need real labels, not just `▶`

## Self-check before reporting

- [ ] Zero border-radius
- [ ] Chrome gradients have hard stops, not smooth blends
- [ ] Every raised surface has a top-half gloss
- [ ] Bevels use the four-value border-color pattern
- [ ] Body type is a system face (Tahoma/Verdana), not a modern sans
- [ ] Max two webfonts
- [ ] Marquee respects `prefers-reduced-motion`
- [ ] Body text ≥ 14px despite period accuracy
