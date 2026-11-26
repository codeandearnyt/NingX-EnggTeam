/**
 * mock.ts — a stand-in bridge for browser preview.
 * ブラウザ確認用のモックブリッジ。
 *
 * When the renderer is opened in a plain browser (vite preview, a design
 * review, a screenshot) there is no preload script and `window.ningx` is
 * undefined. This keeps the UI usable instead of white-screening, and it is
 * only ever installed when the real bridge is absent.
 *
 * Made by Nitin Sharma.
 */

import type { LogLine, NingxBridge, Status } from "./types";

const STATUS: Status = {
  installed: true,
  version: "1.0.1",
  commit: "7c922ff4a1b2c3d4e5f60718293a4b5c6d7e8f90",
  installedAt: new Date().toISOString(),
  sourceDir: "~/.ningx-desktop/source",
  harnesses: [
    {
      id: "claude-code",
      label: "Claude Code",
      detected: true,
      bin: "/usr/local/bin/claude",
      wiring: "plugin marketplace + plugin install",
      managed: true,
    },
    {
      id: "codex",
      label: "Codex",
      detected: true,
      bin: "/usr/local/bin/codex",
      wiring: "AGENTS.md at the repo root",
      managed: false,
    },
    {
      id: "opencode",
      label: "OpenCode",
      detected: true,
      bin: "/usr/local/bin/opencode",
      wiring: "instructions[] in opencode.jsonc",
      managed: false,
    },
    {
      id: "cursor",
      label: "Cursor",
      detected: false,
      bin: null,
      wiring: ".cursor/rules/*.mdc",
      managed: false,
    },
    {
      id: "copilot",
      label: "Copilot / VS Code",
      detected: true,
      bin: "/usr/local/bin/code",
      wiring: ".github/copilot-instructions.md",
      managed: false,
    },
    {
      id: "antigravity",
      label: "Antigravity",
      detected: false,
      bin: null,
      wiring: "AGENTS.md at the workspace root",
      managed: false,
    },
    {
      id: "windsurf",
      label: "Windsurf",
      detected: false,
      bin: null,
      wiring: "AGENTS.md at the workspace root",
      managed: false,
    },
  ],
  latestCommit: "7c922ff4a1b2c3d4e5f60718293a4b5c6d7e8f90",
  updateAvailable: false,
  appVersion: "1.0.0",
  repo: "codeandearnyt/NingX-EnggTeam",
  gitFound: true,
  claudeFound: true,
};

const SAMPLE: LogLine[] = [
  { level: "info", text: "— install —" },
  { level: "info", text: "Cloning codeandearnyt/NingX-EnggTeam" },
  { level: "cmd", text: "$ git clone --depth 1 https://github.com/codeandearnyt/NingX-EnggTeam.git" },
  { level: "info", text: "Cloning into '/home/you/.ningx-desktop/source'..." },
  { level: "info", text: "Registering the marketplace" },
  { level: "cmd", text: "$ claude plugin marketplace add ~/.ningx-desktop/source" },
  { level: "info", text: "✔ Successfully added marketplace: ningx" },
  { level: "cmd", text: "$ claude plugin install ningx-enggteam@ningx" },
  { level: "ok", text: "Installed." },
];

export function ensureBridge(): void {
  if (window.ningx) return;

  const bridge: NingxBridge = {
    status: async () => STATUS,
    run: async () => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      return { ok: true };
    },
    onLog: (handler) => {
      let index = 0;
      const timer = window.setInterval(() => {
        const line = SAMPLE[index];
        if (line) handler(line);
        index += 1;
        if (index >= SAMPLE.length) window.clearInterval(timer);
      }, 420);
      return () => window.clearInterval(timer);
    },
    onStatus: () => () => undefined,
    checkUpdate: async () => ({
      available: false,
      version: null,
      current: "1.0.0",
      note: "You are on the latest version.",
    }),
    installUpdate: async () => ({ ok: false, note: "Preview only." }),
    open: async () => true,
    repoUrl: async () => "https://github.com/codeandearnyt/NingX-EnggTeam",
    minimize: () => undefined,
    maximize: () => undefined,
    close: () => undefined,
  };

  window.ningx = bridge;
}
