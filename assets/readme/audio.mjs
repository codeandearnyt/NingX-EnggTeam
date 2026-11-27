#!/usr/bin/env node
/**
 * audio.mjs — 30.000 s stereo soundtrack for the NingX reel / 30秒ステレオ音源
 *
 * Dependency-free Node 24 ESM. No samples, no packages, no network.
 * Everything below is arithmetic: additive oscillators, seeded noise,
 * envelopes and a small state-variable filter.
 *
 * Output: reel-30s.wav — 48000 Hz, 16-bit PCM, stereo, 1,440,000 frames.
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Constants（定数） ──────────────────────────────────────────────
const SR = 48000;
const DUR = 30;
const FRAMES = 1_440_000;
const TAU = Math.PI * 2;
const BAR = 2.0;                 // 120 BPM, 4/4
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'reel-30s.wav');

const ROOTS = [45, 41, 48, 43];  // A2 F2 C3 G2
const PAD_CHORDS = [
  [57, 60, 64],                  // Am
  [53, 57, 60],                  // F
  [60, 64, 67],                  // C
  [55, 59, 62],                  // G
];
const ARP_CHORDS = [
  [69, 72, 76, 81],              // Am
  [65, 69, 72, 77],              // F
  [72, 76, 79, 84],              // C
  [67, 71, 74, 79],              // G
];
const SUB_PATTERN = [0.9, 0, 0.65, 0.5, 0.9, 0, 0.65, 0.5];

const L = new Float64Array(FRAMES);
const R = new Float64Array(FRAMES);

// ── PRNG（乱数） ──────────────────────────────────────────────────
// mulberry32 — deterministic, one instance per cue so order never matters.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── DSP helpers（DSP補助） ────────────────────────────────────────
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** Linear attack/release envelope over a fixed note length. */
function env(t, dur, attack, release) {
  if (t < 0 || t >= dur) return 0;
  const a = attack > 0 ? Math.min(1, t / attack) : 1;
  const r = release > 0 ? Math.min(1, (dur - t) / release) : 1;
  return a * r;
}

const sine = (f, t) => Math.sin(TAU * f * t);

/**
 * Add one mono voice into the stereo bus.
 * `pan` is a number in [-1, 1] or a function of normalised position.
 */
function place(t0, dur, gain, pan, fn) {
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  const s0 = Math.max(0, start);
  const s1 = Math.min(FRAMES, start + n);
  const panFn = typeof pan === 'function' ? pan : null;
  for (let i = s0; i < s1; i++) {
    const tau = (i - start) / SR;
    const v = fn(tau, i - start) * gain;
    const p = panFn ? panFn((i - start) / n) : pan;
    const a = ((p + 1) * Math.PI) / 4;
    L[i] += v * Math.cos(a) * Math.SQRT2;
    R[i] += v * Math.sin(a) * Math.SQRT2;
  }
}

/** Mix a pre-rendered mono buffer into the bus. */
function mixBuf(t0, buf, gain = 1, pan = 0) {
  const start = Math.round(t0 * SR);
  const s0 = Math.max(0, start);
  const s1 = Math.min(FRAMES, start + buf.length);
  const panFn = typeof pan === 'function' ? pan : null;
  for (let i = s0; i < s1; i++) {
    const v = buf[i - start] * gain;
    const p = panFn ? panFn((i - start) / buf.length) : pan;
    const a = ((p + 1) * Math.PI) / 4;
    L[i] += v * Math.cos(a) * Math.SQRT2;
    R[i] += v * Math.sin(a) * Math.SQRT2;
  }
}

/** One-pole high-pass, in place. Difference form, cheap and stable. */
function hpFilter(b, fc) {
  const a = 1 / (1 + (TAU * fc) / SR);
  let prevIn = 0;
  let prevOut = 0;
  for (let i = 0; i < b.length; i++) {
    const x = b[i];
    const y = a * (prevOut + x - prevIn);
    prevIn = x;
    prevOut = y;
    b[i] = y;
  }
  return b;
}

