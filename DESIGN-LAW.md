# Design Law — The 24 UI Types

**NingX-EnggTeam** · **Made by Nitin Sharma**

The canonical catalog. Each type has: a reference site that defines the standard, the structural signature that makes it what it is, what to steal, what breaks it, and the skill that teaches it.

Read this before choosing a direction. `ui-ux-director` owns this document.

---

## How to read an entry

```
TYPE — what it is, in one sentence
Reference     the site that is the standard
Steal         the specific mechanics worth copying
Structure     the load-bearing anatomy
Breaks if     the failure modes
Load          the skill file
```

---

## 01 — Text-Only / Terminal (CLI) UI

Dense monospace text, no images, no decoration. Information density as the aesthetic.

```
Reference     ycombinator.com
Steal         Left-aligned list rows. Tight vertical rhythm. Underlined links as the
              only affordance. Numbered rank as the only hierarchy device.
Structure     A container with a max-width. A list. Each row: rank, title, meta.
              Nothing else. Nav is a single line of text links.
Breaks if     You add a card, a shadow, a gradient, or a sans-serif face.
              Density collapses the moment whitespace is generous.
Load          skills/ui-01-terminal-cli/SKILL.md
```

---

## 02 — Wireframe / Low-Fidelity UI

Deliberately unfinished. Boxes, labels, placeholder grey. Signals "structure, not style".

```
Reference     balsamiq.com
Steal         The sketch-line quality: 2px rough borders, hand-drawn wobble,
              grey blocks with an X for images. Everything annotated.
Structure     A grid of labelled regions. Each region states its purpose in plain
              text. Real content is replaced with representative blocks.
Breaks if     You make it pretty. Fidelity above ~30% defeats the type entirely.
Load          skills/ui-02-wireframe/SKILL.md
```

---

## 03 — Brutalist HTML UI

The browser's defaults, left alone. No CSS framework, no reset, no polish.

```
Reference     berkshirehathaway.com
Steal         System font stack. Blue underlined links. Default list bullets.
              Tables for tabular data. Zero layout CSS. Honest, fast, unkillable.
Structure     Semantic HTML document. A heading, paragraphs, lists, links.
              Maybe one table. No wrapper divs.
Breaks if     You add one line of aesthetic CSS. Brutalism is an absence, not a style.
Load          skills/ui-03-brutalist-html/SKILL.md
```

---

## 04 — Pure Flat Design

No shadow, no gradient, no texture. Color blocks and type carry everything.

```
Reference     mailchimp.com
Steal         Large solid color fields. Strong single accent. Generous type scale.
              Illustration over photography. Buttons as solid rectangles.
Structure     Full-bleed color bands. Content sits in a max-width column.
              Hierarchy comes from size and color weight, never elevation.
Breaks if     A shadow appears. Or a gradient. Or a border-radius above 4px.
Load          skills/ui-04-pure-flat/SKILL.md
```

---

## 05 — Minimalist / Swiss Grid UI

The grid is visible in the result even though it is never drawn. Restraint as authority.

```
Reference     aesop.com
Steal         Asymmetric column splits. Wide margins. Small type in large space.
              Product photography treated as the only ornament. Hairline rules.
Structure     A 12-column grid used at 3–5 columns of actual content. Left-aligned.
              Type scale is narrow: 2–3 sizes. Color is near-monochrome.
Breaks if     Centering. Or filling the grid. Or adding a second accent.
Load          skills/ui-05-swiss-grid/SKILL.md
```

---

## 06 — Editorial / Typographic UI

The page reads like a publication. Type does the work of layout.

```
Reference     bloomberg.com
Steal         Display headline at 3–5× body size. Kickers and bylines. Dense
              multi-column news grid. Rules between sections. Data as typography.
Structure     Masthead. Lead story with oversized headline. Secondary grid below.
              Every block has a kicker, a headline, a meta line.
Breaks if     Body text is larger than 18px, or the display face is a neutral sans.
Load          skills/ui-06-editorial-typographic/SKILL.md
```

---

## 07 — Line-Art & Hand-Drawn UI

Thin strokes, imperfect geometry, illustration integrated with layout.

```
Reference     notion.so
Steal         Single-weight line illustrations. Small hand-drawn accents in margins.
              Illustrations that sit *inside* the layout, not beside it.
Structure     Content blocks with inline spot illustrations. Icons are line-only,
              same stroke weight as the illustrations. Whitespace generous.
Breaks if     Stroke weights vary. Or the illustration is a stock 3D render.
Load          skills/ui-07-line-art-handdrawn/SKILL.md
```

