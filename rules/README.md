# Rules

**NingX-EnggTeam** · Made by Nitin Sharma

Always-loaded behavioural rules. These are the floor the skills and agents build on.

| File | Covers |
|---|---|
| `design-quality.md` | The visual bar — UI type naming, two-type limit, palette, type, space, radius, copy |
| `anti-slop.md` | The banned patterns list — copy, structure, CSS, HTML, JS, assets |
| `frontend-craft.md` | Folder boundaries, component tiers, state placement, four list states, data fetching |
| `backend-craft.md` | Layering, validation, authorization placement, error contract, pagination, transactions, migrations, secrets |
| `accessibility.md` | WCAG 2.2 AA — contrast, focus, semantics, forms, motion, target size, keyboard pass |
| `performance.md` | Core Web Vitals budgets and the rules that keep a page inside them |
| `security.md` | Injection, XSS, authorization, redirects, uploads, secrets, dependencies |

## How these load

| Harness | Mechanism |
|---|---|
| Claude Code | `rules/*.md` referenced from `AGENTS.md`; loaded on session start |
| Codex | Same, via the plugin's `AGENTS.md` |
| OpenCode | `AGENTS.md` at project root |
| Any other | Paste `AGENTS.md` into the system prompt and let it reference these files |

## The precedence order

When two rules conflict:

1. `AGENTS.md` — the constitution
2. `DESIGN-LAW.md` — the 24-type catalog
3. `rules/` — these files
4. `skills/*/SKILL.md` — the on-demand detail
5. `agents/*.md` — the role definitions

A rule never overrides the constitution. A skill never overrides a rule. An agent never overrides a skill.

## The hard-fail set

These are enforced mechanically by `hooks/ui-guard.py` on write:

| Violation | Rule |
|---|---|
| A third `ui-type:` comment in one file | design-quality R2 |
| Hex literal in a component's CSS | design-quality R4 |
| `transition: all` | performance R6 / anti-slop |
| `outline: none` with no replacement | accessibility R2 |
| `<img>` without `alt` | accessibility R7 |
| `<input>` without an associated label | accessibility R5 |
| `<div onclick>` | accessibility R3 |
| Animation with no `prefers-reduced-motion` in the file | accessibility R8 |
| Banned marketing copy | anti-slop |
| `href="#"` | anti-slop |
| `lorem ipsum` / `TODO` / `coming soon` | anti-slop |
| `dangerouslySetInnerHTML` without `DOMPurify` | security R2 |
| Hardcoded secret pattern | security R6 |

Everything else is caught by review: `anti-slop-review`, `qa-lead`, `accessibility-lead`, `performance-engineer`.
