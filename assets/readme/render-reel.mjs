/**
 * render-reel.mjs — renders reel.html (the 30-second showcase) to MP4.
 * reel.html（30 秒ショーケース）を 1 フレームずつ描画して MP4 にする。
 *
 * No dependencies. Node's global WebSocket drives headless Chrome over the
 * DevTools Protocol, frames stream straight into ffmpeg over stdin so nothing
 * large touches the disk.
 *
 * The page is authored in a 1920x1080 design space. `--scale 2` sets the
 * device scale factor, so Chrome rasterises the same layout at 3840x2160 and
 * the screenshot comes back at 4K. One capture feeds every deliverable.
 *
 *   node assets/readme/render-reel.mjs                 # 1080p120 + 1080p60 + 720p60
 *   node assets/readme/render-reel.mjs --fps 60        # no 120 tier
 *   node assets/readme/render-reel.mjs --scale 2       # adds reel-4k.mp4 (60fps)
 *   node assets/readme/render-reel.mjs --from 5.2 --to 11.6
 *
 * Output:
 *   assets/readme/reel-30s-120.mp4    1920x1080 120fps — the smooth one
 *   assets/readme/reel-30s.mp4        1920x1080  60fps — what browsers play
 *   assets/readme/reel-30s-720.mp4    1280x720   60fps — chat embeds
 *   assets/readme/reel-4k.mp4         3840x2160  60fps — only with --scale 2
 *   assets/readme/reel-poster.png     still at 28.6s, 1920 wide
 *
 * Made by Nitin Sharma.
 */

import { spawn } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LOGOS } from "./logos.mjs";
import { GITHUB_PATH } from "./github.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ── args（引数） ──
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const FPS = Number(arg("fps", 120));
const SCALE = Number(arg("scale", 1));
const KEEP = has("keep");
const FROM = Number(arg("from", 0));
const TO = arg("to", null);
const PORT = Number(arg("port", 9334));
const NAME = arg("name", "reel-30s");
const AUDIO = arg("audio", existsSync(join(HERE, "reel-30s.wav")) ? join(HERE, "reel-30s.wav") : null);
const POSTER = !has("no-poster");
const POSTER_AT = Number(arg("poster-at", 28.6));
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
const template = readFileSync(join(HERE, "reel.html"), "utf8");
const portraitPath = join(HERE, "portrait-lg.jpg");
const portrait = existsSync(portraitPath)
  ? "data:image/jpeg;base64," + readFileSync(portraitPath).toString("base64")
  : "";

const built = template
  .replace("/*__LOGOS__*/", JSON.stringify(LOGOS))
  .replace("/*__PORTRAIT__*/", portrait);

const buildPath = join(HERE, "_reel.built.html");
writeFileSync(buildPath, built, "utf8");

// The GitHub mark rides in on a second global so the template stays clean.
const withGh = built.replace(
  '<script id="logos">',
  `<script>window.GITHUB_PATH = ${JSON.stringify(GITHUB_PATH)};</script>\n    <script id="logos">`,
);
writeFileSync(buildPath, withGh, "utf8");

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
const profile = mkdtempSync(join(tmpdir(), "ningx-reel-"));

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
  deviceScaleFactor: SCALE,
  mobile: false,
});

const pageUrl = pathToFileURL(resolve(buildPath)).href + "?render=1";
await cdp.send("Page.navigate", { url: pageUrl });

// Wait for the document plus one paint, then read the duration out of the page.
let duration = 30;
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
  console.error("reel.html never exposed window.seek");
  cleanup();
  process.exit(1);
}

const START = Math.max(0, Math.min(duration, FROM));
const END = TO === null ? duration : Math.max(START, Math.min(duration, Number(TO)));

// Give the webfonts, the portrait and the first canvas paint a beat to settle.
await sleep(900);

const total = Math.round((END - START) * FPS);
const OUT_W = 1920 * SCALE;
const OUT_H = 1080 * SCALE;
console.log(
  `rendering ${total} frames at ${FPS}fps — ${START}s → ${END}s, ${OUT_W}x${OUT_H}` +
    (AUDIO ? `, audio ${AUDIO.split(/[\\/]/).pop()}` : ", silent"),
);

// ── ffmpeg sinks（ffmpeg へ流す） ──
const partial = TO !== null;

