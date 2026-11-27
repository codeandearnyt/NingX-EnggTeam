/**
 * generate.mjs — builds the animated SVGs the README uses.
 * README が使うアニメーション SVG を生成する。
 *
 * GitHub strips <animate> from inline SVG, so every animation has to live in a
 * standalone .svg file referenced through raw.githubusercontent.com. This script
 * writes those files. Run it after changing a colour or a string:
 *
 *   node assets/readme/generate.mjs
 *
 * Made by Nitin Sharma.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOGOS } from "./logos.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = (name) => join(HERE, name);

// ── Palette（配色） — the same values as desktop/src/styles/aqua.css ──
const C = {
  deep: "#06111c",
  mid: "#0d2740",
  edge: "#123a63",
  accent: "#5aa7e9",
  light: "#a9d8f8",
  core: "#2b7fd4",
  ink: "#eaf3fb",
  muted: "#8fb0cd",
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SF Mono', 'Cascadia Mono', Consolas, Menlo, monospace";

// ── helpers（補助） ──────────────────────────────────────────────────

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A soft blurred orb that drifts. */
function orb(id, cx, cy, r, fill, opacity, path, dur) {
  const [a, b, c] = path;
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" opacity="${opacity}" filter="url(#blur)">
      <animate attributeName="cx" values="${a};${b};${c};${a}" dur="${dur}s"
               repeatCount="indefinite" calcMode="spline"
               keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" keyTimes="0;0.33;0.66;1"/>
      <animate attributeName="cy" values="${cy};${cy - 26};${cy + 18};${cy}" dur="${dur * 1.3}s"
               repeatCount="indefinite" calcMode="spline"
               keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" keyTimes="0;0.33;0.66;1"/>
    </circle>`;
}

/** Deterministic pseudo-random so the file is stable between runs. */
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// ── banner.svg（バナー） ─────────────────────────────────────────────

/** One brand mark, nested so it scales into a square box. */
function logoGlyph(name, x, y, size, fill) {
  const logo = LOGOS[name];
  if (!logo) return "";
  const paths = logo.paths
    .map(
      (p) =>
        `<path d="${p.d}"${p.fillRule ? ` fill-rule="${p.fillRule}"` : ""}${
          p.clipRule ? ` clip-rule="${p.clipRule}"` : ""
        }/>`,
    )
    .join("");
  return `<svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size}" height="${size}" viewBox="${logo.viewBox}" fill="${fill}" overflow="visible">${paths}</svg>`;
}

