/**
 * exec.ts — child process helpers / 子プロセス
 *
 * Every external command the app runs goes through here. Two jobs:
 *   1. find a binary portably (where / which)
 *   2. spawn it without a shell where possible, and with a correctly quoted
 *      cmd.exe wrapper when the target is a .cmd or .bat shim (npm globals)
 *
 * Made by Nitin Sharma.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export type LineHandler = (line: string, stream: "stdout" | "stderr") => void;

const isWindows = process.platform === "win32";

/** Windows needs every argument quoted because cmd.exe re-parses the line. */
function quoteWin(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * A `.cmd` / `.bat` cannot be spawned directly on Windows — Node refuses with
 * EINVAL since the CVE-2024-27980 fix. Wrap it in cmd.exe with the whole
 * command in one extra pair of quotes, which `/s` strips back off.
 */
function invocation(bin: string, args: string[]) {
  if (isWindows && /\.(cmd|bat)$/i.test(bin)) {
    const comspec = process.env.ComSpec || "cmd.exe";
    const line = [bin, ...args].map(quoteWin).join(" ");
    return {
      file: comspec,
      args: ["/d", "/s", "/c", `"${line}"`],
      verbatim: true,
    };
  }
  return { file: bin, args, verbatim: false };
}

function spawnRaw(bin: string, args: string[]) {
  const { file, args: argv, verbatim } = invocation(bin, args);
  return spawn(file, argv, {
    windowsHide: true,
    windowsVerbatimArguments: verbatim,
    env: process.env,
  });
}

/** Run a command and collect everything. Never throws on a non-zero exit. */
export function execCapture(bin: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let child;

    try {
      child = spawnRaw(bin, args);
    } catch (error) {
      resolve({ code: -1, stdout: "", stderr: String(error) });
      return;
    }

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({ code: -1, stdout, stderr: `${stderr}${String(error)}` });
    });
    child.on("close", (code) => {
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}

/**
 * Run a command and stream each output line to a handler. Rejects when the
 * process cannot start; resolves with the exit code otherwise.
 */
export function execStream(
  bin: string,
  args: string[],
  onLine: LineHandler,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let pending = "";
    let child;

    try {
      child = spawnRaw(bin, args);
    } catch (error) {
      reject(error);
      return;
    }

    const flush = (chunk: string, stream: "stdout" | "stderr") => {
      pending += chunk;
      const parts = pending.split(/\r?\n/);
      pending = parts.pop() ?? "";
      for (const line of parts) {
        if (line.trim()) onLine(line, stream);
      }
    };

    child.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      flush(text, "stdout");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      flush(text, "stderr");
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (pending.trim()) onLine(pending, "stdout");
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}

/** Resolve a binary to an absolute path, or null when it is not on PATH. */
export async function which(bin: string): Promise<string | null> {
  const finder = isWindows ? "where" : "which";
  const result = await execCapture(finder, [bin]);
  if (result.code !== 0) return null;
  const first = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)[0];
  if (!first) return null;
  return existsSync(first) ? first : null;
}
