/**
 * harnesses.ts — detect which AI coding harnesses are on this machine.
 * どのハーネスが入っているかを検出する。
 *
 * Detection is deliberately shallow: does the CLI resolve on PATH, or does the
 * editor's config directory exist. The app never guesses at a harness it cannot
 * see, because a wrong "installed" badge is worse than a missing one.
 *
 * Made by Nitin Sharma.
 */

import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { which } from "./exec";

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
  /** True when the CLI resolves or the config directory exists. */
  detected: boolean;
  /** Absolute path to the CLI, when one was found. */
  bin: string | null;
  /** One line on how the plugin reaches this harness. */
  wiring: string;
  /** Whether this app can install it without the user doing anything. */
  managed: boolean;
}

interface Spec {
  id: HarnessId;
  label: string;
  cli?: string;
  dirs?: string[];
  wiring: string;
  managed: boolean;
}

const SPECS: Spec[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    cli: "claude",
    dirs: [".claude"],
    wiring: "plugin marketplace + plugin install",
    managed: true,
  },
  {
    id: "codex",
    label: "Codex",
    cli: "codex",
    dirs: [".codex"],
    wiring: "AGENTS.md at the repo root",
    managed: false,
  },
  {
    id: "opencode",
    label: "OpenCode",
    cli: "opencode",
    dirs: [".config/opencode", ".opencode"],
    wiring: "instructions[] in opencode.jsonc",
    managed: false,
  },
  {
    id: "cursor",
    label: "Cursor",
    cli: "cursor",
    dirs: [".cursor"],
    wiring: ".cursor/rules/*.mdc",
    managed: false,
  },
  {
    id: "copilot",
    label: "Copilot / VS Code",
    cli: "code",
    dirs: [".github"],
    wiring: ".github/copilot-instructions.md",
    managed: false,
  },
  {
    id: "antigravity",
    label: "Antigravity",
    dirs: [".antigravity"],
    wiring: "AGENTS.md at the workspace root",
    managed: false,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    dirs: [".codeium/windsurf", ".windsurf"],
    wiring: "AGENTS.md at the workspace root",
    managed: false,
  },
];

export async function detectHarnesses(): Promise<Harness[]> {
  const home = os.homedir();

  return Promise.all(
    SPECS.map(async (spec): Promise<Harness> => {
      const bin = spec.cli ? await which(spec.cli) : null;
      const hasDir = (spec.dirs ?? []).some((dir) =>
        existsSync(path.join(home, dir)),
      );

      return {
        id: spec.id,
        label: spec.label,
        detected: Boolean(bin) || hasDir,
        bin,
        wiring: spec.wiring,
        managed: spec.managed,
      };
    }),
  );
}