/** Chamberlin state-variable band-pass with a time-varying centre. */
function svfBP(b, fFn, q = 1) {
  let low = 0;
  let band = 0;
  for (let i = 0; i < b.length; i++) {
    const fc = Math.min(SR * 0.2, Math.max(30, fFn(i / SR)));
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const high = b[i] - low - q * band;
    band += f * high;
    low += f * band;
    b[i] = band;
  }
  return b;
}

// ── Instruments（楽器） ───────────────────────────────────────────
// Kick: 130 Hz → 46 Hz pitch drop over 90 ms, ~380 ms body, 3 ms click.
function kick(t0, gain = 0.5, pitch = 1) {
  const rng = mulberry32(0x1000 + Math.round(t0 * 1000));
  let ph = 0;
  const k = 1 / 0.026;
  place(t0, 0.55, gain, 0, (t) => {
    const f0 = 130 * pitch;
    const f1 = 46 * pitch;
    ph += (TAU * (f1 + (f0 - f1) * Math.exp(-k * t))) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.10);
    const click = t < 0.003 ? (rng() * 2 - 1) * (1 - t / 0.003) * 0.35 : 0;
    return (body + click) * Math.min(1, t / 0.0015);
  });
}

// Sub bass: sine one octave under the bar root, gated, short attack.
function sub(t0, dur, note, gain) {
  const f = midiToHz(note);
  place(t0, dur, gain, 0, (t) => {
    const a = Math.min(1, t / 0.006);
    const r = Math.min(1, (dur - t) / 0.04);
    const s = Math.sin(TAU * f * t);
    return (Math.tanh(s * 1.35) / Math.tanh(1.35)) * a * r;
  });
}

// Pad: three chord tones, each 3 detuned additive saws (1/n, n = 1..7).
function padNote(t0, dur, note, gain, cutoff, pan) {
  const f = midiToHz(note);
  const partials = [];
  for (const det of [-6, 0, 6]) {
    const fd = f * Math.pow(2, det / 1200);
    for (let n = 1; n <= 7; n++) {
      const fn = fd * n;
      const lp = 1 / (1 + (fn / cutoff) ** 2);   // one-pole magnitude, no filter state
      partials.push([TAU * fn, (1 / n) * lp, det * 0.01]);
    }
  }
  place(t0, dur, gain, pan, (t) => {
    const e = env(t, dur, 0.4, 0.9);
    let s = 0;
    for (let i = 0; i < partials.length; i++) {
      const p = partials[i];
      s += p[1] * Math.sin(p[0] * t + p[2]);
    }
    return (s / 3) * e;
  });
}

// Hats: seeded noise burst, one-pole high-pass, exponential decay.
function hat(t0, gain, pan, open = false) {
  const tau = open ? 0.088 : 0.018;
  const dur = tau * 6;
  const n = Math.ceil(dur * SR);
  const b = new Float64Array(n);
  const rng = mulberry32(0x2000 + Math.round(t0 * 10000));
  for (let i = 0; i < n; i++) b[i] = rng() * 2 - 1;
  hpFilter(b, 7200);
  for (let i = 0; i < n; i++) b[i] *= Math.exp(-i / SR / tau);
  mixBuf(t0, b, gain, pan);
}

// Clap: three 8 ms-spaced bursts through a 1.6 kHz band-pass, 180 ms tail.
function clap(t0, gain, pan) {
  const n = Math.ceil(0.36 * SR);
  const b = new Float64Array(n);
  const rng = mulberry32(0x3000 + Math.round(t0 * 100));
  for (let i = 0; i < n; i++) b[i] = rng() * 2 - 1;
  svfBP(b, () => 1600, 0.9);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let e = 0;
    for (let k = 0; k < 3; k++) {
      const dt = t - k * 0.008;
      if (dt >= 0) e += Math.exp(-dt / 0.004) * (k === 0 ? 1 : 0.65);
    }
    e += Math.exp(-t / 0.055) * 0.5;
    out[i] = b[i] * e;
  }
  mixBuf(t0, out, gain, pan);
}

