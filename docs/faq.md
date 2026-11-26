# FAQ

**Why 24 UI types? Why not a single design system?**

A single system produces a single look. That is the problem the repo exists to solve: given no direction, a model builds the same page every time — dark gradient hero, three cards, Inter, 12px radius. Naming the type forces a decision before the first line of markup, and the reference site gives that decision a concrete target.

**Do I have to use all 24?**

No. A five-page site needs three or four distinct types. The catalog exists so the choice is deliberate, not so every type gets used.

**Can a page use more than one type?**

Two maximum: one structural, one surface. Three is mush. `hooks/ui-guard.py` blocks a third `ui-type:` comment.

**What counts as "structural" vs "surface"?**

Structural sets the layout and the reading rhythm — grid, masonry, bento, editorial columns. Surface sets the material — glass, clay, aurora, neumorphism. A structural type on the whole page, a surface type on one band of it.

**Why is `border-radius: 12px` banned?**

Because it is the value that appears when nobody chose. Every generated card, button, and input lands on 12px. A design system uses a scale (4/8/16/24) or zero. The ban is not about 12px being ugly — it is about 12px being unchosen.

**Why is the gradient hero banned?**

A gradient with no light source, no depth, and no function is decoration standing in for a decision. Stripe's gradient works because it models light and sits under a specific composition. A purple-to-blue rectangle behind a centred headline is the same gradient with none of the work.

**Is the anti-slop review subjective?**

Some of it. C4 ("does the gradient do anything") needs judgement. But 18 of the 24 checks are mechanical: count the accents, grep the hex, measure the contrast, test 320px. The subjective ones are written as questions with a stated failure mode, so the argument is about the answer, not the criterion.

**Why two type families maximum?**

Three families is a hierarchy problem disguised as a font problem. If you need a third, the scale is not doing its job. Mono is the exception — it is a data signal, not a voice.

**Why 15–18px body text?**

14px on desktop is a readability cost with no compensating benefit. 20px is a mobile-scale choice applied to a wide measure. 15–18px is the range where a 65-character line stays comfortable at normal viewing distance.

**Why is `outline: none` a hard block?**

Because it removes the only signal a keyboard user has. If the focus ring clashes with the design, redesign the ring — two-tone, offset, whatever fits. Do not delete it.

**Why does the guard allow hex in `tokens.css`?**

Because that file is the source of the values. Everywhere else reads `var(--token)`. The rule is not "no hex exists", it is "no hex outside the layer that owns it."

**The guard blocked my write and I disagree. What now?**

Read the code it printed. Each violation names the rule and the fix. If the rule is genuinely wrong for the case, the guard is a floor, not a ceiling — but the fix is usually correct and the disagreement is usually about wanting to ship faster.

**Does this work without Claude Code?**

Yes. `AGENTS.md` plus a skill file is the whole system. See `docs/harnesses.md` for the per-harness wiring.

**Does it work with Vue / Svelte / Astro / plain HTML?**

The skills are framework-agnostic — the scaffolds are plain HTML and CSS. The agents mention React patterns for state and data fetching; translate the principle, not the syntax.

**How do I add a 25th UI type?**

Don't. If a page does not fit one of the 24, it fits the closest one with a documented deviation. The catalog's value is that it is closed — a 25th type is usually a page that has not decided what it is.

**How do I update it?**

It is a folder of markdown. Edit the files, bump `VERSION`, and re-install if the harness caches a copy.

**Is the content specific to any client or brand?**

No. The reference sites are named as targets, not copied. The scaffolds are original. Nothing here reproduces another company's assets, copy, or code.
