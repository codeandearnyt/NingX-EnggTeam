# Harness Support

What loads where, and what you have to wire yourself.

## Support matrix

| Harness | `AGENTS.md` | `skills/` | `rules/` | `agents/` | `commands/` | Hooks |
|---|---|---|---|---|---|---|
| **Claude Code** | auto | auto | auto | auto | auto | auto via `hooks.json` |
| **Codex** | auto | manual path | manual path | — | — | — |
| **OpenCode** | auto | manual path | via `instructions` | — | — | — |
| **Cursor** | via `.cursor/rules` | manual path | convert to `.mdc` | — | — | — |
| **Copilot** | `.github/copilot-instructions.md` | manual path | manual path | — | — | — |
| **Windsurf** | auto or `.windsurfrules` | manual path | manual path | — | — | — |
| **Antigravity** | auto | manual path | manual path | — | — | — |
| **Qoder** | auto | manual path | manual path | — | — | — |
| **Anything else** | paste into system prompt | paste the skill | paste the rule | paste the role | — | run by hand |

"Auto" means the harness reads the file from the repo root without configuration. "Manual path" means you reference the file in the prompt or the harness config.

## Claude Code — full support

Everything loads. This is the only harness with the hook wired automatically.

```
/plugin marketplace add /path/to/NingX-EnggTeam
/plugin install ningx-enggteam@ningx
```

Then the commands exist:

```
/pick-ui-type pricing page for a dev tool
/build-page pricing page, three tiers, annual toggle
/audit-page src/pages/Pricing.tsx
/ship-check pricing
```

## Codex

Codex reads `AGENTS.md` at the repo root. It does not discover `skills/`.

Two options:

**Per-project copy** — simplest, but the copy drifts:

```bash
cp /path/to/NingX-EnggTeam/AGENTS.md ./AGENTS.md
```

**Reference in the prompt** — no copy, no drift:

```
Read /path/to/NingX-EnggTeam/AGENTS.md first.
Then read /path/to/NingX-EnggTeam/skills/ui-10-bento-grid/SKILL.md.
Build the landing page to that standard.
```

## OpenCode

`opencode.jsonc` takes an `instructions` array. Point it at the constitution and the rules:

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

Load all eight rules only if you want the full weight. Three or four is usually enough; the rest are pulled on demand by the skills.

## Cursor

Cursor wants `.cursor/rules/*.mdc` with frontmatter. Convert:

```bash
mkdir -p .cursor/rules
for f in /path/to/NingX-EnggTeam/rules/*.md; do
  [ "$(basename "$f")" = "README.md" ] && continue
  name=$(basename "$f" .md)
  { printf -- '---\ndescription: %s\nalwaysApply: true\n---\n\n' "$name"; cat "$f"; } \
    > ".cursor/rules/$name.mdc"
done
```

Also drop `AGENTS.md` in the project root — newer Cursor builds read it.

## Copilot / VS Code

```bash
mkdir -p .github
cp /path/to/NingX-EnggTeam/AGENTS.md .github/copilot-instructions.md
```

For file-scoped instructions, `.github/instructions/*.instructions.md` with a `applyTo` glob works the same way as Cursor's rules.

## Antigravity

Reads `AGENTS.md` from the workspace root. Copy it in and point the agent at a skill path when a page needs a specific type.

## The universal fallback

Any harness that accepts a system prompt:

1. Paste `AGENTS.md`.
2. When a page needs a type, paste `skills/ui-NN-*/SKILL.md`.
3. When a component is being written, paste `rules/design-quality.md` and `rules/accessibility.md`.
4. Run `hooks/ui-guard.py` yourself, or skip it and rely on the review commands.

The rules do not depend on the harness. They are text.

## What does not transfer

| Thing | Why |
|---|---|
| Automatic skill discovery | Only Claude Code's plugin loader does this |
| Automatic hooks | Only Claude Code fires `PreToolUse` |
| `/command` slash commands | Only Claude Code and OpenCode resolve these |
| Subagent spawning | Only Claude Code and OpenCode have a mechanism |

Everything else — the constitution, the 24 types, the craft skills, the rules, the checklists — is portable text.