// Arpeggio: triangle-ish (odd harmonics, 1/n²), 90 ms decay.
function arp(t0, dur, note, gain, pan) {
  const f = midiToHz(note);
  place(t0, dur, gain, pan, (t) => {
    const e = Math.exp(-t / 0.038) * Math.min(1, t / 0.0025);
    let s = 0;
    for (let n = 1; n <= 7; n += 2) s += Math.sin(TAU * f * n * t) / (n * n);
    return s * e;
  });
}

// Lead: soft square (odd harmonics 1/n), 5 Hz vibrato at ±8 cents.
function lead(t0, dur, note, gain) {
  const f = midiToHz(note);
  const beta = (0.00463 * f) / 5;   // phase-modulation index for ±8 cents
  place(t0, dur, gain, 0, (t) => {
    const e = env(t, dur, 0.22, 0.55);
    const phase = TAU * f * t + beta * Math.sin(TAU * 5 * t);
    let s = 0;
    for (let n = 1; n <= 9; n += 2) s += Math.sin(n * phase) / n;
    return (s / 1.27) * e * 0.6;
  });
}

// ── SFX primitives（効果音の部品） ───────────────────────────────
function noiseSweep(t0, dur, f0, f1, gain, pan0 = 0, pan1 = 0, q = 1.1) {
  const n = Math.ceil(dur * SR);
  const b = new Float64Array(n);
  const rng = mulberry32(0x4000 + Math.round(t0 * 1000) + Math.round(f0));
  for (let i = 0; i < n; i++) b[i] = rng() * 2 - 1;
  svfBP(b, (t) => f0 * Math.pow(f1 / f0, Math.min(1, t / dur)), q);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    b[i] *= Math.sin(Math.PI * u) ** 2;
  }
  mixBuf(t0, b, gain, (u) => pan0 + (pan1 - pan0) * u);
}

function mouseClick(t0, gain = 0.2) {
  const rng = mulberry32(0x5000 + Math.round(t0 * 1000));
  place(t0, 0.04, gain, (rng() - 0.5) * 0.4, (t) => {
    const n = (rng() * 2 - 1) * Math.exp(-t / 0.0012) * 0.7;
    const blip = Math.sin(TAU * 1800 * t) * Math.exp(-t / 0.005) * 0.5;
    return n + blip;
  });
}

function chime(t0, freqs, gain, decay, stagger = 0) {
  const mid = (freqs.length - 1) / 2;
  freqs.forEach((f, i) => {
    place(t0 + i * stagger, decay * 4, gain, (i - mid) * 0.22, (x) => {
      const e = Math.exp(-x / decay) * Math.min(1, x / 0.004);
      return (Math.sin(TAU * f * x) + 0.18 * Math.sin(TAU * f * 2 * x)) * e;
    });
  });
}

// Filtered noise thud + pitched body. Base of the typography hits.
function thud(t0, freq, gain, pan = 0) {
  const n = Math.ceil(0.3 * SR);
  const b = new Float64Array(n);
  const rng = mulberry32(0x6000 + Math.round(t0 * 1000));
  for (let i = 0; i < n; i++) b[i] = rng() * 2 - 1;
  svfBP(b, () => 420, 1.1);
  for (let i = 0; i < n; i++) b[i] *= Math.exp(-i / SR / 0.045);
  mixBuf(t0, b, gain * 0.55, pan);
  place(t0, 0.32, gain, pan, (t) => Math.sin(TAU * freq * t) * Math.exp(-t / 0.07));
}