function banner() {
  const rand = rng(7);

  const particles = Array.from({ length: 26 }, (_, i) => {
    const x = 40 + rand() * 1120;
    const y = 20 + rand() * 200;
    const r = 0.7 + rand() * 1.8;
    const dur = 5 + rand() * 7;
    const delay = rand() * dur;
    const drift = -30 - rand() * 50;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"
        fill="${i % 3 === 0 ? C.light : C.accent}" opacity="0">
      <animate attributeName="cy" values="${y.toFixed(1)};${(y + drift).toFixed(1)}" dur="${dur.toFixed(1)}s"
               begin="${(-delay).toFixed(1)}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.55;0" dur="${dur.toFixed(1)}s"
               begin="${(-delay).toFixed(1)}s" repeatCount="indefinite"/>
    </circle>`;
  }).join("\n");

  // ── logo row（ロゴ列） ──
  const ROW = [
    ["Claude Code", "claude"],
    ["Codex", "codex"],
    ["OpenCode", "opencode"],
    ["Cursor", "cursor"],
    ["Copilot", "copilot"],
    ["Windows", "windows"],
    ["macOS", "apple"],
    ["Linux", "linux"],
  ];

  const FS = 12.5;
  const PADX = 11;
  const ICON = 15;
  const GAPIN = 8;
  const PILL_H = 32;
  const PILL_GAP = 8;
  const PILL_Y = 200;

  const widthOf = (label) =>
    PADX * 2 + ICON + GAPIN + Math.ceil(label.length * FS * 0.55);

  const widths = ROW.map(([label]) => widthOf(label));
  const rowW = widths.reduce((a, b) => a + b, 0) + PILL_GAP * (ROW.length - 1);
  // Left-aligned on the same 72px margin as the wordmark, so the whole
  // composition shares one edge instead of floating in the middle.
  const rowLeft = 72;
  let px = rowLeft;

  const pills = ROW.map(([label, icon], i) => {
    const w = widths[i];
    const x = px;
    px += w + PILL_GAP;
    return `
    <g>
      <rect x="${x.toFixed(1)}" y="${PILL_Y}" width="${w}" height="${PILL_H}" rx="${PILL_H / 2}"
            fill="rgba(169,216,248,0.055)" stroke="rgba(169,216,248,0.30)" stroke-width="1">
        <animate attributeName="stroke-opacity" values="0.30;0.58;0.30" dur="4.4s"
                 begin="${(-i * 0.55).toFixed(2)}s" repeatCount="indefinite"/>
      </rect>
      ${logoGlyph(icon, x + PADX, PILL_Y + (PILL_H - ICON) / 2, ICON, C.accent)}
      <text x="${(x + PADX + ICON + GAPIN).toFixed(1)}" y="${PILL_Y + PILL_H / 2 + 4.4}"
            font-family="${FONT}" font-size="${FS}" font-weight="600"
            fill="#c7dcf0">${esc(label)}</text>
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="268" viewBox="0 0 1200 268" role="img" aria-label="NingX-EnggTeam — senior web engineering team for Claude Code, Codex, OpenCode, Cursor and Copilot on Windows, macOS and Linux">
  <title>NingX-EnggTeam</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.deep}"/>
      <stop offset="0.55" stop-color="${C.mid}"/>
      <stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>
    <radialGradient id="g1"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2"><stop offset="0" stop-color="${C.core}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.core}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g3"><stop offset="0" stop-color="${C.light}" stop-opacity="0.28"/><stop offset="1" stop-color="${C.light}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="titleFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.62" stop-color="#dcecfb"/>
      <stop offset="1" stop-color="${C.light}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="rowSweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.core}" stop-opacity="0"/>
      <stop offset="0.35" stop-color="${C.accent}" stop-opacity="0.9"/>
      <stop offset="0.65" stop-color="${C.light}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${C.core}" stop-opacity="0"/>
      <animate attributeName="x1" values="-1;0;1" dur="7s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="0;1;2" dur="7s" repeatCount="indefinite"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="46"/>
    </filter>
    <clipPath id="titleClip">
      <text x="72" y="110" font-family="${FONT}" font-size="58" font-weight="800"
            letter-spacing="-1.2">NingX-EnggTeam</text>
    </clipPath>
    <clipPath id="rowClip">
      <rect x="${(rowLeft - 6).toFixed(1)}" y="${PILL_Y - 2}" width="${(rowW + 12).toFixed(1)}" height="${PILL_H + 4}" rx="18"/>
    </clipPath>
  </defs>

  <rect width="1200" height="268" fill="url(#bg)"/>
  <rect width="1200" height="268" fill="url(#grid)"/>

  ${orb("g1", 240, 105, 185, C.accent, 0.9, [240, 330, 180], 14)}
  ${orb("g2", 900, 175, 210, C.core, 0.85, [900, 810, 990], 17)}
  ${orb("g3", 640, 45, 155, C.light, 0.7, [640, 700, 590], 12)}

  <!-- a slow glow behind the wordmark so the type sits in light -->
  <ellipse cx="380" cy="104" rx="360" ry="104" fill="url(#glow)">
    <animate attributeName="opacity" values="0.65;1;0.65" dur="8s" repeatCount="indefinite"
             calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>
  </ellipse>

  <!-- concentric rings, slowly counter-rotating -->
  <g transform="translate(1012,104)" opacity="0.55">
    <circle r="92" fill="none" stroke="${C.accent}" stroke-opacity="0.22" stroke-width="1"/>
    <circle r="67" fill="none" stroke="${C.accent}" stroke-opacity="0.28" stroke-width="1"
            stroke-dasharray="6 10">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360"
                        dur="34s" repeatCount="indefinite"/>
    </circle>
    <circle r="44" fill="none" stroke="${C.light}" stroke-opacity="0.34" stroke-width="1.5"
            stroke-dasharray="2 7" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0"
                        dur="22s" repeatCount="indefinite"/>
    </circle>
    <circle r="4.5" fill="${C.light}">
      <animate attributeName="r" values="2.5;6;2.5" dur="3.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="3.6s" repeatCount="indefinite"/>
    </circle>
  </g>

  ${particles}

  <text x="72" y="50" font-family="${FONT}" font-size="12.5" font-weight="700"
        letter-spacing="3.4" fill="${C.accent}">SENIOR WEB ENGINEERING TEAM</text>

  <text x="72" y="108" font-family="${FONT}" font-size="58" font-weight="800"
        letter-spacing="-1.2" fill="url(#titleFill)">NingX-EnggTeam</text>

  <!-- light sweep across the wordmark -->
  <g clip-path="url(#titleClip)">
    <rect x="-460" y="38" width="300" height="110" fill="url(#shine)" transform="skewX(-18)">
      <animate attributeName="x" values="-460;820" dur="5.2s" begin="1.2s"
               repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>
    </rect>
  </g>

  <text x="72" y="150" font-family="${FONT}" font-size="18" fill="${C.muted}">
    Twelve roles · twenty-four named UI types · one guard that fails the build
  </text>

  <text x="72" y="186" font-family="${FONT}" font-size="10.5" font-weight="700"
        letter-spacing="2.6" fill="#6d8fae">WORKS WITH</text>

  ${pills}

  <!-- a slow highlight travelling across the logo row -->
  <g clip-path="url(#rowClip)">
    <rect x="-260" y="${PILL_Y - 4}" width="240" height="${PILL_H + 8}"
          fill="url(#rowSweep)" transform="skewX(-16)">
      <animate attributeName="x" values="-260;1240" dur="7s" begin="0.8s"
               repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1"/>
    </rect>
  </g>

  <rect x="0" y="265" width="1200" height="3" fill="url(#rule)"/>