---

## 08 — Neobrutalism

Loud borders, hard offset shadows, unapologetic color, zero softness.

```
Reference     gumroad.com
Steal         2–3px solid black borders on every surface. Hard offset shadow
              (4px 4px 0 #000, no blur). Saturated flat fills. Chunky type.
Structure     Every element is a bordered box. Buttons press into their shadow
              on :active. Rotation of ±1–2deg on accents only.
Breaks if     A blur appears. Or a soft shadow. Or a pastel.
Load          skills/ui-08-neobrutalism/SKILL.md
```

---

## 09 — Card-Based & Masonry UI

Content as discrete, variable-height tiles in a packed column layout.

```
Reference     pinterest.com
Steal         Column-balanced masonry (CSS columns or JS row-packing). Cards with
              no fixed height. Hover reveals meta. Infinite density.
Structure     A masonry container. Cards of varying aspect. Each card is one unit
              of content with image, title, meta. No card chrome beyond radius.
Breaks if     Cards are equal height (that is a grid, not masonry) or gaps are uneven.
Load          skills/ui-09-card-masonry/SKILL.md
```

---

## 10 — Bento Grid UI

A fixed asymmetric grid of differently-sized panels, each holding one idea.

```
Reference     linear.app
Steal         One container, 6–12 cells, mixed spans. Each cell is a self-contained
              story. Thin dividers or tight gaps. Soft radius, subtle border.
Structure     CSS Grid with explicit `grid-column`/`grid-row` spans. Every cell
              has a label and one visual. The composition reads as one object.
Breaks if     Cells are equal size, or there are more than ~12, or a cell is empty.
Load          skills/ui-10-bento-grid/SKILL.md
```

---

## 11 — Material Design (Elevated 2D)

Layered surfaces with meaningful elevation, motion that explains state.

```
Reference     google.com
Steal         Elevation as a 5-step shadow scale. Ripple on press. 4dp/8dp grid.
              Type roles (display/headline/title/body/label) applied consistently.
Structure     Surface stack. FAB or contained button with ripple. Cards at
              elevation 1, hover 2, drag 8. Motion uses standard easing curves.
Breaks if     Elevation is decorative rather than communicative, or shadows blur past 24px.
Load          skills/ui-11-material-elevated/SKILL.md
```

---

## 12 — Layered Dark Mode UI

Dark as the base, with depth built from value steps, not shadows.

```
Reference     vercel.com
Steal         A 5–7 step neutral ramp from #000 to #333. Borders at ~#222 doing the
              work shadows would do in light mode. One accent used sparingly.
Structure     Page background at the darkest step. Cards one step up. Borders
              one step up again. Text at two levels only.
Breaks if     Pure #000 with pure #fff text, or shadows used for depth on dark,
              or more than one accent.
Load          skills/ui-12-layered-dark/SKILL.md
```

---

## 13 — Aurora / Mesh Gradient UI

Soft, large-scale color fields that behave like light, not like paint.

```
Reference     stripe.com
Steal         Multi-stop radial gradients at low opacity, heavily blurred, layered.
              Gradients confined to one region — never the whole page. Crisp
              content on top with no blur.
Structure     An absolutely-positioned gradient layer behind content. Content is
              fully opaque. Gradient uses 3–5 color stops at 30–60% opacity.
Breaks if     The gradient is behind text without a scrim, or it covers the whole page.
Load          skills/ui-13-aurora-mesh-gradient/SKILL.md
```

---

## 14 — Glassmorphism (Frosted Glass)

Translucent panels with backdrop blur, floating over a rich background.

```
Reference     apple.com
Steal         backdrop-filter: blur(20px) saturate(180%) on a 60–80% opaque panel.
              1px light border at the top edge. The blur must reveal something
              worth blurring — a gradient, an image, a 3D scene.
Structure     A background layer with real depth. Glass panels above it. Content
              inside panels is fully opaque. Border and inner highlight sell it.
Breaks if     There is nothing behind the glass, or the panel is fully opaque,
              or every surface is glass.
Load          skills/ui-14-glassmorphism/SKILL.md
```

---

## 15 — Neumorphism (Soft UI)

Elements extruded from a single surface using paired light/dark shadows.

