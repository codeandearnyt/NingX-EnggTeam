# Install

**NingX-EnggTeam** · Made by Nitin Sharma

NingX-EnggTeam is a plugin-shaped repo. It has no build step, no dependencies, and no network calls. It is markdown plus two Python scripts.

## What is in the box

```
NingX-EnggTeam/
  AGENTS.md              the constitution — every skill and agent inherits it
  DESIGN-LAW.md          the 24-type catalog with reference sites
  VERSION
  .claude-plugin/
    plugin.json          plugin manifest
    marketplace.json     marketplace entry
  agents/                12 senior roles
  skills/                24 UI-type skills + 7 craft skills
  rules/                 8 always-loaded rule files
  hooks/                 hooks.json + ui-guard.py + session-brief.py
  commands/              7 workflows
  references/            ui-types index, checklists
  docs/                  this folder
```

## Claude Code

```bash
# from the directory that contains NingX-EnggTeam
claude plugin marketplace add /absolute/path/to/NingX-EnggTeam
claude plugin install ningx-enggteam@ningx
```

Or point at it as a local plugin:

```bash
claude --plugin-dir /absolute/path/to/NingX-EnggTeam
```

Verify:

```bash
claude plugin list
# ningx-enggteam 1.0.0  enabled
```

Then in a session:

```
/pick-ui-type pricing page for a dev tool
```

## Codex

Codex reads `AGENTS.md` from the repo root. Copy or symlink it into the project you are working on, or run Codex with this directory as the working directory.

```bash
cd /path/to/your-project
cp /path/to/NingX-EnggTeam/AGENTS.md ./AGENTS.md
```

Codex does not load `skills/` automatically. Reference the skill path in the prompt:

```
Read /path/to/NingX-EnggTeam/skills/ui-05-swiss-grid/SKILL.md and build the pricing page to that standard.
```

## OpenCode

OpenCode reads `AGENTS.md` from the project root and any `instructions` paths in `opencode.jsonc`.

```jsonc
// opencode.jsonc
{
  "instructions": [
    "/absolute/path/to/NingX-EnggTeam/AGENTS.md",
    "/absolute/path/to/NingX-EnggTeam/DESIGN-LAW.md",
    "/absolute/path/to/NingX-EnggTeam/rules/*.md"
  ]
}
```

Skills are markdown; point the agent at the path when you need one.

## Cursor

Cursor reads `.cursor/rules/*.mdc`. Convert the rules:

```bash
mkdir -p .cursor/rules
for f in /path/to/NingX-EnggTeam/rules/*.md; do
  name=$(basename "$f" .md)
  { printf -- '---\ndescription: %s\nalwaysApply: true\n---\n\n' "$name"; cat "$f"; } \
    > ".cursor/rules/$name.mdc"
done
```

## Windsurf / Antigravity / Qoder / Copilot

All of them read `AGENTS.md` or a project-level instructions file. Copy `AGENTS.md` into the project root and, if the harness supports it, add `rules/` to the instruction list.

For Copilot:

```bash
mkdir -p .github
cp /path/to/NingX-EnggTeam/AGENTS.md .github/copilot-instructions.md
```

## Any harness at all

Paste `AGENTS.md` into the system prompt. When a page needs a specific type, paste the matching `skills/ui-NN-*/SKILL.md` as well. That is the whole integration.

## The hooks

`hooks/ui-guard.py` is a `PreToolUse` gate. It works with Claude Code out of the box via `hooks/hooks.json`.

For any other harness, run it yourself in a pre-commit hook:

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

## Verify the install

```bash
python3 /path/to/NingX-EnggTeam/hooks/ui-guard.py < /dev/null ; echo "exit: $?"
# exit: 0

echo '{"tool_input":{"file_path":"a.tsx","content":"<img src=\"x.png\">"}}' \
  | python3 /path/to/NingX-EnggTeam/hooks/ui-guard.py ; echo "exit: $?"
# NINGX UI-GUARD — blocked write to a.tsx
# [A11Y-07] 1 <img> without an alt attribute.
# exit: 2
```

## Requirements

- Python 3.8 or newer for the hooks
- Nothing else

The skills and rules are plain markdown. Any model that can read a file can follow them.
