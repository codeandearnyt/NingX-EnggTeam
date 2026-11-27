/**
 * render-ad.mjs — renders ad.html to an MP4, frame by frame.
 * ad.html を 1 フレームずつ描画して MP4 にする。
 *
 * No dependencies. Node 24 ships a global WebSocket, so this drives headless
 * Chrome straight over the DevTools Protocol: seek to a timestamp, grab a
 * screenshot, repeat. Frames stream into ffmpeg over stdin, so nothing large
 * ever touches the disk.
 *
 *   node assets/readme/render-ad.mjs
 *   node assets/readme/render-ad.mjs --fps 60 --keep
 *
 * Output:
 *   assets/readme/ningx-spot.mp4        1920x1080 master
 *   assets/readme/ningx-spot-720.mp4    1280x720 for chat embeds
 *   assets/readme/ningx-spot-poster.png frame at 19.2s
 *
 * Made by Nitin Sharma.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LOGOS } from "./logos.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ── args（引数） ──
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const FPS = Number(arg("fps", 30));
const KEEP = argv.includes("--keep");
const CHROME = arg(
  "chrome",
  join(
    process.env.USERPROFILE || process.env.HOME || "",
    "AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
  ),
);

if (!existsSync(CHROME)) {
  console.error(`chrome not found: ${CHROME}\npass --chrome <path>`);
  process.exit(1);
}

// ── build a self-contained page（自己完結のページを組む） ──
const template = readFileSync(join(HERE, "ad.html"), "utf8");
const built = template.replace("/*__LOGOS__*/", JSON.stringify(LOGOS));
const buildPath = join(HERE, "_ad.built.html");
writeFileSync(buildPath, built, "utf8");

// ── small CDP client（小さな CDP クライアント） ──
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── launch chrome（Chrome を起動） ──
const profile = mkdtempSync(join(tmpdir(), "ningx-ad-"));
const PORT = 9333;

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
  try {
    chrome.kill();
  } catch {
    /* already gone */
  }
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* locked by chrome, harmless */
  }
  if (!KEEP) {
    try {
      rmSync(buildPath, { force: true });
    } catch {
      /* nothing to do */
    }
  }
};
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

// ── wait for the debugger（デバッガを待つ） ──
let target = null;
for (let i = 0; i < 80; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await res.json();
    target = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    if (target) break;
  } catch {
    /* not up yet */
  }
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
  deviceScaleFactor: 1,
  mobile: false,
});

const pageUrl = pathToFileURL(resolve(buildPath)).href + "?render=1";
await cdp.send("Page.navigate", { url: pageUrl });

// Wait for the document plus one paint, then read the duration out of the page.
let duration = 21;
for (let i = 0; i < 60; i++) {
  await sleep(200);
  try {
    const r = await cdp.send("Runtime.evaluate", {
      expression: "typeof window.seek === 'function' && window.__DUR",
      returnByValue: true,
    });
    if (r.result.value) {
      duration = r.result.value;
      break;
    }
  } catch {
    /* still loading */
  }
}

if (!duration) {
  console.error("ad.html never exposed window.seek");
  cleanup();
  process.exit(1);
}

// Give webfonts and the first canvas paint a beat to settle.
await sleep(700);

const total = Math.round(duration * FPS);
console.log(`rendering ${total} frames at ${FPS}fps — ${duration}s, 1920x1080`);

// ── ffmpeg sinks（ffmpeg へ流す） ──
function openEncoder(outPath, width, crf) {
  const ff = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel", "error",
      "-f", "image2pipe",
      "-framerate", String(FPS),
      "-i", "-",
      "-vf", `scale=${width}:-2:flags=lanczos`,
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", String(crf),
      "-pix_fmt", "yuv420p",
      "-profile:v", "high",
      "-movflags", "+faststart",
      "-y", outPath,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  return ff;
}

const masterPath = join(HERE, "ningx-spot.mp4");
const smallPath = join(HERE, "ningx-spot-720.mp4");

const master = openEncoder(masterPath, 1920, 17);
const small = openEncoder(smallPath, 1280, 21);

const write = (stream, buf) =>
  new Promise((res) => {
    if (stream.write(buf)) return res();
    stream.once("drain", res);
  });

// ── frame loop（フレームループ） ──
const t0 = Date.now();
let posterDone = false;

for (let f = 0; f < total; f++) {
  const t = f / FPS;

  // Seek, then wait two animation frames so the compositor has actually
  // painted the new state before the screenshot is taken.
  await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      window.seek(${t.toFixed(4)});
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      return true;
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });

  const shot = await cdp.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: 96,
    fromSurface: true,
    captureBeyondViewport: false,
  });

  const buf = Buffer.from(shot.data, "base64");
  await write(master.stdin, buf);
  await write(small.stdin, buf);

  // Poster lands near the sign-off, where the frame reads best as a still.
  if (!posterDone && t >= 19.2) {
    const png = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    writeFileSync(
      join(HERE, "ningx-spot-poster.png"),
      Buffer.from(png.data, "base64"),
    );
    posterDone = true;
  }

  if (f % 60 === 0) {
    const pct = ((f / total) * 100).toFixed(0).padStart(3);
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    process.stdout.write(`  ${pct}%  frame ${f}/${total}  ${secs}s\n`);
  }
}

master.stdin.end();
small.stdin.end();

await Promise.all([
  new Promise((r) => master.on("close", r)),
  new Promise((r) => small.on("close", r)),
]);

// If the poster timestamp was past the last frame, grab it explicitly.
if (!posterDone) {
  await cdp.send("Runtime.evaluate", { expression: "window.seek(19.2)" });
  const png = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(
    join(HERE, "ningx-spot-poster.png"),
    Buffer.from(png.data, "base64"),
  );
}

console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.log(`  ${masterPath}`);
console.log(`  ${smallPath}`);
console.log(`  ${join(HERE, "ningx-spot-poster.png")}`);

cleanup();
process.exit(0);
