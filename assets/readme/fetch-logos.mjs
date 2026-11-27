/**
 * fetch-logos.mjs — pulls the real brand marks and writes logos.mjs.
 * 本物のブランドマークを取り出して logos.mjs に書き出す。
 *
 * Where a vendor ships a colour build, that is the one used — the fills and
 * gradients come through untouched, so Copilot stays a rainbow and Codex
 * stays a violet-to-indigo gradient instead of collapsing to one flat tone.
 * Monochrome marks get their official brand hex.
 *
 * Sources:
 *   - @lobehub/icons-static-svg — AI harness marks, MIT-licensed set
 *   - simple-icons              — Apple, Linux
 *   - constructed               — Windows (simple-icons dropped it)
 *
 * Every mark is a trademark of its owner and is used here only to say
 * "this harness works". Nothing in this repo claims affiliation.
 *
 * Run:  node assets/readme/fetch-logos.mjs
 *
 * Made by Nitin Sharma.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const LOBE = (n) =>
  `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/${n}.svg`;
const SIMPLE = (n) => `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${n}.svg`;

// `brand` is the hex used for the pill tint, stroke and icon glow. For the
// marks that carry their own gradients it is the dominant stop.
const SOURCES = {
  claude: { url: LOBE("claude-color"), brand: "#D97757" },
  codex: { url: LOBE("codex-color"), brand: "#7A9DFF" },
  opencode: { url: LOBE("opencode"), brand: "#E9EFF7" },
  cursor: { url: LOBE("cursor-color"), brand: "#B9B7B2" },
  copilot: { url: LOBE("copilot-color"), brand: "#8C48FF" },
  apple: { url: SIMPLE("apple"), brand: "#D9DEE3" },
  linux: { url: SIMPLE("linux"), brand: "#FCC624" },
};

// ── extraction（抽出） ──────────────────────────────────────────────

/** Read the viewBox, falling back to width/height when it is missing. */
function extractViewBox(svg) {
  const vb = (svg.match(/\bviewBox="([^"]+)"/) || [])[1];
  if (vb) return vb.trim();
  const w = (svg.match(/\bwidth="([\d.]+)"/) || [])[1];
  const h = (svg.match(/\bheight="([\d.]+)"/) || [])[1];
  return w && h ? `0 0 ${w} ${h}` : "0 0 24 24";
}

/**
 * Namespace every id in the document. The marks are nested inside one big
 * banner SVG, so two vendors both shipping `id="a"` would cross-wire their
 * gradients. Prefixing with the logo key makes collisions impossible.
 */
function namespaceIds(svg, key) {
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  let out = svg;
  for (const id of ids) {
    out = out.split(id).join(`${key}--${id}`);
  }
  return out;
}

/** Pull the inner markup of <defs> so the gradients travel with the mark. */
function extractDefs(svg) {
  const m = svg.match(/<defs>([\s\S]*?)<\/defs>/);
  return m ? m[1].trim() : "";
}

/**
 * Pull every <path> out of an SVG document, keeping its fill rule and its
 * own fill. `currentColor` becomes the brand hex — that is what a monochrome
 * source means by it.
 */
function extractPaths(svg, brand) {
  const paths = [];
  const re = /<path\b([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(svg))) {
    const attrs = m[1];
    const d = (attrs.match(/\bd="([^"]+)"/) || [])[1];
    if (!d) continue;

    const fillAttr = (attrs.match(/\bfill="([^"]+)"/) || [])[1];
    const styleFill = (attrs.match(/style="[^"]*fill:\s*([^;"]+)/) || [])[1];
    let fill = (fillAttr || styleFill || "currentColor").trim();
    if (fill === "currentColor") fill = brand;

    const fillRule = (attrs.match(/\bfill-rule="([^"]+)"/) || [])[1] || null;
    const clipRule = (attrs.match(/\bclip-rule="([^"]+)"/) || [])[1] || null;
    const opacity = (attrs.match(/\bopacity="([^"]+)"/) || [])[1] || null;

    paths.push({ d, fill, fillRule, clipRule, opacity });
  }
  return paths;
}

// simple-icons dropped the Windows mark over trademark policy, so it is
// constructed here: four flat panes, 2-unit gutter, 0.55 corner radius.
function windowsMark() {
  const s = 9;
  const gap = 2;
  const r = 0.55;
  const o = 2;
  const cell = (x, y) =>
    `M${x + r} ${y}H${x + s - r}A${r} ${r} 0 0 1 ${x + s} ${y + r}` +
    `V${y + s - r}A${r} ${r} 0 0 1 ${x + s - r} ${y + s}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + s - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  return {
    viewBox: "0 0 24 24",
    brand: "#0078D4",
    defs: "",
    paths: [
      {
        d: [
          cell(o, o),
          cell(o + s + gap, o),
          cell(o, o + s + gap),
          cell(o + s + gap, o + s + gap),
        ].join(""),
        fill: "#0078D4",
        fillRule: null,
        clipRule: null,
        opacity: null,
      },
    ],
  };
}

// ── fetch（取得） ──────────────────────────────────────────────────

const out = {};
const report = [];

for (const [name, { url, brand }] of Object.entries(SOURCES)) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    const svg = namespaceIds(raw, name);
    const paths = extractPaths(svg, brand);
    if (!paths.length) throw new Error("no <path> found");

    const toneCount = new Set(paths.map((p) => p.fill)).size;
    out[name] = {
      viewBox: extractViewBox(svg),
      brand,
      defs: extractDefs(svg),
      paths,
    };
    report.push(
      `${name.padEnd(10)} ${String(paths.length).padStart(2)} path(s)  ` +
        `${String(toneCount).padStart(2)} tone(s)  ${out[name].viewBox}`,
    );
  } catch (err) {
    report.push(`${name.padEnd(10)} FAILED — ${err.message}`);
  }
}

if (!out.windows) {
  out.windows = windowsMark();
  report.push("windows    constructed (4 panes)");
}

// ── write（書き出し） ──────────────────────────────────────────────

const body = `/**
 * logos.mjs — real brand marks, extracted as raw path data.
 * 本物のブランドマークをパスデータとして保持する。
 *
 * GENERATED by fetch-logos.mjs. Do not edit by hand.
 * Generated ${new Date().toISOString().slice(0, 10)}
 *
 * Each entry is { viewBox, brand, defs, paths: [{ d, fill, fillRule, clipRule, opacity }] }.
 * Colour builds keep their own fills; \`defs\` carries any gradients they need.
 *
 * These are trademarks of their owners, used to state compatibility.
 *
 * Made by Nitin Sharma.
 */

export const LOGOS = ${JSON.stringify(out, null, 2)};
`;

writeFileSync(join(HERE, "logos.mjs"), body, "utf8");
process.stdout.write(report.join("\n") + "\n");
process.stdout.write(`\nlogos.mjs written — ${(body.length / 1024).toFixed(1)} KB\n`);
