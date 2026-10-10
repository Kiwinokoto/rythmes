export const SOUND_NAMES = Object.freeze({
  kick: "Grosse caisse",
  snare: "Caisse claire",
  hat: "Charleston",
  openhat: "Charleston ouvert",
  clap: "Clap",
  tom: "Tom",
  rim: "Rimshot",
  cowbell: "Cowbell",
  shaker: "Shaker"
});

export const COLORS = ["#b59aff", "#ffb581", "#79dfcc", "#f7d878", "#87b8ff", "#f29dcc", "#a9dd80", "#e0a8ff"];

export function clampInt(value, min, max, fallback = min) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
}

/** Distributes k hits as evenly as possible across n equal subdivisions. */
export function euclidean(steps, hits, rotation = 0) {
  const n = clampInt(steps, 1, 32);
  const k = clampInt(hits, 0, n);
  const r = ((Math.trunc(Number(rotation) || 0) % n) + n) % n;
  const pattern = Array.from({ length: n }, (_, i) => ((i * k) % n) < k);
  return Array.from({ length: n }, (_, i) => pattern[(i - r + n) % n]);
}

export function barDuration(bpm) {
  return 240 / Math.max(1, Number(bpm) || 120); // One revolution is one 4/4 bar.
}

export function stepTime(barStart, duration, steps, index) {
  return barStart + duration * index / steps;
}

export function currentStep(progress, steps) {
  return Math.min(steps - 1, Math.max(0, Math.floor((progress % 1 + 1) % 1 * steps)));
}

export function normalizeTrack(candidate, index = 0) {
  const steps = clampInt(candidate?.steps, 3, 32, 16);
  const hits = clampInt(candidate?.hits, 0, steps, 4);
  const rotation = clampInt(candidate?.rotation, 0, steps - 1, 0);
  return {
    id: typeof candidate?.id === "string" && /^[a-zA-Z0-9_-]{1,50}$/.test(candidate.id)
      ? candidate.id : "track-" + Date.now().toString(36) + "-" + index,
    name: String(candidate?.name || "Piste " + (index + 1)).slice(0, 36),
    instrument: Object.hasOwn(SOUND_NAMES, candidate?.instrument) ? candidate.instrument : "kick",
    color: COLORS[index % COLORS.length],
    steps, hits, rotation,
    pattern: Array.isArray(candidate?.pattern) && candidate.pattern.length === steps
      ? candidate.pattern.map(Boolean) : euclidean(steps, hits, rotation),
    muted: Boolean(candidate?.muted)
  };
}
