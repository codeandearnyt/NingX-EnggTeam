# NingX Installer

A desktop app for **NingX-EnggTeam**. One Aqua interface, identical on Windows, macOS, and Linux.

Four buttons: **Install**, **Update**, **Reinstall**, **Uninstall**. It pulls the repo from GitHub, wires it into whichever harnesses it finds, and tells you what it did.

**Made by Nitin Sharma.**

---

## Why Electron

The requirement was that the core and the UI be *the same* on all three platforms. That rules out anything that hands the widget layer to the operating system.

| Option | Why not |
|---|---|
| Tkinter / Qt / wxWidgets | The OS draws the controls, so the UI is different on each one |
| Flutter | Same UI, but a second toolchain and a 40 MB runtime to hand-render |
| Tauri | Same UI, but the webview is WebView2 / WKWebView / WebKitGTK — three engines, three sets of quirks, and no macOS build without a Mac |
| **Electron** | One Chromium, one renderer, one CSS file. Pixel-identical everywhere |

The cost is size: ~78 MB for the Windows installer. The benefit is that `aqua.css` is the entire visual system and it renders the same on all three.

---

## What it actually does

State lives in `~/.ningx-desktop`:

```
~/.ningx-desktop/
  source/      shallow clone of codeandearnyt/NingX-EnggTeam
  state.json   installed, version, commit, installedAt
```

| Button | What runs |
|---|---|
| **Install** | `git clone --depth 1` → `claude plugin marketplace add <source>` → `claude plugin install ningx-enggteam@ningx` → write state |
| **Update** | `git fetch` + `git reset --hard origin/main` → `claude plugin marketplace update ningx` → `claude plugin update ningx-enggteam@ningx` |
| **Reinstall** | Uninstall, then Install |
| **Uninstall** | `claude plugin uninstall` → `claude plugin marketplace remove` → delete `source/` and `state.json` |

Every step is optional-tolerant: a harness that is not installed is skipped with a warning, not a crash. If the Claude Code CLI is missing entirely, the repo is still downloaded and the log tells you to copy `AGENTS.md` manually.

The app never writes inside your projects. Claude Code stays the source of truth for what it has loaded.

### Harness detection

| Harness | Detected by | Wiring |
|---|---|---|
| Claude Code | `claude` on PATH, or `~/.claude` | marketplace + plugin |
| Codex | `codex`, or `~/.codex` | `AGENTS.md` |
| OpenCode | `opencode`, or `~/.config/opencode` | `instructions[]` |
| Cursor | `cursor`, or `~/.cursor` | `.cursor/rules/*.mdc` |
| Copilot / VS Code | `code`, or `~/.github` | `.github/copilot-instructions.md` |
| Antigravity | `~/.antigravity` | `AGENTS.md` |
| Windsurf | `~/.codeium/windsurf` | `AGENTS.md` |

Detection is deliberately shallow. A wrong "installed" badge is worse than a missing one.

### Two kinds of update

These are separate and the UI keeps them separate:

- **Update** (one of the four big buttons) pulls a newer *NingX-EnggTeam* into `~/.ningx-desktop`.
- **Check app update** (footer) replaces the *app binary* through `electron-updater` and GitHub Releases.

The second needs a published release with a `latest.yml` beside the artifact. Until one exists it reports "no update" and nothing breaks.

---

## Build

```bash
cd desktop
npm install
npm run build        # tsc for main + vite for renderer
npm start            # runs the built app
```

Platform packages:

```bash
npm run dist:win     # NSIS .exe
npm run dist:mac     # .dmg (x64 + arm64) — needs macOS
npm run dist:linux   # AppImage + .deb
```

Output lands in `desktop/release/`.

### CI builds all three

`.github/workflows/desktop.yml` runs `windows-latest`, `macos-latest`, and `ubuntu-latest` in parallel. Push a tag to publish a release:

```bash
git tag v1.0.2        # must match desktop/package.json "version"
git push origin v1.0.2
```

electron-builder creates the release as `v<version>`, so the tag and the version have to agree or the two refs diverge. That release is what the in-app updater reads — the `latest.yml`, `latest-mac.yml`, and `latest-linux.yml` on it are the feed.

A `workflow_dispatch` run builds all three without publishing, which is the cheap way to check the matrix.

---

## Verify it works

There are two checks, both runnable without clicking anything.

**1. Operations, against a throwaway HOME.** Clones the real repo, checks the state file, updates, reinstalls, uninstalls, and asserts the filesystem each time. `claude` is removed from PATH so it exercises the no-harness branch.

