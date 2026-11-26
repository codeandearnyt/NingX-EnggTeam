# How to Use NingX-EnggTeam

**NingX-EnggTeam** — Senior Web Engineering Team
**Made by Nitin Sharma**

A complete usage manual. Follow it top to bottom the first time; after that, jump to the section you need.

---

## Contents

1. [What this actually does](#1-what-this-actually-does)
2. [Install — Claude Code](#2-install--claude-code)
3. [Install — every other harness](#3-install--every-other-harness)
4. [Your first build, step by step](#4-your-first-build-step-by-step)
5. [The 24 UI types and when to use each](#5-the-24-ui-types-and-when-to-use-each)
6. [The seven commands](#6-the-seven-commands)
7. [The twelve roles](#7-the-twelve-roles)
8. [The eight rule files](#8-the-eight-rule-files)
9. [The guard — what it blocks](#9-the-guard--what-it-blocks)
10. [Worked examples](#10-worked-examples)
11. [Troubleshooting](#11-troubleshooting)
12. [Customising it for your team](#12-customising-it-for-your-team)

---

## 1. What this actually does

Most AI coding tools, given no direction, produce the same page: a dark gradient hero, three identical feature cards, Inter at 16px, `border-radius: 12px`, and a headline that says "Elevate your workflow."

That is not a model failure. It is a **direction failure**. Nothing told it what kind of page this was, so it produced the average of every page it has seen.

This repo fixes it at three layers:

| Layer | What it is | When it acts |
|---|---|---|
| **Rules** (`rules/*.md`) | Always-loaded behavioural constraints | Before any code exists |
| **Skills** (`skills/*/SKILL.md`) | On-demand deep knowledge, with a runnable scaffold and a self-check | While the work is happening |
| **Guard** (`hooks/ui-guard.py`) | A `PreToolUse` hook that exits `2` and blocks the write | At the moment the file is written |

Plus **12 agent roles** that own specific decisions and **7 commands** that run the workflows.

**The core idea:** every page must declare which of 24 named UI types it is, and which reference site defines the standard. That single declaration kills the default look, because the model can no longer produce "a page" — it has to produce *a Swiss grid* or *a bento grid* or *an editorial layout*.

---

## 2. Install — Claude Code

Claude Code gets full support: agents, skills, rules, commands, and hooks all load automatically.

### 2.1 Add the marketplace

```bash
claude plugin marketplace add codeandearnyt/NingX-EnggTeam
```

Or, if you have the repo cloned locally:

```bash
claude plugin marketplace add /absolute/path/to/NingX-EnggTeam
```

### 2.2 Install the plugin

```bash
claude plugin install ningx-enggteam@ningx
```

### 2.3 Verify

```bash
claude plugin list
```

You should see:

```
ningx-enggteam  1.0.0  enabled
```

### 2.4 First run

Start a session and try:

```
/pick-ui-type  pricing page for a dev tool, three tiers, annual toggle
```

If you get a recommendation with a reference site and a reason, it is installed correctly.

### 2.5 Update later

```bash
claude plugin update ningx-enggteam@ningx
```

### 2.6 Alternative: load without installing

```bash
claude --plugin-dir /absolute/path/to/NingX-EnggTeam
```

Useful for testing a local edit without touching the installed copy.

---

## 3. Install — every other harness

Only Claude Code gets automatic everything. Everywhere else, `AGENTS.md` is the entry point.

### 3.1 Codex

Codex reads `AGENTS.md` from the repo root automatically.

```bash
cd /path/to/your-project
cp /path/to/NingX-EnggTeam/AGENTS.md ./AGENTS.md
```

Then, when a page needs a specific type, point at the skill in your prompt:

```
Read AGENTS.md.
Then read /path/to/NingX-EnggTeam/skills/ui-10-bento-grid/SKILL.md.
Build the landing page to that standard.
```

### 3.2 OpenCode

Add the instruction paths to `opencode.jsonc`:

```jsonc
{
  "instructions": [
    "/path/to/NingX-EnggTeam/AGENTS.md",
    "/path/to/NingX-EnggTeam/DESIGN-LAW.md",
    "/path/to/NingX-EnggTeam/rules/design-quality.md",
    "/path/to/NingX-EnggTeam/rules/anti-slop.md",
    "/path/to/NingX-EnggTeam/rules/accessibility.md"
  ]
}
```

Loading all eight rules is optional. Three or four covers most work; the rest get pulled in by the skills when needed.

### 3.3 Cursor

Cursor wants `.cursor/rules/*.mdc`. Convert:

```bash
mkdir -p .cursor/rules
for f in /path/to/NingX-EnggTeam/rules/*.md; do
  [ "$(basename "$f")" = "README.md" ] && continue
  name=$(basename "$f" .md)
  { printf -- '---\ndescription: %s\nalwaysApply: true\n---\n\n' "$name"; cat "$f"; } \
    > ".cursor/rules/$name.mdc"
done
```

Also drop `AGENTS.md` into the project root — newer Cursor builds read it.

### 3.4 Copilot / VS Code

```bash
mkdir -p .github
cp /path/to/NingX-EnggTeam/AGENTS.md .github/copilot-instructions.md
```

### 3.5 Windsurf / Antigravity / Qoder

All read `AGENTS.md` from the workspace root. Copy it in and reference skill paths when you need one.

### 3.6 Anything else

Paste `AGENTS.md` into the system prompt. When a page needs a type, paste `skills/ui-NN-*/SKILL.md` as well. That is the whole integration — the rules are portable text.

Full per-harness detail: [`docs/harnesses.md`](docs/harnesses.md).

---

## 4. Your first build, step by step

This is the loop. Follow it once and the shape becomes obvious.

### Step 1 — Pick the UI type

```
/pick-ui-type  landing page for a 3-person dev tools company
```

You get back something like:

```
RECOMMENDATION — / (home)

Structural: 10-bento-grid
Reference:  linear.app
Reason:     three unequal-weight capabilities, each needs its own cell
            size; a bento frame makes the hierarchy structural instead
            of typographic
Cost:       cells become arbitrary if the content is not genuinely
            unequal — check before committing

Surface:    13-aurora-mesh-gradient, hero band only
Reason:     one atmospheric moment, then get out of the way

Rejected:   05-swiss-grid (needs sparser content)
            09-masonry (nothing to browse)

Load: skills/ui-10-bento-grid, skills/ui-13-aurora-mesh-gradient
```

**Why this matters:** you have now committed to a specific visual system with a specific reference. The model cannot fall back to the default.

### Step 2 — Build it

```
/build-page  landing page, 3 capabilities of unequal weight, one CTA
```

The command:
1. Reads `DESIGN-LAW.md` and the two matching skills
2. Writes a direction block (palette, type, composition, largest thing)
3. Builds the page with tokens, semantic HTML, four list states, motion rules
4. Runs the 24-check anti-slop review
5. Reports numbers

You get back:

```
PAGE: /
UI type: 10 (structural) + 13 (surface, hero band)
Anti-slop: PASS
LCP 1.2s · CLS 0.00 · INP 60ms · JS 74KB gz
Widths checked: 320 / 768 / 1440 / 2560
Keyboard: pass · Reduced motion: pass
```

### Step 3 — Audit what it built

```
/audit-page  src/pages/Home.tsx
```

Read-only. Returns a numbered list of violations or a PASS. Run this before you look at the page yourself — it catches the mechanical stuff so your eyes are free for the judgement calls.

### Step 4 — Ship check

```
/ship-check  home
```

Every gate. No conditional pass:

```
Mechanical:      PASS (0 hits)
Anti-slop:       PASS
Accessibility:   PASS (axe 0 critical, keyboard pass)
Performance:     LCP 1.2s · CLS 0.00 · INP 60ms · JS 74KB gz
Responsive:      PASS (8 widths + 200% zoom)
Reduced motion:  PASS

VERDICT: SHIP
```

### Step 5 — Next page

Repeat from Step 1. **A five-page site should use three or four different types.** If every page comes back with the same recommendation, the content is probably too similar — or you are describing the pages the same way.

---

## 5. The 24 UI types and when to use each

Every type has a skill at `skills/ui-NN-*/SKILL.md` containing the signature, tokens, anatomy, a complete runnable HTML scaffold, anti-patterns, responsive notes, and accessibility notes.

| # | Type | Reference | Reach for it when |
|---|---|---|---|
| 01 | Text-Only / Terminal | ycombinator.com | The audience is technical and the content is the design |
| 02 | Wireframe / Low-Fi | balsamiq.com | You are prototyping and want the structure judged, not the styling |
| 03 | Brutalist HTML | berkshirehathaway.com | Speed and substance are the brand; decoration would be a lie |
| 04 | Pure Flat | mailchimp.com | Calm, functional, zero depth — product UI and clean marketing |
| 05 | Minimalist / Swiss Grid | aesop.com | Sparse, expensive content; restraint is the message |
| 06 | Editorial / Typographic | bloomberg.com | Dense writing, real journalism, authority through type |
| 07 | Line-Art & Hand-Drawn | notion.so | Warm, human, approachable — tooling and knowledge products |
| 08 | Neobrutalism | gumroad.com | Loud, opinionated, indie — hard borders, saturated fills |
| 09 | Card-Based & Masonry | pinterest.com | Many heterogeneous visual items; browsing is the task |
| 10 | Bento Grid | linear.app | A few capabilities of genuinely unequal weight |
| 11 | Material (Elevated 2D) | google.com | A product surface that needs familiar, learnable affordances |
| 12 | Layered Dark Mode | vercel.com | Developer tools, consoles, dashboards, anything used at night |
| 13 | Aurora / Mesh Gradient | stripe.com | One atmospheric hero moment on an otherwise disciplined page |
| 14 | Glassmorphism | apple.com | A busy backdrop exists and the UI should float above it |
| 15 | Neumorphism | neumorphism.io | Soft physical controls — sparingly, contrast is a real risk |
| 16 | Retro / Y2K Glossy | poolsuite.net | Play, nostalgia, music, culture — chrome and bevels |
| 17 | Claymorphism | pitch.com | Friendly, rounded, 3D-soft — consumer and creative tools |
| 18 | Skeuomorphism | teenage.engineering | Physical metaphor carries real meaning for the product |
| 19 | Isometric | icograms.com | Systems, architecture, process — one projection, no perspective |
| 20 | Parallax Scrolling | firewatchgame.com | Depth and atmosphere; a narrative world to move through |
| 21 | Scrollytelling & Kinetic | pudding.cool | The scroll *is* the argument — data stories, explainers |
| 22 | Embedded 3D Object | spline.design | One product object worth rotating and inspecting |
| 23 | WebGL & Shader-Driven | lusion.co | The visual effect *is* the product or the pitch |
| 24 | Full 3D Interactive / WebXR | bruno-simon.com | Navigable space; a portfolio or experience as a place |

### The two-question test

**1. What is the content?**
Sparse → 05. Dense → 06. Visual and varied → 09. Unequal-weight features → 10. A sequence → 21. An object → 22. A place → 24.

**2. What does the brand need to say?**
Confidence → 05. Authority → 06. Warmth → 07 or 17. Volume → 08. Calm → 04. Precision → 12. Atmosphere → 13.

**If they conflict, the content wins.** A brand that wants "confidence" on a forty-item feed is still a forty-item feed.

### The mixing rule

**Two types maximum. One structural, one surface.**

| Valid | Why |
|---|---|
| `09-card-masonry` + `13-aurora` | Aurora as a hero band above a masonry feed |
| `05-swiss-grid` + `20-parallax` | One parallax image section inside a Swiss grid |
| `12-layered-dark` + `14-glassmorphism` | Glass nav over a dark console |
| `10-bento-grid` + `17-claymorphism` | Clay cells inside a bento frame |

| Invalid | Why |
|---|---|
| `08-neobrutalism` + `15-neumorphism` | Opposite light models |
| `11-material` + `17-claymorphism` | Two competing depth systems |
| `03-brutalist-html` + anything | Brutalism is the absence of style |
| `05-swiss-grid` + `10-bento-grid` | Two structural systems fighting |

**Three types on one page is mush.** The guard blocks a third `ui-type:` comment.

---

## 6. The seven commands

| Command | Read-only | What it does |
|---|---|---|
| `/pick-ui-type <brief>` | yes | Recommends one type with the reference site, the reason, and the cost |
| `/build-page <brief>` | no | Type → direction block → build → anti-slop audit → numbers |
| `/audit-page <file or url>` | yes | 24 anti-slop checks + a11y + width ladder + performance, numbered PASS/FAIL |
| `/design-tokens <brand color>` | no | Three-layer token system with dark mode and verified contrast |
| `/review-diff <branch>` | yes | Severity-ranked findings with file and line, then APPROVE or REQUEST CHANGES |
| `/ship-check <page>` | yes | Every gate, then SHIP or DO-NOT-SHIP |
| `/new-project <name>` | no | Folder structure, tokens, lint enforcement, CI, first page |

### The order

```
/new-project          once, at the start
  /pick-ui-type       per page, before anything is built
    /design-tokens    once per project, or when the brand changes
      /build-page     per page
        /audit-page   per page, before review
          /review-diff    per change
            /ship-check   at the end, and only then
```

### If your harness has no slash commands

Open the command file and follow it as a checklist. They are plain markdown:

```
commands/pick-ui-type.md
commands/build-page.md
commands/audit-page.md
commands/ship-check.md
```

---

## 7. The twelve roles

Each is a file in `agents/`. In Claude Code they can be invoked as subagents; everywhere else they are reference definitions you can paste or reference.

| Role | Owns |
|---|---|
| `web-architect` | Routes, rendering strategy, which UI type each page uses, dependency budget |
| `frontend-lead` | Component structure, state placement, data fetching, four list states |
| `backend-lead` | Endpoints, validation, authorization, error contract, migrations |
| `ui-ux-director` | Palette, type pairing, composition, the anti-slop verdict |
| `design-system-engineer` | Three-layer tokens, component library, dark mode, lint enforcement |
| `motion-engineer` | Durations, easings, choreography, scroll motion, reduced-motion path |
| `webgl-engineer` | WebGL/WebGPU, shaders, Three.js, XR, asset budget, fallbacks |
| `accessibility-lead` | WCAG 2.2 AA, contrast, keyboard, focus, target size |
| `performance-engineer` | LCP, CLS, INP, bundle size, render-blocking |
| `qa-lead` | Width ladder, four states, keyboard pass, verdict |
| `code-reviewer` | Correctness, security, data integrity, craft |
| `seo-engineer` | Semantics, metadata, structured data, crawlability |

### How to use a role without a subagent mechanism

Paste the role file into your prompt:

```
Read /path/to/NingX-EnggTeam/agents/ui-ux-director.md and act as that role
for this task: <your task>
```

The roles are written as mandates with a definition-of-done, so they work as prompt text as well as as agent definitions.

---

## 8. The eight rule files

These load every session. They are the floor.

| File | Covers |
|---|---|
| `rules/design-quality.md` | UI type naming, two-type limit, palette, type scale, space, radius, copy |
| `rules/anti-slop.md` | The banned patterns list — copy, structure, CSS, HTML, JS, assets |
| `rules/frontend-craft.md` | Folder boundaries, component tiers, state placement, four list states |
| `rules/backend-craft.md` | Layering, validation, authorization, error contract, pagination, migrations |
| `rules/accessibility.md` | WCAG 2.2 AA — contrast, focus, semantics, forms, motion, target size |
| `rules/performance.md` | Core Web Vitals budgets and the rules that keep a page inside them |
| `rules/security.md` | Injection, XSS, authorization, redirects, uploads, secrets, dependencies |
| `rules/README.md` | The precedence order and the hard-fail set |

### Precedence when two things conflict

```
AGENTS.md          the constitution
DESIGN-LAW.md      the 24-type catalog
rules/             the always-loaded rules
skills/            the on-demand detail
agents/            the role definitions
```

A rule never overrides the constitution. A skill never overrides a rule. An agent never overrides a skill.

---

## 9. The guard — what it blocks

`hooks/ui-guard.py` runs on every `Edit` / `Write` / `MultiEdit` and exits `2` on a violation, which blocks the write and shows the agent why.

### What it catches

| Code | Violation |
|---|---|
| `UI-01` | More than two `ui-type:` comments in one file |
| `UI-04` | Hex color literal in a component (outside `tokens.css`) |
| `PERF-01` | `transition: all` |
| `A11Y-02` | `outline: none` with no replacement focus style |
| `A11Y-03` | `<div onclick>` |
| `A11Y-05` | `<input>` / `<textarea>` / `<select>` with no label |
| `A11Y-07` | `<img>` without `alt` |
| `A11Y-08` | Animation with no `prefers-reduced-motion` in the file |
| `SLOP-01` | Banned marketing copy |
| `SLOP-02` | `lorem ipsum`, `TODO`, `coming soon`, `Company Name` |
| `SLOP-03` | `href="#"` |
| `SEC-02` | `dangerouslySetInnerHTML` / `v-html` / `innerHTML =` with no sanitizer |
| `SEC-03` | `eval()`, `new Function()`, `document.write()` |
| `SEC-06` | Hardcoded credential pattern |

### What it deliberately allows

- Anything in `node_modules/`, `dist/`, `build/`, `.next/`, `vendor/`, `coverage/`
- Hex values in `tokens.css` and any `tokens.*` file — that is the token layer
- `#` inside comments, URL fragments, anchor references
- Markdown and documentation files
- Any file it cannot parse

### Testing it by hand

```bash
echo '{"tool_input":{"file_path":"a.tsx","content":"<img src=\"x.png\">"}}' \
  | python3 hooks/ui-guard.py
echo "exit: $?"
# NINGX-ENGGTEAM UI-GUARD — blocked write to a.tsx
# [A11Y-07] 1 <img> without an alt attribute.
# exit: 2
```

```bash
echo '{"tool_input":{"file_path":"a.tsx","content":"<img src=\"x.png\" alt=\"\">"}}' \
  | python3 hooks/ui-guard.py
echo "exit: $?"
# exit: 0
```

### Using it without Claude Code

As a pre-commit hook:

```bash
#!/bin/sh
# .git/hooks/pre-commit
for f in $(git diff --cached --name-only --diff-filter=ACM); do
  content=$(git show ":$f")
  printf '{"tool_input":{"file_path":"%s","content":%s}}' \
    "$f" "$(printf '%s' "$content" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')" \
    | python3 /path/to/NingX-EnggTeam/hooks/ui-guard.py || exit 1
done
```

### Disabling it

Remove the `PreToolUse` block from `hooks/hooks.json`. There is no per-rule toggle — the rules are the rules.

---

## 10. Worked examples

### Example A — a marketing site

```
/pick-ui-type  marketing site for a payments API, technical audience
```

→ `06-editorial-typographic` (structural) — the audience reads, and density signals authority
→ `12-layered-dark` (surface, code blocks only)

```
/build-page  home page, payments API, three code samples, one CTA
/ship-check  home
```

Result: an editorial layout with serif display type, a dark code-block surface, real numbers in the copy, and a PASS verdict.

### Example B — a dashboard

```
/pick-ui-type  analytics dashboard, dense data, used daily by 4 people
```

→ `12-layered-dark` (structural) — precision, night use, developer-adjacent
→ `01-terminal-cli` (surface, the query panel)

```
/build-page  dashboard shell, sidebar nav, main chart area, data table
```

Key rules the build follows without being asked: four states on every list, cursor pagination, skeleton matching the real row height, `prefers-reduced-motion` on the chart animation.

### Example C — a portfolio

```
/pick-ui-type  personal portfolio for a creative developer, wants to be remembered
```

→ `24-spatial-webxr` (structural) — the portfolio is a place
→ fallback path required: flat scrollable version for no-WebGL and reduced-motion

```
/build-page  portfolio landing, one navigable 3D scene, contact section
```

The webgl-engineer rules apply: budget written before code, shader loops bounded, `dispose()` on teardown, a readable fallback that is not a blank canvas.

### Example D — an existing site that looks generic

```
/audit-page  src/pages/Home.tsx
```

```
AUDIT — Home
Verdict: FAIL (5 violations)

[S1] no ui-type comment — src/pages/Home.tsx
[C4] purple-to-pink gradient behind hero, no light source — Hero.tsx:22
[Sh1] every card at border-radius: 12px — Card.module.css:14
[Co1] "Elevate your billing workflow" — Hero.tsx:31
[T3] body text at 13px — global.css:8

LCP 3.1s (fail, budget 2.5s) · JS 214KB gz (fail, budget 170KB)
```

Fix in order of leverage: name the type, kill the gradient, fix the copy, move radius to a scale, bump the body size. Then re-audit.

---

## 11. Troubleshooting

**The commands do not appear in Claude Code.**
Check `claude plugin list`. If the plugin is not listed, re-run the install. If it is listed but the commands are missing, restart the session — commands load at session start.

**The guard blocks everything I write.**
It is scoped by file extension. If you are editing a `.md` file and it fires, that is a bug — the guard should skip docs. Check that the file extension is not `.html` inside a docs folder.

**The guard is too strict for my project.**
It is a floor, not a ceiling. Either fix the violations (they are usually correct) or remove the `PreToolUse` block from `hooks/hooks.json`.

**A skill's scaffold does not match my framework.**
The scaffolds are plain HTML and CSS on purpose — they are portable. Translate the structure and the tokens, not the syntax. The rules are framework-agnostic; the agents mention React patterns for state and data fetching, which you translate the same way.

**Every page comes back with the same UI type recommendation.**
You are probably describing the pages the same way. Give each page a distinct job in the brief: "compare three tiers" is not the same task as "read the changelog."

**`/pick-ui-type` says nothing fits.**
That means the page is stretching the catalog. Use the closest type and note the deviation. Do not invent a 25th type — the catalog's value is that it is closed.

**Python is not installed and the hooks fail.**
The skills and rules work without hooks. Remove the `PreToolUse` block and rely on `/audit-page` and `/ship-check` instead.

**Windows: `python3` is not found.**
`hooks.json` tries `python3` first and falls back to `python`. If neither exists, install Python 3.8+ or disable the hooks.

---

## 12. Customising it for your team

It is markdown. Edit it.

### Change the brand standard for a type

Open `skills/ui-NN-*/SKILL.md` and edit the signature, tokens, and anti-patterns. The scaffold is a complete working page — change it to match your house style.

### Add a house rule

Drop a new file in `rules/` and add it to the list in `rules/README.md`. Keep the frontmatter shape:

```yaml
---
name: my-house-rule
alwaysApply: true
description: One line on what this constrains and when.
---
```

### Tighten the guard

`hooks/ui-guard.py` has one function per check. Add a pattern to `BANNED_COPY`, or write a new `check_*` function and call it from `run_checks()`. Every check returns a list of `Violation` objects with a code, a message, and a fix.

### Change the palette defaults

`commands/design-tokens.md` carries the reference token set. Edit the primitives there and every project scaffolded with `/design-tokens` inherits the change.

### Remove what you do not use

Twenty-four UI types is a catalog, not a requirement. If your team only builds dashboards, delete the types you never touch and keep `12-layered-dark`, `01-terminal-cli`, and `10-bento-grid`. Nothing breaks — the guard only counts declarations, it does not require the full set.

### Bump the version

Edit `VERSION` and the `version` fields in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`. They must match or the plugin loader complains.

---

## Quick reference

```
Install (Claude Code)
  claude plugin marketplace add codeandearnyt/NingX-EnggTeam
  claude plugin install ningx-enggteam@ningx

The loop
  /pick-ui-type  ->  /build-page  ->  /audit-page  ->  /ship-check

The rule
  Name the UI type. Two types maximum. One accent. Tokens only.
  Numbers, not adjectives. No "done" without a check.

The guard
  exit 0  allow
  exit 2  blocked, with the rule and the fix

The files
  AGENTS.md       the constitution
  DESIGN-LAW.md   the 24 types
  rules/          8 always-loaded files
  skills/         24 UI types + 7 craft skills
  agents/         12 roles
  commands/       7 workflows
  hooks/          the guard
```

---

**NingX-EnggTeam** · Made by **Nitin Sharma**