</svg>
`;
}

// ── typing.svg（タイピング） ─────────────────────────────────────────
//
// Drawn on its own dark panel. GitHub renders the README on white, so a
// transparent SVG with near-white text is invisible — the panel is the
// reason this file has a background at all.

function typing() {
  const phrases = [
    "24 named UI types, each with a reference site",
    "12 senior roles that own specific decisions",
    "one guard that blocks the defaults before they land",
  ];

  const W = 900;
  const H = 96;
  const X = 24;
  const BASE = 70;
  const SIZE = 22;
  const CHAR = SIZE * 0.6; // monospace advance
  const PROMPT = "$ ";
  const promptW = PROMPT.length * CHAR;
  const CYCLE = 18;
  const PER = CYCLE / phrases.length;
  const TYPE = 1.3;

  const groups = phrases
    .map((phrase, i) => {
      const start = i * PER;
      const end = start + PER - 0.6;
      const n = phrase.length;
      const step = TYPE / n;

      // width keyframes
      const wTimes = [0, start / CYCLE];
      const wVals = [0, 0];
      for (let k = 1; k <= n; k += 1) {
        wTimes.push((start + k * step) / CYCLE);
        wVals.push((k * CHAR).toFixed(2));
      }
      wTimes.push(end / CYCLE, 1);
      wVals.push((n * CHAR).toFixed(2), 0);

      // opacity keyframes
      const oTimes = [0, start / CYCLE, end / CYCLE, 1];
      const oVals = [0, 1, 0, 0];

      // cursor x keyframes
      const cTimes = [0, start / CYCLE];
      const cVals = [X + promptW, X + promptW];
      for (let k = 1; k <= n; k += 1) {
        cTimes.push((start + k * step) / CYCLE);
        cVals.push((X + promptW + k * CHAR).toFixed(2));
      }
      cTimes.push(end / CYCLE, 1);
      cVals.push((X + promptW + n * CHAR).toFixed(2), (X + promptW + n * CHAR).toFixed(2));

      return `
  <g opacity="0">
    <animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"
             keyTimes="${oTimes.map((t) => t.toFixed(5)).join(";")}"
             values="${oVals.join(";")}"/>
    <text x="${X + promptW}" y="${BASE}" font-family="${MONO}" font-size="${SIZE}" fill="${C.ink}"
          clip-path="url(#clip${i})">${esc(phrase)}</text>
    <clipPath id="clip${i}">
      <rect x="${X + promptW}" y="${BASE - 26}" width="0" height="36">
        <animate attributeName="width" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"
                 keyTimes="${wTimes.map((t) => t.toFixed(5)).join(";")}"
                 values="${wVals.join(";")}"/>
      </rect>
    </clipPath>
    <rect x="${X + promptW}" y="${BASE - 19}" width="2.5" height="24" fill="${C.accent}">
      <animate attributeName="x" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"
               keyTimes="${cTimes.map((t) => t.toFixed(5)).join(";")}"
               values="${cVals.join(";")}"/>
      <animate attributeName="opacity" values="1;1;0;0" dur="${CYCLE}s" repeatCount="indefinite"
               calcMode="discrete" keyTimes="0;${((start + TYPE) / CYCLE).toFixed(5)};${(end / CYCLE).toFixed(5)};1"/>
    </rect>
  </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="24 named UI types, 12 senior roles, one guard">
  <title>What it ships</title>
  <defs>
    <linearGradient id="term" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#0a1a2b"/>
      <stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>
  </defs>

  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="16"
        fill="url(#term)" stroke="#1b3f66" stroke-width="1.5"/>

  <circle cx="28" cy="27" r="5" fill="#ff5f57"/>
  <circle cx="48" cy="27" r="5" fill="#febc2e"/>
  <circle cx="68" cy="27" r="5" fill="#28c840"/>

  <line x1="0" y1="46" x2="${W}" y2="46" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>

  <text x="${X}" y="${BASE}" font-family="${MONO}" font-size="${SIZE}" font-weight="700" fill="${C.accent}">${PROMPT}</text>
