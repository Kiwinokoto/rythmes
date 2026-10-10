import test from "node:test";
import assert from "node:assert/strict";
import { barDuration, stepTime, euclidean, normalizeTrack, currentStep } from "../rhythm.js";

test("all subdivisions begin and end on the same bar", () => {
  const start = 10.125, duration = barDuration(120);
  assert.equal(duration, 2);
  for (const n of [3, 5, 7, 12, 16, 32]) {
    assert.equal(stepTime(start, duration, n, 0), start);
    assert.equal(stepTime(start, duration, n, n), start + duration);
    assert.equal(stepTime(start + duration, duration, n, 0), start + duration);
  }
});

test("euclidean hits have expected counts", () => {
  for (let n = 3; n <= 32; n++) for (let k = 0; k <= n; k++) {
    const p = euclidean(n, k);
    assert.equal(p.length, n);
    assert.equal(p.filter(Boolean).length, k);
  }
});

test("euclidean hit spacing differs by at most one step", () => {
  for (let n = 3; n <= 32; n++) for (let k = 1; k < n; k++) {
    const pos = euclidean(n, k).flatMap((v, i) => v ? [i] : []);
    const gaps = pos.map((p, i) => (pos[(i + 1) % k] - p + n) % n || n);
    assert.ok(Math.max(...gaps) - Math.min(...gaps) <= 1, "E(" + k + "," + n + ")");
  }
});

test("rotation preserves the selected hits", () => {
  const a = euclidean(12, 5), b = euclidean(12, 5, 3);
  assert.deepEqual(b, a.map((_, i) => a[(i - 3 + 12) % 12]));
  assert.deepEqual(euclidean(8, 0), Array(8).fill(false));
  assert.deepEqual(euclidean(8, 8), Array(8).fill(true));
});

test("untrusted local preferences are normalized", () => {
  const t = normalizeTrack({ id: "<unsafe>", steps: 10000, hits: -1, instrument: "bogus", pattern: [true] }, 1);
  assert.equal(t.steps, 32);
  assert.equal(t.hits, 0);
  assert.equal(t.pattern.length, 32);
  assert.equal(t.instrument, "kick");
  assert.match(t.id, /^track-/);
  assert.equal(currentStep(0.5, 8), 4);
  assert.equal(currentStep(0, 5), 0);
});