// ── Harmony & arrangement（和声と構成） ──────────────────────────
for (let bar = 0; bar < 15; bar++) {
  const t = bar * BAR;
  const chord = bar % 4;
  const root = bar === 14 ? 43 : ROOTS[chord];

  // Pad — softer and darker in the intro, open at the climax.
  const cutoff = bar < 3 ? 1700 : bar < 6 ? 2400 : bar < 10 ? 3400 : bar < 14 ? 5200 : 2800;
  const padDur = bar === 14 ? 2.0 : 2.9;
  PAD_CHORDS[chord].forEach((m, i) => padNote(t, padDur, m, 0.075, cutoff, (i - 1) * 0.12));

  // Sub bass from the build through the climax.
  if (bar >= 3 && bar <= 13) {
    for (let i = 0; i < 8; i++) {
      const g = SUB_PATTERN[i];
      if (!g) continue;
      sub(t + i * 0.25, 0.22, root - 12, 0.19 * g);
    }
  }

  // Drums.
  if (bar >= 3 && bar <= 13) {
    for (let b = 0; b < 4; b++) kick(t + b * 0.5, 0.34);
  }
  if (bar >= 3 && bar <= 5) {
    for (let i = 0; i < 8; i++) hat(t + i * 0.25, 0.1, i % 2 ? 0.25 : -0.15);
    hat(t + 1.75, 0.1, 0.2, true);
  }
  if (bar >= 6 && bar <= 9) {
    for (let i = 0; i < 16; i++) {
      hat(t + i * 0.125, i % 4 === 0 ? 0.05 : 0.09, i % 2 ? 0.3 : -0.25);
    }
  }
  if (bar >= 10 && bar <= 13) {
    for (let i = 0; i < 16; i++) {
      hat(t + i * 0.125, i % 4 === 0 ? 0.055 : 0.1, i % 2 ? 0.32 : -0.28);
    }
    hat(t + 1.75, 0.09, 0.2, true);
  }
  if (bar >= 6 && bar <= 13) {
    clap(t + 0.5, 0.62, 0.05);
    clap(t + 1.5, 0.62, -0.05);
  }

  // Arpeggio — 16ths, up an octave for the climax.
  if (bar >= 6 && bar <= 13) {
    const oct = bar >= 10 ? 12 : 0;
    for (let i = 0; i < 16; i++) {
      arp(t + i * 0.125, 0.16, ARP_CHORDS[chord][i % 4] + oct, 0.13, i % 2 ? 0.35 : -0.35);
    }
  }
}

// Lead line over the climax bars.
const LEAD_NOTES = [76, 74, 72, 71];
for (let i = 0; i < 4; i++) lead(20.0 + i * BAR, 1.9, LEAD_NOTES[i], 0.15);

// Final impact at the resolve downbeat (drums are out everywhere else).
kick(28.0, 0.4);
thud(28.0, 70, 0.4);

// ── SFX cue sheet（効果音キュー） ─────────────────────────────────
// 0.00 — deep impact: 120 → 38 Hz over 700 ms, noise burst, long tail.
{
  const rng = mulberry32(0x7001);
  let ph = 0;
  place(0, 2.4, 0.62, 0, (t) => {
    const f = 38 + (120 - 38) * Math.exp(-t / 0.18);
    ph += (TAU * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.55);
    const burst = (rng() * 2 - 1) * Math.exp(-t / 0.08) * 0.35;
    const tail = Math.sin(TAU * 30 * t) * Math.exp(-t / 0.9) * 0.22;
    return (body + burst + tail) * Math.min(1, t / 0.004);
  });
}

// 0.15 — particle shimmer: seeded high pings, 2.4–5 kHz, spread 0.15–1.9 s.
{
  const rng = mulberry32(0x7002);
  for (let i = 0; i < 24; i++) {
    const t0 = 0.15 + rng() * 1.75;
    const f = 2400 + rng() * 2600;
    const pan = rng() * 1.2 - 0.6;
    const d = 0.08 + rng() * 0.12;
    place(t0, d * 4, 0.055, pan, (t) =>
      Math.sin(TAU * f * t) * Math.exp(-t / d) * Math.min(1, t / 0.002));
  }
}

