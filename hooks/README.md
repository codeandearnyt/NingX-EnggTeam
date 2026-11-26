# Hooks

**NingX-EnggTeam** · Made by Nitin Sharma

Two Python hooks. No Node, no build step, no dependencies.

| File | Event | Purpose |
|---|---|---|
| `ui-guard.py` | `PreToolUse` on `Edit` / `Write` / `MultiEdit` | Blocks a write that violates the ten non-negotiables |
| `session-brief.py` | `SessionStart` | Prints the roster and the 24-type index |

## What `ui-guard.py` blocks

| Code | Check | Rule |
|---|---|---|
| `UI-01` | More than two `ui-type:` declarations in one file | design-quality R2 |
| `UI-04` | Hex color literal in a component (outside `tokens.css`) | design-quality R4 |
| `PERF-01` | `transition: all` | performance R6 |
| `A11Y-02` | `outline: none` with no replacement focus style | accessibility R2 |
| `A11Y-03` | `<div onclick>` | accessibility R3 |
| `A11Y-05` | `<input>` / `<textarea>` / `<select>` with no label | accessibility R5 |
| `A11Y-07` | `<img>` without `alt` | accessibility R7 |
| `A11Y-08` | Animation in a file with no `prefers-reduced-motion` | accessibility R8 |
| `SLOP-01` | Banned marketing copy | anti-slop |
| `SLOP-02` | `lorem ipsum`, `TODO`, `coming soon`, `Company Name` | anti-slop |
| `SLOP-03` | `href="#"` | anti-slop |
| `SEC-02` | `dangerouslySetInnerHTML` / `v-html` / `innerHTML =` with no sanitizer | security R2 |
| `SEC-03` | `eval()`, `new Function()`, `document.write()` | security R2 |
| `SEC-06` | Hardcoded credential pattern (`sk_live_`, `AKIA`, `ghp_`, PEM) | security R6 |

## What it deliberately does not block

- Anything in `node_modules/`, `dist/`, `build/`, `.next/`, `vendor/`, `coverage/`
- Hex values in `tokens.css` and any `tokens.*` file — that is the token layer
- `#` inside a comment, a URL fragment, or an anchor reference
- Markdown and documentation files — a README may quote a banned phrase while explaining it
- Any file the guard cannot parse

The guard is a **floor**, not a review. It catches the mechanical violations. The judgement calls — three-card rows, gradient heroes, hierarchy, silhouette — are caught by `anti-slop-review` and `qa-lead`.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | allow |
| `2` | block; stderr is shown to the agent |

An internal error in the guard always returns `0`. A guard bug must never break a session.

## Wiring

Claude Code reads `hooks/hooks.json` from the plugin root. `CLAUDE_PLUGIN_ROOT` is set by the harness.

The command tries `python3` first and falls back to `python` — Windows ships `python`, most Unix systems ship `python3`.

## Testing the guard by hand

```bash
echo '{"tool_input":{"file_path":"src/Card.tsx","content":"<img src=\"a.png\">"}}' \
  | python3 hooks/ui-guard.py
echo "exit: $?"
# expect: A11Y-07, exit 2
```

```bash
echo '{"tool_input":{"file_path":"src/Card.tsx","content":"<img src=\"a.png\" alt=\"\">"}}' \
  | python3 hooks/ui-guard.py
echo "exit: $?"
# expect: exit 0
```

## Disabling it

Remove the `PreToolUse` block from `hooks/hooks.json`, or unset the plugin. There is no per-rule toggle — the rules are the rules.
