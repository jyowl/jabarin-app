// node --experimental-strip-types scripts/check.mjs
import assert from "node:assert";
import { existsSync } from "node:fs";
import { scenes, VOICES } from "../src/script.ts";
import { voDurations } from "../src/vo.ts";
import { FPS, LEAD, TAIL } from "../src/theme.ts";

const total = scenes.reduce((n, s) => n + Math.round((LEAD + voDurations[s.id] + TAIL) * FPS), 0);

for (const s of scenes) {
  assert(voDurations[s.id] > 0, `missing voiceover duration: ${s.id}`);
  assert(existsSync(`public/vo/${s.id}.mp3`), `missing audio: ${s.id}`);
  if (s.img) assert(existsSync(`public/${s.img}`), `missing screenshot: ${s.img}`);
  if (s.voice) assert(VOICES[s.voice], `unknown voice preset: ${s.voice}`);
}
for (const bed of ["hook", "main"])
  assert(existsSync(`public/music/${bed}.m4a`), `missing music bed: ${bed}`);
assert(total <= 300 * FPS, `video is ${(total / FPS / 60).toFixed(2)} min, max 5`);

console.log(
  `OK — ${scenes.length} scenes, ${(total / FPS).toFixed(1)}s (${(total / FPS / 60).toFixed(2)} min)`,
);
