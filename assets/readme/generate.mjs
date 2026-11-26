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

function banner() {
  const rand = rng(7);
  const particles = Array.from({ length: 22 }, (_, i) => {
    const x = 40 + rand() * 1120;
    const y = 40 + rand() * 220;
    const r = 0.8 + rand() * 1.9;
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

  const chips = [
    "Claude Code",
    "Codex",
    "OpenCode",
    "Cursor",
    "Copilot",
    "Windows · macOS · Linux",
  ];
  let cx = 72;
  const chipSvg = chips
    .map((label) => {
      const w = Math.round(label.length * 6.9 + 30);
      const svg = `<g>
        <rect x="${cx}" y="228" width="${w}" height="30" rx="15"
              fill="rgba(169,216,248,0.07)" stroke="rgba(169,216,248,0.32)" stroke-width="1"/>
        <text x="${cx + w / 2}" y="248" text-anchor="middle" font-family="${FONT}"
              font-size="12.5" font-weight="600" fill="${C.muted}">${esc(label)}</text>
      </g>`;
      cx += w + 10;
      return svg;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300" role="img" aria-label="NingX-EnggTeam — senior web engineering team for AI coding harnesses">
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
      <text x="72" y="150" font-family="${FONT}" font-size="66" font-weight="800"
            letter-spacing="-1.4">NingX-EnggTeam</text>
    </clipPath>
  </defs>

  <rect width="1200" height="300" fill="url(#bg)"/>
  <rect width="1200" height="300" fill="url(#grid)"/>

  ${orb("g1", 240, 120, 190, C.accent, 0.9, [240, 330, 180], 14)}
  ${orb("g2", 900, 200, 220, C.core, 0.85, [900, 810, 990], 17)}
  ${orb("g3", 640, 60, 160, C.light, 0.7, [640, 700, 590], 12)}

  <!-- concentric rings, slowly counter-rotating -->
  <g transform="translate(1002,148)" opacity="0.5">
    <circle r="118" fill="none" stroke="${C.accent}" stroke-opacity="0.22" stroke-width="1"/>
    <circle r="86" fill="none" stroke="${C.accent}" stroke-opacity="0.28" stroke-width="1"
            stroke-dasharray="6 10">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360"
                        dur="34s" repeatCount="indefinite"/>
    </circle>
    <circle r="56" fill="none" stroke="${C.light}" stroke-opacity="0.34" stroke-width="1.5"
            stroke-dasharray="2 7" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0"
                        dur="22s" repeatCount="indefinite"/>
    </circle>
    <circle r="5" fill="${C.light}">
      <animate attributeName="r" values="3;7;3" dur="3.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="3.6s" repeatCount="indefinite"/>
    </circle>
  </g>

  ${particles}

  <text x="72" y="96" font-family="${FONT}" font-size="12.5" font-weight="700"
        letter-spacing="3.4" fill="${C.accent}">SENIOR WEB ENGINEERING TEAM</text>

  <text x="72" y="150" font-family="${FONT}" font-size="66" font-weight="800"
        letter-spacing="-1.4" fill="url(#titleFill)">NingX-EnggTeam</text>

  <!-- light sweep across the wordmark -->
  <g clip-path="url(#titleClip)">
    <rect x="-460" y="80" width="300" height="110" fill="url(#shine)" transform="skewX(-18)">
      <animate attributeName="x" values="-460;820" dur="5.2s" begin="1.2s"
               repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>
    </rect>
  </g>

  <text x="72" y="190" font-family="${FONT}" font-size="19" fill="${C.muted}">
    Twelve roles · twenty-four named UI types · one guard that fails the build
  </text>

  ${chipSvg}

  <rect x="0" y="297" width="1200" height="3" fill="url(#rule)"/>
</svg>
`;
}

// ── typing.svg（タイピング） ─────────────────────────────────────────

function typing() {
  const phrases = [
    "24 named UI types, each with a reference site",
    "12 senior roles that own specific decisions",
    "one guard that blocks the defaults before they land",
  ];

  const CHAR = 15.62; // 26px monospace advance
  const X = 26;
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
    <text x="${X + promptW}" y="38" font-family="${MONO}" font-size="26" fill="${C.ink}"
          clip-path="url(#clip${i})">${esc(phrase)}</text>
    <clipPath id="clip${i}">
      <rect x="${X + promptW}" y="8" width="0" height="42">
        <animate attributeName="width" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"
                 keyTimes="${wTimes.map((t) => t.toFixed(5)).join(";")}"
                 values="${wVals.join(";")}"/>
      </rect>
    </clipPath>
    <rect x="${X + promptW}" y="14" width="2.5" height="26" fill="${C.accent}">
      <animate attributeName="x" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"
               keyTimes="${cTimes.map((t) => t.toFixed(5)).join(";")}"
               values="${cVals.join(";")}"/>
      <animate attributeName="opacity" values="1;1;0;0" dur="${CYCLE}s" repeatCount="indefinite"
               calcMode="discrete" keyTimes="0;${((start + TYPE) / CYCLE).toFixed(5)};${(end / CYCLE).toFixed(5)};1"/>
    </rect>
  </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="56" viewBox="0 0 900 56" role="img" aria-label="24 named UI types, 12 senior roles, one guard">
  <title>What it ships</title>
  <text x="${X}" y="38" font-family="${MONO}" font-size="26" font-weight="700" fill="${C.accent}">${PROMPT}</text>
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
  const wave = (y, amp, dur, dir, opacity) => `
  <path d="M-400 ${y} q 100 -${amp} 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 L 1600 200 L -400 200 Z"
        fill="${C.accent}" fill-opacity="${opacity}">
    <animateTransform attributeName="transform" type="translate"
                      values="0 0; 200 0; 0 0" dur="${dur}s" repeatCount="indefinite"
                      calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
  </path>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="150" viewBox="0 0 1200 150" role="img" aria-label="Made by Nitin Sharma">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.core}" stop-opacity="0.22"/>
    </linearGradient>
    <clipPath id="frame"><rect width="1200" height="150"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    ${wave(78, 26, 9, 1, 0.055)}
    ${wave(100, 18, 13, -1, 0.085)}
    <rect x="0" y="104" width="1200" height="46" fill="url(#fade)"/>
  </g>
  <text x="600" y="112" text-anchor="middle" font-family="${FONT}" font-size="13.5"
        fill="${C.muted}">Made by <tspan fill="${C.light}" font-weight="700">Nitin Sharma</tspan></text>
</svg>
`;
}

// ── write（書き出し） ────────────────────────────────────────────────

const files = {
  "banner.svg": banner(),
  "typing.svg": typing(),
  "author.svg": author(),
  "divider.svg": divider(),
  "footer.svg": footer(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(OUT(name), content, "utf8");
  process.stdout.write(`${name.padEnd(14)} ${content.length} bytes\n`);
}