```
Reference     neumorphism.io
Steal         Two shadows per element: light from top-left, dark from bottom-right,
              both on the same base color. Inset variant for pressed state.
              Monochrome palette — the shadows are the only contrast.
Structure     One background color. Raised elements: `box-shadow: -6px -6px 12px
              light, 6px 6px 12px dark`. Pressed: same values with `inset`.
Breaks if     Contrast drops below 3:1 for interactive elements, or the palette
              has more than one hue, or shadows are soft and wide.
Load          skills/ui-15-neumorphism/SKILL.md
```

---

## 16 — Retro / Y2K Glossy & Chrome UI

Late-90s/early-2000s optimism: gloss, chrome, bevels, tiny type, gradients everywhere.

```
Reference     poolsuite.net
Steal         Glossy buttons with a top highlight and bottom shadow. Chrome
              gradients with hard color stops. Beveled edges. Pixel or condensed
              display type. A "window" chrome metaphor.
Structure     A desktop or window frame containing the app. Buttons with
              3-stop vertical gradients. Hard 1px bevels (light top-left, dark
              bottom-right).
Breaks if     It looks modern. Anti-aliasing softness is the enemy — this type
              wants hard stops and visible geometry.
Load          skills/ui-16-retro-y2k/SKILL.md
```

---

## 17 — Claymorphism (Inflated 3D-Look)

Soft, puffy, rounded volumes that look moulded rather than drawn.

```
Reference     pitch.com
Steal         Large border-radius (24–48px). Multiple inner shadows to inflate:
              light inner top, dark inner bottom, plus a soft outer drop.
              Pastel fills with a saturated version of the same hue for edges.
Structure     Cards and buttons as inflated volumes. Illustration in the same
              clay language. Background is a soft gradient in the same family.
Breaks if     Radius is small, or the shadow is single, or the palette is grey.
Load          skills/ui-17-claymorphism/SKILL.md
```

---

## 18 — Skeuomorphism (Realistic Textures)

Interface elements that imitate their physical counterparts, textures included.

```
Reference     teenage.engineering
Steal         Real material cues: paper grain, metal bevel, plastic gloss, fabric.
              Physical metaphors that map to function. Depth that follows real light.
Structure     Every surface names a material. Light comes from one direction
              everywhere. Controls look pressable because they are bevelled.
Breaks if     The metaphor is decorative rather than functional, or the lighting
              direction is inconsistent between elements.
Load          skills/ui-18-skeuomorphism/SKILL.md
```

---

## 19 — Isometric UI (Faux-3D Angle)

A 2D plane rotated to a fixed isometric projection. Depth without perspective.

```
Reference     icograms.com
Steal         `transform: rotateX(55deg) rotateZ(-45deg)` on a plane, with content
              counter-rotated to stay readable. Consistent light from top-left.
              Grid-aligned tiles that stack in one direction.
Structure     A transformed container. Children on a tile grid. Elevation by
              translateZ or by offset shadow along one axis only.
Breaks if     Perspective is added (that is 3D, not isometric), or angles differ
              between elements.
Load          skills/ui-19-isometric/SKILL.md
```

---

## 20 — Parallax Scrolling UI

Layers moving at different rates to create depth during scroll.

```
Reference     firewatchgame.com
Steal         Background layers at 0.2–0.4× scroll speed, midground at 0.6×,
              foreground at 1×. Art direction does the depth work, not the effect.
              Long scroll with composed scenes.
Structure     Stacked absolutely-positioned layers in a tall container. Each layer
              translated on scroll by a different multiplier. `will-change: transform`.
Breaks if     Rate differences are extreme, or it runs on mobile without a
              reduced-motion path, or it causes jank from scroll-handler layout reads.
Load          skills/ui-20-parallax/SKILL.md
```

---

## 21 — Scrollytelling & Kinetic UI

Narrative driven by scroll position. The page is a timeline.

```
Reference     pudding.cool
Steal         Sticky visual pane + scrolling text pane. Chart or scene state driven
              by an IntersectionObserver or scroll progress value. Text steps that
              each advance the visual by one state.
Structure     A two-column layout: `position: sticky` visual, long text column.
              Each text block maps to one visual state. Progress is measured, not guessed.
Breaks if     The visual does not change per step, or scroll-jacking is used,
              or there is no reduced-motion fallback.
Load          skills/ui-21-scrollytelling-kinetic/SKILL.md
```

---

## 22 — Embedded 3D Object UI

A real 3D model, embedded in the page, usually interactive.