```bash
# from desktop/
$env:USERPROFILE = "$env:TEMP\ningx-smoke-home"   # PowerShell
$env:HOME = $env:USERPROFILE
node scripts/smoke.js
```

Expected tail: `SMOKE PASSED`.

**2. The real app, against the real bridge.** Loads the packaged renderer, calls `window.ningx.status()` over IPC, and dumps what it found.

```bash
"release\win-unpacked\NingX Installer.exe" --selftest
# SELFTEST {"bridge":"object","title":"NingX Installer","buttons":[...],
#           "harnesses":0,"cssLoaded":"999px","installed":false,
#           "gitFound":true,"detected":["claude-code",...]}
```

`cssLoaded: "999px"` is the gel-button radius — proof the stylesheet applied.

---

## The Aqua surface

`src/styles/aqua.css` is the whole visual system. Tiger-era Aqua, drawn in CSS:

- pinstripe body over a soft radial wash
- brushed-metal titlebar with three gel traffic lights
- gel buttons: a three-stop vertical gradient, an inset white top highlight, and a `::after` gloss covering the top 48%
- a pressed state that drops the gloss and inverts to an inset shadow
- sunken well for the log: `inset 0 1px 3px` and a 1px white line underneath
- indeterminate progress bar with animated candy stripes
- `prefers-reduced-motion` collapses every animation and freezes the bar

The window is frameless on Windows and Linux and the traffic lights are ours, so the chrome matches even though neither OS has a native equivalent.

### Window chrome, per platform

The controls are **not** forced to be identical — that would look wrong on a Mac. What is identical is the surface: the same titlebar gradient, the same body, the same buttons.

| Platform | Window | Controls |
|---|---|---|
| **macOS** | `titleBarStyle: "hiddenInset"` | **Native traffic lights.** macOS draws them, they behave the way the OS says they should — hover reveals the glyphs, ⌥-click zooms, the window menu works. The renderer draws no dots and reserves 84 px on the left for them. |
| **Windows** | `frame: false` | Three gel dots at the left, wired to the IPC window controls. Windows has no native dot affordance, so drawing one is the honest option. |
| **Linux** | `frame: false` | Same three gel dots. Window-manager bindings (Alt-drag, Alt-F4) still work. |

`preload.ts` exposes `platform`, and `TitleBar.tsx` branches on it:

```tsx
const mac = window.ningx?.platform === "darwin";
// ...
{mac ? null : <div className="titlebar__lights">…</div>}
```

On macOS the title is absolutely centred, so the native lights do not push it off-centre. The drag strip is the full bar either way.

### Preview the UI in a browser

```bash
npm run build:renderer
npm run preview:ui     # http://localhost:5273
```

`src/mock.ts` installs a stand-in bridge when `window.ningx` is absent, so the layout can be reviewed without launching Electron. Append `?platform=darwin` or `?platform=win32` to see either chrome:

```
http://localhost:5273/?platform=darwin
```

In the real app the preload script wins and the mock is a no-op.

---

## Layout

```
desktop/
  electron/
    main.ts              window, IPC, --selftest
    preload.ts           the only bridge; operation names are a closed set
    core/
      exec.ts            where/which, spawn, .cmd wrapper, line streaming
      harnesses.ts       detection
      installer.ts       install / uninstall / reinstall / update + state
      updater.ts         app self-update via electron-updater
  src/
    App.tsx              the one screen
    mock.ts              browser-preview bridge
    types.ts             everything that crosses the bridge
    components/          TitleBar, AquaButton, ProgressBar, StatusWell, HarnessList
    styles/aqua.css      the entire look
  scripts/smoke.js       the operation test
  electron-builder.yml   NSIS / DMG / AppImage + deb, GitHub publish
```

---

## Notes

- **git is required.** The installer pulls with git. If it is missing the app says so in a banner instead of failing silently.
- **`claude` is required for the plugin half.** Without it you get the repo and a warning, which is still useful — `AGENTS.md` works on its own.
- **Windows `.cmd` shims.** npm-global CLIs are `.cmd` files, which Node refuses to spawn directly since the CVE-2024-27980 fix. `exec.ts` wraps them in `cmd.exe /d /s /c` with the whole command in one extra pair of quotes, which `/s` strips back off.
- **Unsigned builds.** Windows SmartScreen and macOS Gatekeeper will warn on first launch. Signing needs a certificate; the build works without one.
- **macOS artifacts need macOS.** CI covers it. Cross-building a `.dmg` from Windows is not supported.

---

NingX-EnggTeam License v1.0 (Attribution & No-Rebranding). See [`../LICENSE`](../LICENSE).
