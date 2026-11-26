/**
 * smoke.js — exercise the four operations against a throwaway HOME.
 * 使い捨て HOME で四つの操作を検証する。
 *
 * Run it with USERPROFILE pointed somewhere temporary and `claude` removed from
 * PATH. It clones the real repo, checks the state file, updates, and uninstalls,
 * so it proves the filesystem and git half without touching a real install.
 *
 *   node scripts/smoke.js
 *
 * Made by Nitin Sharma.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const installer = require("../dist-electron/core/installer.js");

const lines = [];
const log = (line) => {
  lines.push(`[${line.level}] ${line.text}`);
  process.stdout.write(`  [${line.level}] ${line.text}\n`);
};

function check(label, condition) {
  const mark = condition ? "PASS" : "FAIL";
  process.stdout.write(`${mark}  ${label}\n`);
  if (!condition) process.exitCode = 1;
}

(async () => {
  const home = os.homedir();
  const root = path.join(home, ".ningx-desktop");
  const source = path.join(root, "source");

  process.stdout.write(`HOME ${home}\n\n`);

  process.stdout.write("status (before)\n");
  const before = await installer.status("smoke");
  check("not installed", before.installed === false);
  check("git found", before.gitFound === true);
  check("harness list is populated", before.harnesses.length > 0);

  process.stdout.write("\ninstall\n");
  const install = await installer.run("install", log);
  check("install returned ok", install.ok === true);
  check("source cloned", fs.existsSync(path.join(source, ".git")));
  check("state written", fs.existsSync(path.join(root, "state.json")));

  const after = await installer.status("smoke");
  check("status reports installed", after.installed === true);
  check("version read from VERSION", typeof after.version === "string" && after.version.length > 0);
  check("commit recorded", typeof after.commit === "string" && after.commit.length === 40);
  check("AGENTS.md present", fs.existsSync(path.join(source, "AGENTS.md")));
  check("24 ui skills present",
    fs.readdirSync(path.join(source, "skills")).filter((n) => n.startsWith("ui-")).length === 24);

  process.stdout.write("\nupdate\n");
  const update = await installer.run("update", log);
  check("update returned ok", update.ok === true);
  check("still installed after update", (await installer.status("smoke")).installed === true);

  process.stdout.write("\nreinstall\n");
  const reinstall = await installer.run("reinstall", log);
  check("reinstall returned ok", reinstall.ok === true);
  check("source back after reinstall", fs.existsSync(path.join(source, "AGENTS.md")));

  process.stdout.write("\nuninstall\n");
  const uninstall = await installer.run("uninstall", log);
  check("uninstall returned ok", uninstall.ok === true);
  check("source removed", !fs.existsSync(source));
  check("state removed", !fs.existsSync(path.join(root, "state.json")));
  check("status reports not installed", (await installer.status("smoke")).installed === false);

  process.stdout.write(`\nlog lines captured: ${lines.length}\n`);
  process.stdout.write(process.exitCode ? "\nSMOKE FAILED\n" : "\nSMOKE PASSED\n");
})().catch((error) => {
  process.stderr.write(`SMOKE CRASHED: ${error && error.stack ? error.stack : String(error)}\n`);
  process.exit(1);
});