```
Reference     spline.design
Steal         A single hero object with slow idle rotation. Orbit limited to ±30deg.
              Model decimated to < 2MB. Environment lighting, not scene lights.
              Lazy-loaded below the fold.
Structure     A `<canvas>` in a sized container. Three.js scene with one model,
              one environment map, one camera. `requestAnimationFrame` gated by
              IntersectionObserver so it stops off-screen.
Breaks if     The canvas has no fallback image, or it loads before the fold content,
              or it runs at full rate on mobile.
Load          skills/ui-22-embedded-3d/SKILL.md
```

---

## 23 — WebGL & Shader-Driven UI

The visual is computed on the GPU. The page is a surface for a shader.

```
Reference     lusion.co
Steal         Full-viewport fragment shader as the background. Uniforms driven by
              pointer and time. Content sits above in a normal DOM layer with a scrim.
              A static fallback image for no-WebGL.
Structure     A `<canvas>` fixed behind content. A fragment shader with
              `u_time`, `u_resolution`, `u_pointer`. DPR capped at 2. Pause when
              hidden via `visibilitychange`.
Breaks if     There is no fallback, or the shader runs at full DPR on a 3x phone,
              or text sits directly on the shader without contrast protection.
Load          skills/ui-23-webgl-shader/SKILL.md
```

---

## 24 — Full 3D Interactive / Spatial WebXR UI

The page is a 3D space you navigate. Optionally VR/AR.

```
Reference     bruno-simon.com
Steal         A drivable/navigable world as the interface. Physics for feel.
              Content anchored to 3D objects. A persistent "how to move" hint.
              Aggressive LOD and asset streaming.
Structure     Three.js or R3F scene. A character or camera controller. Content
              planes in world space. A 2D DOM overlay for UI. Optional WebXR session.
Breaks if     There is no 2D fallback, or no keyboard path, or the first paint
              waits for the whole world.
Load          skills/ui-24-spatial-webxr/SKILL.md
```

---

## Selection Guide

Match the **brief's job** to the type, not the mood.

| The job | Type |
|---|---|
| Move information fast, no distraction | 01, 03 |
| Prove a structure before styling it | 02 |
| Look honest, unengineered, permanent | 03 |
| Communicate one brand color and be done | 04 |
| Signal taste, restraint, price | 05 |
| Publish content, own the headline | 06 |
| Explain a product gently | 07 |
| Be loud, be memorable, be cheap to build | 08 |
| Browse a large heterogeneous set | 09 |
| Present 6–10 features as one composition | 10 |
| Ship a system that scales across teams | 11 |
| Be a developer tool | 12 |
| Make a technical product feel alive | 13 |
| Layer content over imagery | 14 |
| Feel physical and soft without skeuomorphism | 15, 17 |
| Sell nostalgia or play | 16 |
| Feel crafted, tangible, expensive | 18 |
| Explain a system spatially | 19 |
| Create depth while telling one story | 20 |
| Explain data through narrative | 21 |
| Show one product from every angle | 22 |
| Be an experience, not a page | 23, 24 |

## Mixing Rules

Allowed pairs — structural + surface:

- 05 Swiss Grid **structure** + 14 Glassmorphism **surface**
- 10 Bento **structure** + 13 Aurora **surface**
- 06 Editorial **structure** + 20 Parallax **motion**
- 09 Masonry **structure** + 12 Layered Dark **surface**
- 02 Wireframe **structure** + 08 Neobrutalism **surface**
- 11 Material **structure** + 21 Scrollytelling **motion**
- 05 Swiss Grid **structure** + 22 Embedded 3D **surface**

Forbidden pairs — both structural, both surface, or contradictory:

- 03 Brutalist + 14 Glass (the point of 03 is absence)
- 15 Neumorphism + 12 Layered Dark (neumorphism needs mid-tones)
- 04 Pure Flat + 18 Skeuomorphism (contradiction)
- 08 Neobrutalism + 17 Claymorphism (contradiction)
- 16 Y2K + 05 Swiss Grid (contradiction)

When in doubt: **one type, executed completely.** A perfect 05 beats a confused 05+14.

---

## The Two-Question Test

Before writing any CSS, answer these:

1. **What is the one thing this page must communicate?** If you cannot answer in a sentence, the page is not ready.
2. **What is the one type that serves it?** If you name two, you have not decided.

If you can answer both, build. If not, `ui-ux-director` answers them and hands back a direction in two lines.
