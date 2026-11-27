/**
 * stills.mjs — grab single frames out of reel.html for inspection.
 * reel.html の任意の時刻を 1 枚ずつ書き出す確認用ツール。
 *
 *   node stills.mjs 1.2 3.4 7.8          # seconds
 *   node stills.mjs --at 0.9,2.9,4.9 ...  # comma list
 *
 * Writes <name>-<t>.png next to this file. No dependencies.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LOGOS } from "./logos.mjs";
import { GITHUB_PATH } from "./github.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const times = (() => {
  const at = arg("at", null);
  if (at) return at.split(",").map(Number);
  return argv.filter((a) => !a.startsWith("--") && !Number.isNaN(Number(a))).map(Number);
})();

if (!times.length) {
  console.error("usage: node stills.mjs 1.2 3.4 ... | --at 1.2,3.4");
  process.exit(1);
}

const SCALE = Number(arg("scale", 1));
const PREFIX = arg("prefix", "still");
const PORT = Number(arg("port", 9350));
const CHROME = arg(
  "chrome",
  join(
    process.env.USERPROFILE || process.env.HOME || "",
    "AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
  ),
);

if (!existsSync(CHROME)) {
  console.error(`chrome not found: ${CHROME}`);
  process.exit(1);
}

// ── build the page ──
const template = readFileSync(join(HERE, "reel.html"), "utf8");
const portraitPath = join(HERE, "portrait-lg.jpg");
const portrait = existsSync(portraitPath)
  ? "data:image/jpeg;base64," + readFileSync(portraitPath).toString("base64")
  : "";

const built = template
  .replace("/*__LOGOS__*/", JSON.stringify(LOGOS))
  .replace("/*__PORTRAIT__*/", portrait)
  .replace(
    '<script id="logos">',
    `<script>window.GITHUB_PATH = ${JSON.stringify(GITHUB_PATH)};</script>\n    <script id="logos">`,
  );

const buildPath = join(HERE, "_stills.built.html");
writeFileSync(buildPath, built, "utf8");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.addEventListener("open", res, { once: true });
      ws.addEventListener("error", rej, { once: true });
    });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 60000);
    });
  }
}

const profile = mkdtempSync(join(tmpdir(), "ningx-stills-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--force-device-scale-factor=1",
    "--window-size=1920,1080",
    "--font-render-hinting=none",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const cleanup = () => {
  try { chrome.kill(); } catch { /* gone */ }
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* locked */ }
  try { rmSync(buildPath, { force: true }); } catch { /* gone */ }
};
process.on("exit", cleanup);

let target = null;
for (let i = 0; i < 80; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await res.json();
    target = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    if (target) break;
  } catch { /* not up */ }
  await sleep(250);
}

if (!target) {
  console.error("chrome never opened a debugging port");
  cleanup();
  process.exit(1);
}

const cdp = await CDP.connect(target.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", {
  width: 1920,
  height: 1080,
  deviceScaleFactor: SCALE,
  mobile: false,
});
await cdp.send("Page.navigate", {
  url: pathToFileURL(resolve(buildPath)).href + "?render=1",
});

for (let i = 0; i < 60; i++) {
  await sleep(200);
  try {
    const r = await cdp.send("Runtime.evaluate", {
      expression: "typeof window.seek === 'function'",
      returnByValue: true,
    });
    if (r.result.value) break;
  } catch { /* loading */ }
}

await sleep(900);

for (const t of times) {
  await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      window.seek(${t});
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      return true;
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const name = `${PREFIX}-${t.toFixed(2).replace(".", "_")}.png`;
  writeFileSync(join(HERE, name), Buffer.from(shot.data, "base64"));
  console.log("  " + name);
}

cleanup();
process.exit(0);
