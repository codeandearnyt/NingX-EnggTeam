# UI Types — Quick Index

24 types. Each has a skill at `skills/ui-NN-*/SKILL.md` with the full signature, tokens, anatomy, a runnable scaffold, and anti-patterns.

| # | Type | Reference | Skill | Signature |
|---|---|---|---|---|
| 01 | Text-Only / Terminal | ycombinator.com | `ui-01-terminal-cli` | Mono type, zero decoration, content is the design |
| 02 | Wireframe / Low-Fidelity | balsamiq.com | `ui-02-wireframe` | Hand-drawn boxes, annotation, deliberately unfinished |
| 03 | Brutalist HTML | berkshirehathaway.com | `ui-03-brutalist-html` | Default browser styles, zero CSS, speed as the aesthetic |
| 04 | Pure Flat | mailchimp.com | `ui-04-pure-flat` | No shadows, no gradients, color blocks only |
| 05 | Minimalist / Swiss Grid | aesop.com | `ui-05-swiss-grid` | Strict grid, one accent, huge negative space |
| 06 | Editorial / Typographic | bloomberg.com | `ui-06-editorial-typographic` | Serif display, dense columns, rules and kickers |
| 07 | Line-Art & Hand-Drawn | notion.so | `ui-07-line-art-handdrawn` | Thin strokes, illustrated marks, warm imperfection |
| 08 | Neobrutalism | gumroad.com | `ui-08-neobrutalism` | Hard black borders, offset shadows, saturated fills |
| 09 | Card-Based & Masonry | pinterest.com | `ui-09-card-masonry` | Variable-height tiles, image-led, infinite grid |
| 10 | Bento Grid | linear.app | `ui-10-bento-grid` | Unequal cells in one frame, each cell one idea |
| 11 | Material (Elevated 2D) | google.com | `ui-11-material-elevated` | Elevation shadows, ripple, rounded surfaces |
| 12 | Layered Dark Mode | vercel.com | `ui-12-layered-dark` | Near-black surfaces, hairline borders, luminance depth |
| 13 | Aurora / Mesh Gradient | stripe.com | `ui-13-aurora-mesh-gradient` | Soft multi-hue fields, light model, hero atmosphere |
| 14 | Glassmorphism | apple.com | `ui-14-glassmorphism` | Blur, translucency, a busy backdrop underneath |
| 15 | Neumorphism | neumorphism.io | `ui-15-neumorphism` | Dual shadows from one light source, low contrast |
| 16 | Retro / Y2K Glossy | poolsuite.net | `ui-16-retro-y2k` | Chrome, bevels, gloss, pixel type |
| 17 | Claymorphism | pitch.com | `ui-17-claymorphism` | Rounded 3D blobs, soft inner and outer shadow |
| 18 | Skeuomorphism | teenage.engineering | `ui-18-skeuomorphism` | Real materials, real controls, physical metaphor |
| 19 | Isometric | icograms.com | `ui-19-isometric` | One projection, 2:1 grid, no perspective |
| 20 | Parallax Scrolling | firewatchgame.com | `ui-20-parallax` | Layers at different rates, depth on scroll |
| 21 | Scrollytelling & Kinetic | pudding.cool | `ui-21-scrollytelling-kinetic` | Scroll drives narrative, pinned scenes |
| 22 | Embedded 3D Object | spline.design | `ui-22-embedded-3d` | One model, orbit control, fast first paint |
| 23 | WebGL & Shader-Driven | lusion.co | `ui-23-webgl-shader` | Full-screen fragment shader, canvas as the page |
| 24 | Full 3D Interactive / WebXR | bruno-simon.com | `ui-24-spatial-webxr` | Navigable space, pointer-lock or headset |

## Selection by job

| The visitor is… | Type |
|---|---|
| Reading one dense argument | 06 |
| Scanning many varied items | 09 |
| Comparing a small set | 05, 11 |
| Following a sequence | 21 |
| Looking at one object | 22, 19 |
| Being impressed | 13, 14, 23, 24 |
| Doing work fast | 12, 04, 01 |
| Being reassured | 04, 11, 18 |
| Being entertained | 08, 16, 17 |
| Reading structured data | 01, 06 |

## Mixing

**Two types maximum.** One structural, one surface.

| Valid | Why |
|---|---|
| 09 + 13 | Aurora as a hero band above a masonry feed |
| 05 + 20 | One parallax image section inside a Swiss grid |
| 12 + 14 | Glass nav over a dark console |
| 10 + 17 | Clay cells inside a bento frame |
| 06 + 07 | Line-art marks inside an editorial layout |

| Invalid | Why |
|---|---|
| 08 + 15 | Opposite light models |
| 11 + 17 | Two competing depth systems |
| 03 + anything | Brutalism is the absence of style |
| 05 + 10 | Two structural systems fighting |

## The two-question test

1. **What is the content?** Sparse → 05. Dense → 06. Visual → 09. Unequal → 10. Sequence → 21. Object → 22. Place → 24.
2. **What does the brand need to say?** Confidence → 05. Authority → 06. Warmth → 07 or 17. Volume → 08. Calm → 04. Precision → 12. Atmosphere → 13.

If they conflict, **the content wins**.

Full detail — signature, tokens, anatomy, scaffold, anti-patterns, responsive notes, accessibility notes — in `DESIGN-LAW.md` and the skill for each type.
