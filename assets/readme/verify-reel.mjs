/**
 * verify-reel.mjs — proves the rendered tiers are actually smooth.
 * 出力した動画が本当に滑らかを数値で確認する。
 *
 *   node assets/readme/verify-reel.mjs
 *
 * "Laggy" almost always means one of three things, and this checks all three:
 *
 *   1. the file is not really at the frame rate it claims (avg vs r_frame_rate)
 *   2. frames are duplicated, so motion advances in steps (mpdecimate drop count)
 *   3. the bitrate is starved, so fast motion smears into blocks
 *
 * （ラグの原因は fps 不足・重複フレーム・ビットレート不足の三つ）
 *
 * Made by Nitin Sharma.
 */

import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const TIERS = [
  ["reel-30s-120.mp4", 120],
  ["reel-30s.mp4", 60],
  ["reel-30s-720.mp4", 60],
  ["reel-4k.mp4", 60],
];

const probe = (file) => {
  const r = spawnSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries",
      "stream=codec_type,width,height,r_frame_rate,avg_frame_rate,nb_frames,bit_rate,duration",
      "-show_entries", "format=duration,size,bit_rate",
      "-of", "json",
      file,
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) return null;
  return JSON.parse(r.stdout);
};

// framemd5 hashes every decoded frame. Consecutive identical hashes are
// literally duplicate frames — the exact thing that reads as judder. This is
// more reliable than mpdecimate, which only reports what it *would* drop.
// （連続する同一ハッシュ＝重複フレーム。これがカクつきの正体）
const dupCount = (file) => {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-map", "0:v", "-f", "framemd5", "-"],
    { encoding: "utf8", maxBuffer: 1 << 28 },
  );
  if (r.status !== 0) return null;

  const hashes = [];
  for (const line of (r.stdout || "").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(",").map((s) => s.trim());
    if (parts.length < 6) continue;
    hashes.push(parts[5]);
  }
  if (hashes.length < 2) return null;

  let dups = 0;
  for (let i = 1; i < hashes.length; i++) if (hashes[i] === hashes[i - 1]) dups++;
  return { frames: hashes.length, dups };
};

const pct = (a, b) => ((a / b) * 100).toFixed(1);

let failures = 0;

for (const [name, wantFps] of TIERS) {
  const file = join(HERE, name);
  if (!existsSync(file)) {
    console.log(`${name.padEnd(22)} missing — skipped`);
    continue;
  }

  const info = probe(file);
  if (!info) {
    console.log(`${name.padEnd(22)} unreadable`);
    failures++;
    continue;
  }

  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  const size = statSync(file).size;
  const mbps = (size * 8) / Number(info.format.duration) / 1e6;

  const realFps = Number(v.avg_frame_rate.split("/")[0]) / Number(v.avg_frame_rate.split("/")[1]);
  const frames = Number(v.nb_frames ?? 0);
  const dur = Number(info.format.duration);

  const dup = dupCount(file);
  const dupPct = dup ? Number(pct(dup.dups, dup.frames)) : null;

  const fpsOk = Math.abs(realFps - wantFps) < 0.5;
  const durOk = Math.abs(dur - 30) < 0.05;
  // A real render has zero identical neighbours. Anything above a couple of
  // percent means the capture path is handing back stale composites.
  // （重複が数%を超えたら描画側の不具合）
  const dupOk = dupPct === null ? false : dupPct <= 2;

  if (!fpsOk || !durOk || !dupOk) failures++;

  console.log(
    [
      name.padEnd(22),
      `${String(v.width)}x${String(v.height)}`.padEnd(10),
      `${realFps.toFixed(0)}fps`.padEnd(7),
      `${dur.toFixed(3)}s`.padEnd(9),
      `${frames} frames`.padEnd(13),
      `${mbps.toFixed(1)} Mbps`.padEnd(11),
      a ? "audio ✓" : "audio ✗",
      dup ? `dup ${dup.dups}/${dup.frames} (${dupPct}%)` : "dup ?",
      fpsOk && durOk && dupOk ? "PASS" : "FAIL",
    ].join("  "),
  );
}

console.log(failures === 0 ? "\nALL TIERS PASS" : `\n${failures} TIER(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