// 1.05 — emblem bloom: A5 C6 E6, rising 900 ms shimmer.
{
  const notes = [880, 1046.5, 1318.5];
  notes.forEach((f, i) => {
    let ph = 0;
    place(1.05, 1.2, 0.1, (i - 1) * 0.25, (t) => {
      const glide = 1 + 0.02 * (1 - Math.exp(-t / 0.12));
      ph += (TAU * f * glide) / SR;
      const e = Math.exp(-t / 0.3) * Math.min(1, t / 0.006);
      return (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * e;
    });
  });
}

// 2.00 — bass hit into the kinetic type.
{
  let ph = 0;
  place(2.0, 0.9, 0.34, 0, (t) => {
    ph += (TAU * (42 + 26 * Math.exp(-t / 0.05))) / SR;
    return Math.sin(ph) * Math.exp(-t / 0.28) * Math.min(1, t / 0.005);
  });
}

// 2.02 — typography impact.
thud(2.02, 90, 0.5, -0.05);

// 3.10 / 5.10 / 18.50 / 22.95 / 29.32 — mouse clicks.
mouseClick(3.1);
mouseClick(5.1);

// 4.00 — whoosh, browser opens, 300 → 3000 Hz, centre → right.
noiseSweep(4.0, 0.38, 300, 3000, 0.2, 0, 0.7, 1.0);

// 5.14 — confirmation chime E6 B6.
chime(5.14, [1318.5, 1975.5], 0.09, 0.09);

// 6.00 — whoosh + soft bass impact.
noiseSweep(6.0, 0.42, 400, 4200, 0.18, -0.4, 0.3, 0.9);
thud(6.0, 55, 0.32);

// 8.05 … 8.655 — twelve tiny digital pulses, 2.6 kHz, alternating pan.
for (let i = 0; i < 12; i++) {
  place(8.05 + i * 0.055, 0.1, 0.05, i % 2 ? 0.45 : -0.45, (t) =>
    Math.sin(TAU * 2600 * t) * Math.exp(-t / 0.012) * Math.min(1, t / 0.0015));
}

// 10.00 … 10.30 — four soft UI pops.
for (let i = 0; i < 4; i++) {
  const t0 = 10.0 + i * 0.1;
  const rng = mulberry32(0x7100 + i);
  place(t0, 0.08, 0.17, (i - 1.5) * 0.25, (t) => {
    const click = (rng() * 2 - 1) * Math.exp(-t / 0.0015) * 0.4;
    return click + Math.sin(TAU * 1200 * t) * Math.exp(-t / 0.02);
  });
}

// 11.30 — soft mechanical click.
mouseClick(11.3, 0.1);

// 12.00 — rising digital sweep, saw 200 → 2000 Hz, 400 ms, low level.
{
  const dur = 0.4;
  const ph = new Float64Array(12);
  place(12.0, dur, 0.1, 0, (t) => {
    const f = 200 * Math.pow(10, t / dur);
    let s = 0;
    for (let n = 1; n <= 12; n++) {
      ph[n - 1] += (TAU * f * n) / SR;
      s += Math.sin(ph[n - 1]) / n;
    }
    return s * Math.sin(Math.PI * Math.min(1, t / dur)) ** 2 * 0.5;
  });
}

// 12.06 + i·0.075 — seven soft activations, 880 Hz, 70 ms.
for (let i = 0; i < 7; i++) {
  place(12.06 + i * 0.075, 0.12, 0.095, i % 2 ? 0.4 : -0.4, (t) =>
    Math.sin(TAU * 880 * t) * Math.exp(-t / 0.022) * Math.min(1, t / 0.002));
}

// 14.00 — shield formation: 70 Hz body + inharmonic 1.7 k / 2.9 k.
{
  place(14.0, 0.55, 0.42, 0, (t) => {
    const e = Math.exp(-t / 0.09) * Math.min(1, t / 0.004);
    return (
      Math.sin(TAU * 70 * t) * 0.8 +
      Math.sin(TAU * 1700 * t) * Math.exp(-t / 0.13) * 0.35 +
      Math.sin(TAU * 2900 * t) * Math.exp(-t / 0.16) * 0.22
    ) * e;
  });
  noiseSweep(14.0, 0.12, 2500, 5000, 0.1, 0, 0, 1.4);
}

// 16.00 — scanner sweep 800 → 4000 Hz over 1.6 s + eight beeps.
noiseSweep(16.0, 1.6, 800, 4000, 0.07, -0.5, 0.5, 1.3);
for (let i = 0; i < 8; i++) {
  place(16.15 + i * 0.18, 0.05, 0.07, i % 2 ? 0.3 : -0.3, (t) =>
    Math.sin(TAU * 2400 * t) * Math.exp(-t / 0.008) * Math.min(1, t / 0.001));
}

// 18.50 — mouse click on the terminal.
mouseClick(18.5);

// 18.55–19.25 — 46 seeded key clicks, 25 ms each.
{
  const rng = mulberry32(0x7200);
  for (let i = 0; i < 46; i++) {
    const t0 = 18.55 + rng() * 0.7;
    const f = 1500 + rng() * 1800;
    const pan = rng() * 0.5 - 0.25;
    place(t0, 0.025, 0.09, pan, (t) => {
      const n = (rng() * 2 - 1) * Math.exp(-t / 0.003);
      return (n * 0.7 + Math.sin(TAU * f * t) * Math.exp(-t / 0.004) * 0.4) * Math.min(1, t / 0.0008);
    });
  }
}

// 19.30 — terminal execute, short low blip.
place(19.3, 0.14, 0.16, 0, (t) =>
  Math.sin(TAU * 220 * t) * Math.exp(-t / 0.03) * Math.min(1, t / 0.002));

// 19.38 — success chime A5 C6 E6, 60 ms apart.
chime(19.38, [880, 1046.5, 1318.5], 0.09, 0.09, 0.06);

// 20.00 — data pulse.
{
  let ph = 0;
  place(20.0, 0.2, 0.13, 0.2, (t) => {
    ph += (TAU * (600 + 2400 * t)) / SR;
    return Math.sin(ph) * Math.exp(-t / 0.05) * Math.min(1, t / 0.002);
  });
}

// 20.05 — soft notification.
chime(20.05, [1568, 2093], 0.06, 0.06);

// 22.95 — mouse click + soft confirmation pop (700 Hz, 90 ms).
mouseClick(22.95);
place(22.95, 0.12, 0.12, -0.1, (t) =>
  Math.sin(TAU * 700 * t) * Math.exp(-t / 0.025) * Math.min(1, t / 0.003));

// 24.00 — device whoosh, 350 ms.
noiseSweep(24.0, 0.35, 500, 3600, 0.16, 0.5, -0.4, 1.1);

// 25.50 / 26.00 / 26.50 — three bass impacts, pitched A C E.
[110, 130.81, 164.81].forEach((f, i) => thud(25.5 + i * 0.5, f, 0.45, (i - 1) * 0.15));

// 27.00 — cinematic riser, 300 → 1600 Hz over 1.4 s, then the logo lands.
{
  const dur = 1.4;
  let ph = 0;
  place(27.0, dur, 0.16, 0, (t) => {
    const f = 300 * Math.pow(1600 / 300, t / dur);
    ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.pow(t / dur, 1.6);
  });
  noiseSweep(27.0, dur, 400, 6000, 0.12, -0.2, 0.2, 0.8);
}

// 28.40 — logo impact: 60 Hz hit + bright shimmer tail, 1.2 s.
{
  const rng = mulberry32(0x7300);
  let ph = 0;
  place(28.4, 1.5, 0.7, 0, (t) => {
    ph += (TAU * (60 + 40 * Math.exp(-t / 0.05))) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.5) * Math.min(1, t / 0.004);
    const burst = (rng() * 2 - 1) * Math.exp(-t / 0.05) * 0.4;
    return body + burst;
  });
  [2093, 2637, 3136, 4186].forEach((f, i) => {
    place(28.4, 1.2, 0.05, (i - 1.5) * 0.35, (t) =>
      Math.sin(TAU * f * t) * Math.exp(-t / 0.28) * Math.min(1, t / 0.01));
  });
}

