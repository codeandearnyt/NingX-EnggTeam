---
name: anti-slop
alwaysApply: true
description: The banned patterns list. If output contains one of these, the build is not done.
---

# Anti-Slop Rules

Generated interfaces converge. This file is the list of what they converge to.

## Banned copy

Any of these in shipped output is a fail:

| Banned | Why it fails |
|---|---|
| Elevate your workflow | Says nothing. Every SaaS page says it. |
| Unlock your potential | Same. |
| Seamless integration | All integrations have friction. Name the friction. |
| Built for modern teams | Which teams? How many people? What do they do? |
| The future of X | Not a claim, a mood. |
| Empower your business | Empower how? |
| Revolutionise the way you… | Nobody has ever been revolutionised by software. |
| Cutting-edge / state-of-the-art | Meaningless since 1998. |
| Game-changing | Name the change. |
| Supercharge | Name the speedup, in numbers. |
| Effortless | Nothing is effortless. |
| Best-in-class | Compared to what, measured how? |
| Leverage (as a verb) | Use. |
| Synergy / holistic | Delete. |

Replace with a specific: a number, a duration, a concrete action, a named user.

## Banned structure

| Pattern | Problem |
|---|---|
| Gradient hero with centred headline and one CTA | The default AI landing page. Needs a reason to exist. |
| Three feature cards, identical shape | Only valid if the content is genuinely three equal things. |
| Icon + heading + two lines, ×3, ×6, ×9 | Same. |
| "Trusted by" logo bar with no logos | Placeholder. |
| Testimonial with no name, no company, no face | Fabricated. Delete or source it. |
| Pricing table with three tiers, middle one highlighted | Only if the product genuinely has three tiers. |
| Footer with 40 links in 5 columns for a 3-page site | Padding. |
| Hero video that autoplays with sound | Hostile. |
| Cookie banner covering the CTA | Hostile. |

## Banned CSS

```css
/* all fail */
transition: all 0.3s ease;
outline: none;
border-radius: 12px;          /* as a universal default */
font-size: 2vw;               /* ignores zoom */
height: 100vh;                /* use 100dvh on mobile */
width: 100vw;                 /* causes horizontal scroll */
z-index: 9999;
!important;                   /* outside a reset or utility */
background: linear-gradient(135deg, #667eea, #764ba2);  /* the AI gradient */
```

## Banned HTML

```html
<!-- all fail -->
<div onclick="doThing()">Click</div>
<img src="hero.jpg">
<input placeholder="Email">
<a href="#">Read more</a>
<a href="javascript:void(0)">Click</a>
<h3 class="h1">Fake heading</h3>
<span class="button">Submit</span>
<button><svg>…</svg></button>            <!-- no accessible name -->
```

## Banned JavaScript

```js
// all fail
element.innerHTML = userInput;
document.querySelector('.btn').onclick = ...   // use addEventListener
setInterval(poll, 1000);                       // use a real subscription
fetch(url);                                    // no error handling, no signal
JSON.parse(localStorage.getItem('x'));         // no null check
```

## Banned assets

- Emoji used as an icon in a professional interface
- Grey placeholder boxes shipped as "images coming soon"
- Unsplash landscape photos with no relationship to the product
- Stock photos of people pointing at laptops
- A logo made of text in a rounded rectangle with a gradient

## The self-audit

Before reporting done:

```bash
grep -rniE 'elevate|unlock|seamless|empower|revolutioni|game.chang|cutting.edge|next.generation|state.of.the.art|leverage|synerg|holistic|best.in.class|world.class|future.of|reimagin|supercharge|effortless' src/
grep -rn 'transition: all' src/
grep -rn 'outline: none' src/
grep -rn 'href="#"' src/
grep -rniE 'lorem ipsum|TODO|FIXME|coming soon' src/
```

Zero hits or the build is not done.

## Enforcement

`hooks/ui-guard.py` blocks R-copy, `transition: all`, `outline: none`, `href="#"`, placeholder text, and a third `ui-type:` comment on write.
