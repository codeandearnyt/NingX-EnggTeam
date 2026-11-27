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

/**
 * One brand mark, nested so it scales into a square box.
 *
 * Each path carries its own fill, so the colour builds stay multi-tone —
 * Copilot keeps its rainbow, Codex its violet-to-indigo gradient. Any
 * gradients the mark needs travel with it inside its own <defs>, already
 * namespaced by fetch-logos.mjs.
 */
function logoGlyph(name, x, y, size) {
  const logo = LOGOS[name];
  if (!logo) return "";
  const defs = logo.defs ? `<defs>${logo.defs}</defs>` : "";
  const paths = logo.paths
    .map(
      (p) =>
        `<path d="${p.d}" fill="${p.fill}"${
          p.fillRule ? ` fill-rule="${p.fillRule}"` : ""
        }${p.clipRule ? ` clip-rule="${p.clipRule}"` : ""}${
          p.opacity ? ` opacity="${p.opacity}"` : ""
        }/>`,
    )
    .join("");
  return `<svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size}" height="${size}" viewBox="${logo.viewBox}" preserveAspectRatio="xMidYMid meet" overflow="visible">${defs}${paths}</svg>`;
}

function banner() {
  const rand = rng(7);

  const SPARK = ["#a9d8f8", "#5aa7e9", "#a78bfa", "#22d3ee", "#f472b6", "#fbbf24"];

  const particles = Array.from({ length: 30 }, (_, i) => {
    const x = 40 + rand() * 1120;
    const y = 24 + rand() * 250;
    const r = 0.7 + rand() * 1.8;
    const dur = 5 + rand() * 7;
    const delay = rand() * dur;
    const drift = -30 - rand() * 50;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"
        fill="${SPARK[i % SPARK.length]}" opacity="0">
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

  // Pill geometry. Sized so the row still ends near the right margin of the
  // wordmark's 72px edge instead of trailing off.
  const FS = 15;
  const PADX = 15;
  const ICON = 26;
  const GAPIN = 10;
  const PILL_H = 48;
  const PILL_GAP = 9;
  const PILL_Y = 214;
  const PILL_CY = PILL_Y + PILL_H / 2;

  const widthOf = (label) =>
    PADX * 2 + ICON + GAPIN + Math.ceil(label.length * FS * 0.575);

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
    const brand = LOGOS[icon]?.brand || C.accent;
    const iconX = x + PADX;
    const textX = x + PADX + ICON + GAPIN;
    return `
    <g>
      <!-- soft brand-coloured bloom behind the mark -->
      <circle cx="${(iconX + ICON / 2).toFixed(1)}" cy="${PILL_CY}" r="19"
              fill="${brand}" opacity="0.26" filter="url(#soft)">
        <animate attributeName="opacity" values="0.16;0.36;0.16" dur="5.2s"
                 begin="${(-i * 0.62).toFixed(2)}s" repeatCount="indefinite"
                 calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>
      </circle>
      <rect x="${x.toFixed(1)}" y="${PILL_Y}" width="${w}" height="${PILL_H}" rx="${PILL_H / 2}"
            fill="${brand}" fill-opacity="0.10"
            stroke="${brand}" stroke-opacity="0.36" stroke-width="1">
        <animate attributeName="stroke-opacity" values="0.30;0.66;0.30" dur="5.2s"
                 begin="${(-i * 0.62).toFixed(2)}s" repeatCount="indefinite"
                 calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>
      </rect>
      <!-- inner top light, so the pill reads as a pressed gel -->
      <rect x="${(x + PILL_H / 2).toFixed(1)}" y="${PILL_Y + 1}" width="${(w - PILL_H).toFixed(1)}" height="1"
            fill="#ffffff" fill-opacity="0.14"/>
      ${logoGlyph(icon, iconX, PILL_Y + (PILL_H - ICON) / 2, ICON)}
      <text x="${textX.toFixed(1)}" y="${(PILL_CY + 5.3).toFixed(1)}"
            font-family="${FONT}" font-size="${FS}" font-weight="600"
            fill="#dbe9f6">${esc(label)}</text>
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300" role="img" aria-label="NingX-EnggTeam — senior web engineering team for Claude Code, Codex, OpenCode, Cursor and Copilot on Windows, macOS and Linux">
  <title>NingX-EnggTeam</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.deep}"/>
      <stop offset="0.42" stop-color="#082038"/>
      <stop offset="0.72" stop-color="${C.mid}"/>
      <stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>

    <!-- four aurora orbs, one per hue, so the field is never one colour -->
    <radialGradient id="g1"><stop offset="0" stop-color="#4f9ee8" stop-opacity="0.50"/><stop offset="1" stop-color="#4f9ee8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2"><stop offset="0" stop-color="#8b6cff" stop-opacity="0.34"/><stop offset="1" stop-color="#8b6cff" stop-opacity="0"/></radialGradient>
    <radialGradient id="g3"><stop offset="0" stop-color="#2ad4c8" stop-opacity="0.26"/><stop offset="1" stop-color="#2ad4c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g4"><stop offset="0" stop-color="#f472b6" stop-opacity="0.24"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient>

    <!-- two title glows that cross-fade, drifting the hue behind the type -->
    <radialGradient id="glowA"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.30"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowB"><stop offset="0" stop-color="#8b6cff" stop-opacity="0.26"/><stop offset="1" stop-color="#8b6cff" stop-opacity="0"/></radialGradient>

    <linearGradient id="titleFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.58" stop-color="#dcecfb"/>
      <stop offset="1" stop-color="#b7c6ff"/>
    </linearGradient>

    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <linearGradient id="rowSweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <!-- the house spectrum: blue → violet → rose → amber → teal → cyan -->
    <linearGradient id="spectrum" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
      <stop offset="0" stop-color="#5aa7e9"/>
      <stop offset="0.17" stop-color="#8b6cff"/>
      <stop offset="0.34" stop-color="#f472b6"/>
      <stop offset="0.51" stop-color="#fbbf24"/>
      <stop offset="0.68" stop-color="#34d399"/>
      <stop offset="0.84" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#5aa7e9"/>
    </linearGradient>

    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <linearGradient id="eyebrowFill" gradientUnits="userSpaceOnUse" x1="72" y1="0" x2="352" y2="0">
      <stop offset="0" stop-color="#7fc0f5"/>
      <stop offset="0.5" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#f472b6"/>
    </linearGradient>

    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>

    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="46"/>
    </filter>
    <!-- small blur for the per-pill brand bloom -->
    <filter id="soft" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>

    <clipPath id="titleClip">
      <text x="72" y="118" font-family="${FONT}" font-size="58" font-weight="800"
            letter-spacing="-1.2">NingX-EnggTeam</text>
    </clipPath>
    <clipPath id="rowClip">
      <rect x="${(rowLeft - 6).toFixed(1)}" y="${PILL_Y - 2}" width="${(rowW + 12).toFixed(1)}" height="${PILL_H + 4}" rx="26"/>
    </clipPath>
  </defs>

  <!-- spectrum ribbon, with a sheen travelling along it -->
  <rect x="0" y="0" width="1200" height="3" fill="url(#spectrum)" opacity="0.92"/>
  <rect x="-300" y="0" width="300" height="3" fill="url(#sheen)" opacity="0.85">
    <animate attributeName="x" values="-300;1200" dur="6.5s" repeatCount="indefinite"
             calcMode="spline" keySplines="0.45 0 0.55 1"/>
  </rect>

  <rect width="1200" height="300" fill="url(#bg)"/>
  <rect width="1200" height="300" fill="url(#grid)"/>

  ${orb("g1", 230, 70, 210, C.accent, 0.9, [230, 320, 170], 14)}
  ${orb("g2", 860, 40, 250, "#8b6cff", 0.85, [860, 760, 950], 17)}
  ${orb("g3", 470, 300, 240, "#2ad4c8", 0.75, [470, 560, 400], 15)}
  ${orb("g4", 1130, 250, 210, "#f472b6", 0.7, [1130, 1040, 1180], 19)}

  <!-- two glows cross-fading, so the light behind the wordmark drifts hue -->
  <ellipse cx="340" cy="112" rx="390" ry="110" fill="url(#glowA)">
    <animate attributeName="opacity" values="0.85;0.28;0.85" dur="9s" repeatCount="indefinite"
             calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>
  </ellipse>
  <ellipse cx="340" cy="112" rx="390" ry="110" fill="url(#glowB)">
    <animate attributeName="opacity" values="0.18;0.78;0.18" dur="9s" repeatCount="indefinite"
             calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>
  </ellipse>

  <!-- concentric rings, slowly counter-rotating, one hue each -->
  <g transform="translate(1082,98)" opacity="0.62">
    <circle r="92" fill="none" stroke="#5aa7e9" stroke-opacity="0.24" stroke-width="1"/>
    <circle r="68" fill="none" stroke="#a78bfa" stroke-opacity="0.32" stroke-width="1"
            stroke-dasharray="6 10">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360"
                        dur="34s" repeatCount="indefinite"/>
    </circle>
    <circle r="46" fill="none" stroke="#22d3ee" stroke-opacity="0.36" stroke-width="1.5"
            stroke-dasharray="2 7" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0"
                        dur="22s" repeatCount="indefinite"/>
    </circle>
    <circle r="5" fill="#f472b6">
      <animate attributeName="r" values="2.5;6.5;2.5" dur="3.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="3.6s" repeatCount="indefinite"/>
    </circle>
  </g>

  ${particles}

  <text x="72" y="54" font-family="${FONT}" font-size="12.5" font-weight="700"
        letter-spacing="3.4" fill="url(#eyebrowFill)">SENIOR WEB ENGINEERING TEAM</text>

  <text x="72" y="118" font-family="${FONT}" font-size="58" font-weight="800"
        letter-spacing="-1.2" fill="url(#titleFill)">NingX-EnggTeam</text>

  <!-- light sweep across the wordmark -->
  <g clip-path="url(#titleClip)">
    <rect x="-460" y="58" width="300" height="96" fill="url(#shine)" transform="skewX(-18)">
      <animate attributeName="x" values="-460;820" dur="5.2s" begin="1.2s"
               repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>
    </rect>
  </g>

  <text x="72" y="160" font-family="${FONT}" font-size="19" fill="#9dbbd8">
    Twelve roles · twenty-four named UI types · one guard that fails the build
  </text>

  <!-- section label, led by a chip of the house spectrum -->
  <rect x="72" y="195" width="22" height="3" rx="1.5" fill="url(#spectrum)"/>
  <text x="102" y="200" font-family="${FONT}" font-size="10.5" font-weight="700"
        letter-spacing="2.6" fill="#7fa6c8">WORKS WITH</text>

  ${pills}

  <!-- a slow highlight travelling across the logo row -->
  <g clip-path="url(#rowClip)">
    <rect x="-260" y="${PILL_Y - 4}" width="240" height="${PILL_H + 8}"
          fill="url(#rowSweep)" transform="skewX(-16)">
      <animate attributeName="x" values="-260;1240" dur="7s" begin="0.8s"
               repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1"/>
    </rect>
  </g>

  <!-- closing rule in the same spectrum, thinner than the ribbon -->
  <rect x="0" y="297" width="1200" height="3" fill="url(#spectrum)" opacity="0.6"/>
  <rect x="-300" y="297" width="300" height="3" fill="url(#sheen)" opacity="0.6">
    <animate attributeName="x" values="-300;1200" dur="8.5s" begin="2s"
             repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1"/>
  </rect>
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
  "masthead.svg": banner(),
  "typing.svg": typing(),
  "author.svg": author(),
  "divider.svg": divider(),
  "signoff.svg": footer(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(OUT(name), content, "utf8");
  process.stdout.write(`${name.padEnd(14)} ${content.length} bytes\n`);
}
