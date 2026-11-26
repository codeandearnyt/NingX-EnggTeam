/**
 * types.ts — the shape of everything crossing the preload bridge.
 * ブリッジを渡るデータの形。
 *
 * Made by Nitin Sharma.
 */

export type HarnessId =
  | "claude-code"
  | "codex"
  | "opencode"
  | "cursor"
  | "copilot"
  | "antigravity"
  | "windsurf";

export interface Harness {
  id: HarnessId;
  label: string;
  detected: boolean;
  bin: string | null;
  wiring: string;
  managed: boolean;
}

export interface Status {
  installed: boolean;
  version: string | null;
  commit: string | null;
  installedAt: string | null;
  sourceDir: string;
  harnesses: Harness[];
  latestCommit: string | null;
  updateAvailable: boolean;
  appVersion: string;
  repo: string;
  gitFound: boolean;
  claudeFound: boolean;
}

export type Operation = "install" | "uninstall" | "reinstall" | "update";

export interface LogLine {
  level: "info" | "ok" | "warn" | "error" | "cmd";
  text: string;
}

export interface RunResult {
  ok: boolean;
  error?: string;
}

export interface AppUpdateInfo {
  available: boolean;
  version: string | null;
  current: string;
  note: string;
}

export interface NingxBridge {
  status: () => Promise<Status>;
  run: (operation: Operation) => Promise<RunResult>;
  onLog: (handler: (line: LogLine) => void) => () => void;
  onStatus: (handler: (status: Status) => void) => () => void;
  checkUpdate: () => Promise<AppUpdateInfo>;
  installUpdate: () => Promise<{ ok: boolean; note: string }>;
  open: (target: "repo" | "source" | "use") => Promise<boolean>;
  repoUrl: () => Promise<string>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    ningx: NingxBridge;
  }
}
