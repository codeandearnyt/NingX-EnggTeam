/**
 * installer.ts — the four operations: install, uninstall, reinstall, update.
 * インストール・アンインストール・再インストール・更新。
 *
 * Everything lives under ~/.ningx-desktop:
 *   source/      a shallow clone of the NingX-EnggTeam repo
 *   state.json   what was installed, when, and at which commit
 *
 * The app never writes inside the user's projects. Claude Code is wired through
 * its own plugin commands, so the harness stays the source of truth for what it
 * has loaded.
 *
 * Made by Nitin Sharma.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { execCapture, execStream, which } from "./exec";
import { detectHarnesses, type Harness } from "./harnesses";

export const REPO_URL = "https://github.com/codeandearnyt/NingX-EnggTeam.git";
export const REPO_LABEL = "codeandearnyt/NingX-EnggTeam";
export const PLUGIN_ID = "ningx-enggteam@ningx";
export const MARKETPLACE = "ningx";

const ROOT = path.join(os.homedir(), ".ningx-desktop");
const SOURCE = path.join(ROOT, "source");
const STATE = path.join(ROOT, "state.json");

export type Operation = "install" | "uninstall" | "reinstall" | "update";

export interface InstallState {
  installed: boolean;
  version: string | null;
  commit: string | null;
  installedAt: string | null;
  sourceDir: string;
}

export interface Status extends InstallState {
  harnesses: Harness[];
  latestCommit: string | null;
  updateAvailable: boolean;
  appVersion: string;
  repo: string;
  gitFound: boolean;
  claudeFound: boolean;
}

export interface LogLine {
  level: "info" | "ok" | "warn" | "error" | "cmd";
  text: string;
}

export type Logger = (line: LogLine) => void;

// --------------------------------------------------------------------- state

async function readState(): Promise<InstallState> {
  const empty: InstallState = {
    installed: false,
    version: null,
    commit: null,
    installedAt: null,
    sourceDir: SOURCE,
  };

  try {
    const raw = await readFile(STATE, "utf8");
    const parsed = JSON.parse(raw) as Partial<InstallState>;
    return {
      installed: Boolean(parsed.installed) && existsSync(SOURCE),
      version: parsed.version ?? null,
      commit: parsed.commit ?? null,
      installedAt: parsed.installedAt ?? null,
      sourceDir: SOURCE,
    };
  } catch {
    return empty;
  }
}

async function writeState(state: Omit<InstallState, "sourceDir">): Promise<void> {
  await mkdir(ROOT, { recursive: true });
  await writeFile(
    STATE,
    JSON.stringify({ ...state, sourceDir: SOURCE }, null, 2),
    "utf8",
  );
}

async function headCommit(): Promise<string | null> {
  if (!existsSync(path.join(SOURCE, ".git"))) return null;
  const result = await execCapture("git", ["-C", SOURCE, "rev-parse", "HEAD"]);
  return result.code === 0 ? result.stdout.trim() : null;
}

async function remoteCommit(): Promise<string | null> {
  const result = await execCapture("git", ["ls-remote", REPO_URL, "refs/heads/main"]);
  if (result.code !== 0) return null;
  const sha = result.stdout.trim().split(/\s+/)[0];
  return sha && sha.length >= 7 ? sha : null;
}

async function versionOf(): Promise<string | null> {
  const file = path.join(SOURCE, "VERSION");
  if (!existsSync(file)) return null;
  try {
    return (await readFile(file, "utf8")).trim() || null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------- helpers

async function git(): Promise<string> {
  const bin = await which("git");
  if (!bin) {
    throw new Error(
      "git is not on PATH. Install git first — the app pulls the repo with it.",
    );
  }
  return bin;
}

async function claude(): Promise<string | null> {
  return which("claude");
}

/** Run a step, log the command, and throw with the real output when it fails. */
async function step(
  log: Logger,
  bin: string,
  args: string[],
  options: { optional?: boolean; label?: string } = {},
): Promise<boolean> {
  const label = options.label ?? [path.basename(bin), ...args].join(" ");
  log({ level: "cmd", text: `$ ${label}` });

  let result;
  try {
    result = await execStream(bin, args, (line, stream) => {
      log({ level: stream === "stderr" ? "warn" : "info", text: line });
    });
  } catch (error) {
    if (options.optional) {
      log({ level: "warn", text: `skipped: ${String(error)}` });
      return false;
    }
    throw error;
  }

  if (result.code !== 0) {
    const detail = (result.stderr || result.stdout).trim().split("\n").slice(-4).join("\n");
    if (options.optional) {
      log({ level: "warn", text: `skipped (exit ${result.code})${detail ? `: ${detail}` : ""}` });
      return false;
    }
    throw new Error(
      `${label} failed with exit ${result.code}${detail ? `\n${detail}` : ""}`,
    );
  }

  return true;
}