function openEncoder(outPath, width, crf, preset, outFps = FPS, maxMbps = null) {
  const args = [
    "-hide_banner",
    "-loglevel", "error",
    "-f", "image2pipe",
    "-framerate", String(FPS),
    "-i", "-",
  ];

  if (AUDIO && !partial) {
    args.push("-ss", String(START), "-i", AUDIO);
  }

  // Downscale and drop frames in one chain, so every tier is cut from the same
  // captured JPEG stream — no second decode pass. （同じ素材から各画質を作る）
  const chain = [];
  if (width && width !== OUT_W) chain.push(`scale=${width}:-2:flags=lanczos`);
  if (outFps !== FPS) chain.push(`fps=${outFps}`);
  if (chain.length) args.push("-vf", chain.join(","));

  args.push(
    "-c:v", "libx264",
    "-preset", preset,
    "-crf", String(crf),
    // B-frames buy back bitrate on a piece that is mostly slow drift and type.
    // （遅い動きが主体なので B フレームで圧縮効率を取る）
    "-bf", "2",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-g", String(outFps * 2),
    "-movflags", "+faststart",
  );

  // CRF alone starves fast motion at high frame rates: the encoder spends the
  // budget on the first fast pan and smears everything after it. A ceiling with
  // a two-second buffer keeps the cursor and the cuts clean without inflating
  // the flat-background shots. （高 fps で動きが破綻しないよう上限を張る）
  if (maxMbps) {
    args.push("-maxrate", `${maxMbps}M`, "-bufsize", `${maxMbps * 2}M`);
  }

  if (AUDIO && !partial) {
    args.push("-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest");
  }

  args.push("-y", outPath);

  return spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
}

const fourKPath = join(HERE, partial ? "_reel-part-4k.mp4" : "reel-4k.mp4");
const highPath = join(HERE, partial ? "_reel-part-120.mp4" : `${NAME}-120.mp4`);
const masterPath = join(HERE, partial ? "_reel-part.mp4" : `${NAME}.mp4`);
const smallPath = join(HERE, partial ? "_reel-part-720.mp4" : `${NAME}-720.mp4`);
const posterPath = join(HERE, "reel-poster.png");

// 4K only makes sense when the capture is actually 4K.
const want4k = SCALE >= 2 && !partial;

// ── one capture, four sinks（一括エンコード） ──
// Every tier is muxed from the same pipe. The 120 tier is the smooth one; the
// 60 tier is what browsers and phones actually play; 720 is for chat embeds.
const sinks = [];
const addSink = (path, ...rest) => {
  const p = openEncoder(path, ...rest);
  sinks.push({ path, proc: p });
};

if (FPS >= 120 && !partial) addSink(highPath, 1920, 18, "slow", 120, 28);
addSink(masterPath, 1920, 18, "slow", 60, 16);
if (!partial) addSink(smallPath, 1280, 20, "medium", 60, 8);
if (want4k) addSink(fourKPath, OUT_W, 18, "medium", 60, 55);

const write = (stream, buf) =>
  new Promise((res) => {
    if (stream.write(buf)) return res();
    stream.once("drain", res);
  });

// ── frame loop（フレームループ） ──
const t0 = Date.now();
let posterDone = partial || !POSTER;

for (let f = 0; f < total; f++) {
  const t = START + f / FPS;

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
  for (const s of sinks) await write(s.proc.stdin, buf);

  // Poster lands on the end card, where the frame reads best as a still.
  if (!posterDone && t >= POSTER_AT) {
    const png = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    writeFileSync(posterPath, Buffer.from(png.data, "base64"));
    posterDone = true;
  }

  if (f % Math.max(1, Math.round(FPS)) === 0) {
    const pct = ((f / total) * 100).toFixed(0).padStart(3);
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    process.stdout.write(`  ${pct}%  frame ${f}/${total}  ${secs}s\n`);
  }
}

for (const s of sinks) s.proc.stdin.end();

// Every sink has to finish muxing before the derived passes read its file.
await Promise.all(
  sinks.map(
    (s) =>
      new Promise((res, rej) => {
        s.proc.on("close", (c) => (c === 0 ? res() : rej(new Error(`${s.path} exited ${c}`))));
      }),
  ),
);

// If the poster timestamp was past the last frame, grab it explicitly.
if (!posterDone && POSTER) {
  await cdp.send("Runtime.evaluate", {
    expression: `window.seek(${POSTER_AT})`,
    returnByValue: true,
  });
  const png = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(posterPath, Buffer.from(png.data, "base64"));
}

// ── derived outputs（派生ファイル） ──
const run = (args) =>
  new Promise((res, rej) => {
    const p = spawn("ffmpeg", args, { stdio: "inherit" });
    p.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
  });

if (!partial && existsSync(posterPath)) {
  // ffmpeg refuses to read and write the same PNG, so the rescale goes through
  // a temp file. （同一パスの読み書きは不可）
  console.log("  → poster 1920");
  const posterTmp = join(HERE, "_poster.tmp.png");
  await run([
    "-hide_banner", "-loglevel", "error",
    "-i", posterPath,
    "-vf", "scale=1920:-2:flags=lanczos",
    "-y", posterTmp,
  ]);
  rmSync(posterPath, { force: true });
  writeFileSync(posterPath, readFileSync(posterTmp));
  rmSync(posterTmp, { force: true });
}

console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
for (const s of sinks) console.log(`  ${s.path}`);
if (!partial && POSTER && existsSync(posterPath)) console.log(`  ${posterPath}`);

cleanup();
process.exit(0);
