/**
 * make-loop.mjs — cuts the 6-second autoplay loop GIF from the 1080p master.
 * 1080p マスターから 6 秒のループ GIF を作る（README の自動再生用）。
 *
 *   node assets/readme/make-loop.mjs
 *   node assets/readme/make-loop.mjs --from 0 --to 6 --width 720 --fps 12
 *
 * GitHub strips <video> from READMEs, so the only thing that actually moves on
 * a repo page is a GIF. Six seconds is the hook: title, headline, agents hub.
 * （GitHub は video を消すので GIF が唯一の自動再生手段）
 *
 * Made by Nitin Sharma.
 */

import { spawnSync } from "node:child_process";
import { existsSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const SRC = join(HERE, "reel-30s.mp4");
const OUT = join(HERE, "reel-loop.gif");
const PAL = join(HERE, "_loop.pal.png");

const FROM = arg("from", "0");
const TO = arg("to", "6");
const WIDTH = Number(arg("width", 720));
const FPS = Number(arg("fps", 12));
const DITHER = arg("dither", "bayer:bayer_scale=4");

// 1080p master is 16:9, so the height follows the width.
const HEIGHT = Math.round((WIDTH * 9) / 16);

if (!existsSync(SRC)) {
  console.error(`missing ${SRC} — render the reel first`);
  process.exit(1);
}

const run = (args, label) => {
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "inherit", "pipe"] });
  if (r.status !== 0) {
    console.error(`${label} failed`);
    process.stderr.write(r.stderr ?? "");
    process.exit(1);
  }
};

// ── pass 1: palette（パレット生成） ──
// stats_mode=diff ignores the static background and spends the 256 colours on
// what actually changes between frames — type, cards, glows. （動く部分に色を割く）
const scale = `fps=${FPS},scale=${WIDTH}:${HEIGHT}:flags=lanczos`;

run(
  [
    "-y",
    "-ss", FROM,
    "-to", TO,
    "-i", SRC,
    "-vf", `${scale},palettegen=stats_mode=diff:max_colors=256`,
    "-frames:v", "1",
    PAL,
  ],
  "palettegen",
);

// ── pass 2: apply（適用） ──
// bayer dithering keeps gradients banding-free without the file-size blow-up
// that sierra2_4a causes on a dark navy background. （暗い背景は誤差拡散だと重い）
run(
  [
    "-y",
    "-ss", FROM,
    "-to", TO,
    "-i", SRC,
    "-i", PAL,
    "-lavfi", `${scale}[x];[x][1:v]paletteuse=dither=${DITHER}`,
    "-loop", "0",
    OUT,
  ],
  "paletteuse",
);

if (existsSync(PAL)) unlinkSync(PAL);

const bytes = statSync(OUT).size;
const seconds = Number(TO) - Number(FROM);
console.log(
  `reel-loop.gif  ${WIDTH}x${HEIGHT}  ${FPS} fps  ${seconds.toFixed(2)}s  ` +
    `${(bytes / 1048576).toFixed(2)} MB`,
);

// GitHub's image proxy refuses anything over ~10 MB and soft-fails the render.
if (bytes > 9 * 1048576) {
  console.warn("over 9 MB — drop --fps to 10 or --width to 640");
}
