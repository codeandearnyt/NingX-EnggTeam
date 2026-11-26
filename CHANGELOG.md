# Changelog

All notable changes to NingX-EnggTeam. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

**Made by Nitin Sharma.**

---

## [1.0.2] — 2026-11-27

### Added

- **`desktop/` — a cross-platform installer app.** Electron + React 19 + TypeScript + Vite. One Aqua window, frameless with custom gel traffic lights, so the chrome is identical on Windows, macOS, and Linux rather than delegated to each OS widget layer.
  - Four operations: **Install**, **Update**, **Reinstall**, **Uninstall**.
  - Install clones `codeandearnyt/NingX-EnggTeam` into `~/.ningx-desktop/source` at depth 1, registers the marketplace, and runs `claude plugin install ningx-enggteam@ningx`.
  - Update runs `git fetch` + `git reset --hard origin/main`, then `claude plugin marketplace update ningx` and `claude plugin update ningx-enggteam@ningx`.
  - Uninstall reverses all of it and deletes the source tree and state file.
  - Harness detection for Claude Code, Codex, OpenCode, Cursor, Copilot, Antigravity, and Windsurf. A missing harness is a warning, not a failure.
  - `electron-builder.yml` targets NSIS, DMG, AppImage, and deb, publishing to this repo's releases.
  - `scripts/smoke.js` runs all four operations against a throwaway `HOME` and asserts the filesystem at each step.
- **`.github/workflows/desktop.yml`** — matrix build on `windows-latest`, `macos-latest`, and `ubuntu-latest`. Push a `desktop-v*` tag to publish a release.

### Changed

- Root `README.md` gained a Desktop app section under Install.
- **Window controls are now platform-correct.** macOS uses `titleBarStyle: "hiddenInset"` and the OS draws the real traffic lights — the renderer draws none and reserves 84 px for them. Windows and Linux stay `frame: false` with the three gel dots, since neither has a native dot affordance. The surface (titlebar gradient, body, buttons) stays identical on all three; only the controls differ.
- `preload.ts` exposes `platform`. The browser mock accepts `?platform=darwin` so both chromes can be reviewed without a Mac.

### Verified

- `npm run typecheck` — clean on both tsconfigs.
- `npm run build` — main 4.0 KB, renderer 232.9 KB JS / 9.4 KB CSS.
- `node scripts/smoke.js` — `SMOKE PASSED`: clone, state file, version, 40-char commit, 24 UI skills, update, reinstall, uninstall, clean removal.
- `NingX Installer.exe --selftest` — bridge is an object, 8 buttons render, `border-radius: 999px` proves the stylesheet applied, 7 harnesses detected.
- `npm run dist:win` — `NingX Installer-1.0.0-setup.exe`, 78.3 MB.

---

## [1.0.1] — 2026-11-27

### Fixed

- `plugin.json` no longer declares `agents` / `skills` / `commands` as directory paths. `claude plugin install` rejected the manifest with `agents.0: Invalid string: must end with ".md"`. The root layout is auto-discovered, so the arrays were redundant as well as wrong.
- `commands/README.md` moved to `docs/commands.md` — a README inside `commands/` was being loaded as a slash command.
- `marketplace.json` dropped `metadata.author`; the field is unknown to the loader and produced a validation warning.

### Added

- **Hook profiles.** `ui-guard.py` now reads `CLAUDE_PLUGIN_OPTION_HOOKS_ENABLED` and `CLAUDE_PLUGIN_OPTION_HOOK_PROFILE`, which Claude Code exports from the `userConfig` block. The two options were previously declared but ignored.
  - `minimal` — the eight non-negotiables that have a mechanical check.
  - `standard` *(default)* — the previous full set.
  - `strict` — adds `STYLE-01`, a `border-radius` scale check.
- `assets/icon.png` — 1024 px grid mark. `.claude-plugin/plugin.json` sets `icon`.
- `repository` and `homepage` in `plugin.json`.

### Verified

- `claude plugin validate .` — passes with zero errors and zero warnings.
- `claude plugin install ningx-enggteam@ningx` — installs, 38 skills, 12 agents, 2 hooks.
- Guard behaviour across all three profiles, plus `hooks_enabled=false`.

---

## [1.0.0] — 2026-11-27

### Added

- `AGENTS.md` — the constitution: team table, 24-type table, design law, work loop, enforcement layers, ten non-negotiables.
- `DESIGN-LAW.md` — all 24 UI types with reference site, structural signature, what to steal, what breaks it, and the skill that teaches it. Selection guide and mixing matrix.
- `agents/` — 12 senior roles.
- `skills/` — 24 UI-type skills, each with a runnable HTML scaffold, plus 7 craft skills.
- `rules/` — 8 always-loaded rule files.
- `hooks/` — `ui-guard.py` (PreToolUse) and `session-brief.py` (SessionStart).
- `commands/` — 7 workflows.
- `references/` — the type index and the checklists.
- `docs/` — install, harnesses, FAQ.
- `USE.md` — the usage manual.
- `LICENSE` — NingX-EnggTeam License v1.0 (Attribution & No-Rebranding).

---

[NingX-EnggTeam License v1.0 (Attribution & No-Rebranding)](LICENSE)