// ---------------------------------------------------------------- operations

export async function status(appVersion: string): Promise<Status> {
  const [state, harnesses, gitBin, claudeBin, latest] = await Promise.all([
    readState(),
    detectHarnesses(),
    which("git"),
    claude(),
    remoteCommit(),
  ]);

  const current = state.commit;
  return {
    ...state,
    harnesses,
    latestCommit: latest,
    updateAvailable: Boolean(current && latest && current !== latest),
    appVersion,
    repo: REPO_LABEL,
    gitFound: Boolean(gitBin),
    claudeFound: Boolean(claudeBin),
  };
}

async function doInstall(log: Logger): Promise<void> {
  const gitBin = await git();

  await mkdir(ROOT, { recursive: true });

  if (existsSync(path.join(SOURCE, ".git"))) {
    log({ level: "info", text: `Refreshing ${SOURCE}` });
    await step(log, gitBin, ["-C", SOURCE, "fetch", "--depth", "1", "origin", "main"]);
    await step(log, gitBin, ["-C", SOURCE, "reset", "--hard", "origin/main"]);
  } else {
    log({ level: "info", text: `Cloning ${REPO_LABEL}` });
    await rm(SOURCE, { recursive: true, force: true });
    await step(log, gitBin, ["clone", "--depth", "1", REPO_URL, SOURCE]);
  }

  const claudeBin = await claude();
  if (!claudeBin) {
    log({
      level: "warn",
      text: "Claude Code CLI not found — the repo is downloaded but no plugin was registered.",
    });
    log({
      level: "info",
      text: `Copy ${path.join(SOURCE, "AGENTS.md")} into any project to use it manually.`,
    });
  } else {
    log({ level: "info", text: "Registering the marketplace" });
    const added = await step(
      log,
      claudeBin,
      ["plugin", "marketplace", "add", SOURCE],
      { optional: true },
    );
    if (!added) {
      await step(
        log,
        claudeBin,
        ["plugin", "marketplace", "update", MARKETPLACE],
        { optional: true },
      );
    }

    log({ level: "info", text: "Installing the plugin" });
    await step(log, claudeBin, ["plugin", "install", PLUGIN_ID], {
      optional: true,
    });
  }

  await writeState({
    installed: true,
    version: await versionOf(),
    commit: await headCommit(),
    installedAt: new Date().toISOString(),
  });

  log({ level: "ok", text: "Installed." });
}

async function doUninstall(log: Logger): Promise<void> {
  const claudeBin = await claude();

  if (claudeBin) {
    log({ level: "info", text: "Removing the plugin" });
    await step(log, claudeBin, ["plugin", "uninstall", PLUGIN_ID], {
      optional: true,
    });
    await step(log, claudeBin, ["plugin", "marketplace", "remove", MARKETPLACE], {
      optional: true,
    });
  } else {
    log({ level: "warn", text: "Claude Code CLI not found — skipping plugin removal." });
  }

  log({ level: "info", text: `Deleting ${SOURCE}` });
  await rm(SOURCE, { recursive: true, force: true });
  await rm(STATE, { force: true });

  log({ level: "ok", text: "Uninstalled." });
}

async function doUpdate(log: Logger): Promise<void> {
  if (!existsSync(path.join(SOURCE, ".git"))) {
    log({ level: "warn", text: "Nothing installed yet — running a full install instead." });
    await doInstall(log);
    return;
  }

  const gitBin = await git();

  log({ level: "info", text: "Pulling the latest commit" });
  await step(log, gitBin, ["-C", SOURCE, "fetch", "--depth", "1", "origin", "main"]);
  await step(log, gitBin, ["-C", SOURCE, "reset", "--hard", "origin/main"]);

  const claudeBin = await claude();
  if (claudeBin) {
    log({ level: "info", text: "Refreshing the marketplace" });
    await step(log, claudeBin, ["plugin", "marketplace", "update", MARKETPLACE], {
      optional: true,
    });
    await step(log, claudeBin, ["plugin", "update", PLUGIN_ID], { optional: true });
  }

  await writeState({
    installed: true,
    version: await versionOf(),
    commit: await headCommit(),
    installedAt: new Date().toISOString(),
  });

  log({ level: "ok", text: "Updated." });
}

export async function run(
  operation: Operation,
  log: Logger,
): Promise<{ ok: boolean; error?: string }> {
  try {
    log({ level: "info", text: `— ${operation} —` });

    switch (operation) {
      case "install":
        await doInstall(log);
        break;
      case "uninstall":
        await doUninstall(log);
        break;
      case "reinstall":
        await doUninstall(log);
        await doInstall(log);
        break;
      case "update":
        await doUpdate(log);
        break;
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log({ level: "error", text: message });
    return { ok: false, error: message };
  }
}
