# Commands

**NingX-EnggTeam** · Made by Nitin Sharma

Six commands. Each is a workflow, not a prompt.

| Command | What it does | Read-only |
|---|---|---|
| `/build-page` | Picks the UI type, writes the direction block, builds, audits, reports numbers | no |
| `/audit-page` | 24 anti-slop checks + accessibility + width ladder + performance, numbered PASS/FAIL | yes |
| `/pick-ui-type` | Recommends one type from the 24, with the reference site, the reason, and the cost | yes |
| `/design-tokens` | Generates the three-layer token system with dark mode and contrast verification | no |
| `/review-diff` | Severity-ranked findings with file and line, then APPROVE or REQUEST CHANGES | yes |
| `/ship-check` | Every gate that must pass before "done". Returns SHIP or DO-NOT-SHIP | yes |
| `/new-project` | Folder structure, tokens, lint enforcement, CI, first page | no |

## The order they are used

```
/new-project          once, at the start
  /pick-ui-type       per page, before anything is built
    /design-tokens    once per project, or when the brand changes
      /build-page     per page
        /audit-page   per page, before review
          /review-diff    per change
            /ship-check   at the end, and only then
```

## The rule all six share

A claim without a check is not a result. Every command that reports a status runs the check that produces it, or says plainly that it did not.

`/ship-check` has no conditional pass. Either every gate clears or the build does not go.