${groups}
</svg>
`;
}

// ── author.svg（開発者） ─────────────────────────────────────────────

function author() {
  const jpg = readFileSync(join(HERE, "portrait.jpg")).toString("base64");
  const S = 300;
  const R = 112;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="Nitin Sharma, developer of NingX-EnggTeam">
  <title>Nitin Sharma</title>
  <defs>
    <linearGradient id="ringA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.light}"/>
      <stop offset="0.5" stop-color="${C.accent}"/>
      <stop offset="1" stop-color="${C.core}"/>
    </linearGradient>
    <linearGradient id="ringB" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.light}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.light}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${C.light}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="halo">
      <stop offset="0.55" stop-color="${C.accent}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="face"><circle cx="${S / 2}" cy="${S / 2}" r="${R}"/></clipPath>
    <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>

  <!-- pulsing halo -->
  <circle cx="${S / 2}" cy="${S / 2}" r="${R + 26}" fill="url(#halo)">
    <animate attributeName="r" values="${R + 20};${R + 34};${R + 20}" dur="4.4s"
             repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>
  </circle>

  <!-- counter-rotating arcs -->
  <g transform="translate(${S / 2},${S / 2})">
    <circle r="${R + 14}" fill="none" stroke="url(#ringA)" stroke-width="2.5"
            stroke-dasharray="150 400" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360"
                        dur="7s" repeatCount="indefinite"/>
    </circle>
    <circle r="${R + 14}" fill="none" stroke="url(#ringB)" stroke-width="2"
            stroke-dasharray="70 400" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0"
                        dur="11s" repeatCount="indefinite"/>
    </circle>
    <circle r="${R + 24}" fill="none" stroke="${C.accent}" stroke-opacity="0.18" stroke-width="1"/>
  </g>

  <!-- portrait -->
  <g clip-path="url(#face)">
    <image href="data:image/jpeg;base64,${jpg}" x="${(S - 2 * R) / 2}" y="${(S - 2 * R) / 2}"
           width="${2 * R}" height="${2 * R}" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <circle cx="${S / 2}" cy="${S / 2}" r="${R}" fill="none" stroke="${C.light}"
          stroke-opacity="0.55" stroke-width="1.5"/>
</svg>
`;
}

// ── divider.svg（区切り） ────────────────────────────────────────────

function divider() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="26" viewBox="0 0 1200 26" role="presentation">
  <defs>
    <linearGradient id="d" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.accent}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="12" width="1200" height="1.5" fill="url(#d)"/>
  <rect x="-220" y="11" width="220" height="3.5" fill="url(#sweep)">
    <animate attributeName="x" values="-220;1200" dur="6s" repeatCount="indefinite"
             calcMode="spline" keySplines="0.4 0 0.6 1"/>
  </rect>
  <g transform="translate(600,13)">
    <rect x="-5" y="-5" width="10" height="10" fill="${C.accent}" transform="rotate(45)">
      <animate attributeName="opacity" values="0.45;1;0.45" dur="3s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>
`;
}

// ── footer.svg（フッター） ───────────────────────────────────────────

function footer() {
  const wave = (y, amp, dur, opacity) => `
  <path d="M-400 ${y} q 100 -${amp} 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 L 1600 240 L -400 240 Z"
        fill="${C.accent}" fill-opacity="${opacity}">
    <animateTransform attributeName="transform" type="translate"
                      values="0 0; 200 0; 0 0" dur="${dur}s" repeatCount="indefinite"
                      calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
  </path>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="120" viewBox="0 0 1200 120" role="img" aria-label="Made by Nitin Sharma">
  <title>Made by Nitin Sharma</title>
  <defs>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.deep}"/>
      <stop offset="0.5" stop-color="${C.mid}"/>
      <stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>
    <clipPath id="frame">
      <rect x="0.75" y="0.75" width="1198.5" height="118.5" rx="18"/>
    </clipPath>
  </defs>

  <g clip-path="url(#frame)">
    <rect x="0" y="0" width="1200" height="120" fill="url(#band)"/>
    ${wave(88, 22, 9, 0.16)}
    ${wave(104, 16, 13, 0.22)}
  </g>

  <rect x="0.75" y="0.75" width="1198.5" height="118.5" rx="18"
        fill="none" stroke="#1b3f66" stroke-width="1.5"/>

  <text x="600" y="52" text-anchor="middle" font-family="${FONT}" font-size="16"
        font-weight="700" fill="${C.light}">Made by Nitin Sharma</text>
  <text x="600" y="74" text-anchor="middle" font-family="${FONT}" font-size="12"
        fill="${C.muted}">Twelve roles · twenty-four UI types · one guard</text>
</svg>
`;
}

// ── write（書き出し） ────────────────────────────────────────────────

const files = {
  "hero.svg": banner(),
  "typing.svg": typing(),
  "author.svg": author(),
  "divider.svg": divider(),
  "signoff.svg": footer(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(OUT(name), content, "utf8");
  process.stdout.write(`${name.padEnd(14)} ${content.length} bytes\n`);
}
