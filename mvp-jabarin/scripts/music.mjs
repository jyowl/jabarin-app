// Procedural backsound: writes public/music/{hook,main}.m4a as seamless loops.
// Soft piano/bell arpeggio + pad, the calm corporate bed used in product-demo videos.
// Run: npm run music
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const SR = 44100;
const BPM = 76;
const BEAT = 60 / BPM;
const OUT = "public/music";

const hz = (semitonesFromA4) => 440 * 2 ** (semitonesFromA4 / 12);
// semitone offsets from A4
const CHORDS = {
  Am: [-12, -9, -5], // A C E
  F: [-16, -9, -4], // F A C
  C: [-21, -17, -12], // C E A(≈) -> C E A
  G: [-14, -10, -5], // G B E
};

/** Adds a decaying bell tone into buf, wrapping at the loop edge so loops are seamless. */
const bell = (buf, startSec, freq, gain, tau) => {
  const len = Math.min(buf.length, Math.round(tau * 4 * SR));
  const start = Math.round(startSec * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t / tau) * (1 - Math.exp(-t / 0.006));
    const s =
      Math.sin(2 * Math.PI * freq * t) +
      0.3 * Math.sin(4 * Math.PI * freq * t) +
      0.1 * Math.sin(6 * Math.PI * freq * t);
    buf[(start + i) % buf.length] += s * env * gain;
  }
};

/** Sustained pad with slow attack/release, zero at both ends. */
const pad = (buf, startSec, durSec, freq, gain) => {
  const len = Math.round(durSec * SR);
  const start = Math.round(startSec * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = i / len;
    const env = Math.sin(Math.PI * p) ** 1.5;
    const vib = 1 + 0.0015 * Math.sin(2 * Math.PI * 4.5 * t);
    const s = Math.sin(2 * Math.PI * freq * vib * t) + 0.22 * Math.sin(4 * Math.PI * freq * t);
    buf[(start + i) % buf.length] += s * env * gain;
  }
};

/** Soft sine thump on the downbeats — gives the bed a pulse without sounding like a drum kit. */
const pulse = (buf, startSec, freq, gain) => {
  const len = Math.min(buf.length, Math.round(0.6 * SR));
  const start = Math.round(startSec * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.12) * (1 - Math.exp(-t / 0.004));
    const sweep = freq * (1 + 0.6 * Math.exp(-t / 0.03));
    buf[(start + i) % buf.length] += Math.sin(2 * Math.PI * sweep * t) * env * gain;
  }
};

const render = ({ progression, arp, padGain, bellGain, pulseGain = 0 }) => {
  const bars = progression.length;
  const loopSec = bars * 4 * BEAT;
  const buf = new Float64Array(Math.round(loopSec * SR));

  progression.forEach((name, bar) => {
    const chord = CHORDS[name];
    const barStart = bar * 4 * BEAT;
    for (const n of chord) pad(buf, barStart, 4 * BEAT, hz(n - 12), padGain);
    if (pulseGain) {
      pulse(buf, barStart, hz(chord[0] - 24), pulseGain);
      pulse(buf, barStart + 2 * BEAT, hz(chord[0] - 24), pulseGain * 0.65);
    }
    arp.forEach((beat, k) => {
      const n = chord[k % chord.length];
      bell(buf, barStart + beat * BEAT, hz(n + 12), bellGain, 0.9);
    });
  });

  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const scale = 0.89 / peak;

  const pcm = Buffer.alloc(buf.length * 4);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.tanh(buf[i] * scale * 1.1);
    const s = Math.round(v * 32767);
    pcm.writeInt16LE(s, i * 4);
    pcm.writeInt16LE(s, i * 4 + 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return { wav: Buffer.concat([header, pcm]), loopSec };
};

const tracks = {
  // Hook: minor, sparse, unresolved — matches the complaints.
  hook: {
    progression: ["Am", "Am", "F", "F"],
    arp: [0, 2.5],
    padGain: 0.3,
    bellGain: 0.16,
  },
  // Main: vi-IV-I-V, steady eighths + soft pulse — the hopeful product bed.
  main: {
    progression: ["Am", "F", "C", "G"],
    arp: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
    padGain: 0.26,
    bellGain: 0.2,
    pulseGain: 0.5,
  },
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const [name, spec] of Object.entries(tracks)) {
  const { wav, loopSec } = render(spec);
  writeFileSync(`${OUT}/${name}.wav`, wav);
  execFileSync("afconvert", [
    `${OUT}/${name}.wav`,
    "-o",
    `${OUT}/${name}.m4a`,
    "-f",
    "m4af",
    "-d",
    "aac",
    "-s",
    "3",
  ]);
  rmSync(`${OUT}/${name}.wav`);
  console.log(`${name}.m4a — ${loopSec.toFixed(2)}s loop`);
}