// 29.32 — mouse click + bright chime E6 B6 E7.
mouseClick(29.32, 0.11);
chime(29.32, [1318.5, 1975.5, 2637], 0.085, 0.08, 0.05);

// ── Master bus（マスターバス） ────────────────────────────────────
// Gentle soft-knee bus compression, then peak normalise to −1.0 dBFS.
function busCompress(thresholdDb = -7, ratio = 1.6, kneeDb = 6, attackMs = 10, releaseMs = 140) {
  const atk = Math.exp(-1 / ((SR * attackMs) / 1000));
  const rel = Math.exp(-1 / ((SR * releaseMs) / 1000));
  const T = thresholdDb;
  const W = kneeDb;
  const slope = 1 / ratio - 1;
  let envelope = 0;
  for (let i = 0; i < FRAMES; i++) {
    const x = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    envelope = x > envelope
      ? atk * envelope + (1 - atk) * x
      : rel * envelope + (1 - rel) * x;
    const level = 20 * Math.log10(envelope + 1e-12);
    let gainDb = 0;
    if (level > T + W / 2) gainDb = T + (level - T) / ratio - level;
    else if (level > T - W / 2) {
      const d = level - (T - W / 2);
      gainDb = (slope * d * d) / (2 * W);
    }
    const g = Math.pow(10, gainDb / 20);
    L[i] *= g;
    R[i] *= g;
  }
}

busCompress();

let peak = 0;
for (let i = 0; i < FRAMES; i++) {
  const a = Math.abs(L[i]);
  const b = Math.abs(R[i]);
  if (a > peak) peak = a;
  if (b > peak) peak = b;
}

const target = Math.pow(10, -1 / 20);
const norm = target / (peak || 1);
for (let i = 0; i < FRAMES; i++) {
  L[i] *= norm;
  R[i] *= norm;
}

// 3 ms de-click at the head, 12 ms fade at the tail so frame 1,439,999 is zero.
const fadeIn = Math.round(0.003 * SR);
for (let i = 0; i < fadeIn; i++) {
  const g = i / fadeIn;
  L[i] *= g;
  R[i] *= g;
}
const fadeOut = Math.round(0.012 * SR);
for (let i = 0; i < fadeOut; i++) {
  const g = i / fadeOut;
  const j = FRAMES - 1 - i;
  L[j] *= g;
  R[j] *= g;
}

// ── WAV writer（WAV書き出し） ────────────────────────────────────
function writeWav(path, left, right) {
  const frames = left.length;
  const dataSize = frames * 4;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);          // PCM
  buf.writeUInt16LE(2, 22);          // stereo
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);     // byte rate
  buf.writeUInt16LE(4, 32);          // block align
  buf.writeUInt16LE(16, 34);         // bits per sample
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(dataSize, 40);

  let o = 44;
  for (let i = 0; i < frames; i++) {
    let a = Math.round(left[i] * 32767);
    let b = Math.round(right[i] * 32767);
    a = a > 32767 ? 32767 : a < -32768 ? -32768 : a;
    b = b > 32767 ? 32767 : b < -32768 ? -32768 : b;
    buf.writeInt16LE(a, o);
    buf.writeInt16LE(b, o + 2);
    o += 4;
  }

  writeFileSync(path, buf);
  return buf.length;
}

const bytes = writeWav(OUT, L, R);
const dbfs = 20 * Math.log10(peak * norm);

console.log(`wrote:  ${OUT}`);
console.log(`bytes:  ${bytes}`);
console.log(`frames: ${FRAMES} (${(FRAMES / SR).toFixed(3)} s)`);
console.log(`peak:   ${dbfs.toFixed(2)} dBFS`);
