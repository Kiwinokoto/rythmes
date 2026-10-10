import { COLORS, SOUND_NAMES, clampInt, currentStep, euclidean, normalizeTrack } from "./rhythm.js";
import { RhythmEngine } from "./audio-engine.js";

const STORAGE_KEY = "rythmes.studio.v2";
const MAX_TRACKS = 7;
const $ = id => document.getElementById(id);
const orbit = $("orbitRings");
const list = $("tracksList");
const playButton = $("playButton");
const tempoSlider = $("tempoSlider");
const tempoNumber = $("tempoNumber");
let idCounter = 0;
const freshId = () => "t-" + Date.now().toString(36) + "-" + (++idCounter).toString(36);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function makeTrack(name, instrument, steps, hits, rotation = 0) {
  return normalizeTrack({ id: freshId(), name, instrument, steps, hits, rotation }, idCounter);
}

function preset(name) {
  const house = [
    makeTrack("Fondation", "kick", 16, 4),
    makeTrack("Contretemps", "snare", 16, 2, 4),
    makeTrack("Charleys", "hat", 16, 8, 2),
    makeTrack("Percussions", "cowbell", 12, 5)
  ];
  if (name === "house") {
    house[1].pattern = Array.from({ length: 16 }, (_, i) => i === 4 || i === 12);
    house[1].hits = 2;
    house[2].pattern = Array.from({ length: 16 }, (_, i) => i % 2 === 0);
    return house;
  }
  if (name === "odd") return [
    makeTrack("Battement", "kick", 3, 2),
    makeTrack("Quintolets", "tom", 5, 3),
    makeTrack("Étincelles", "shaker", 7, 4),
    makeTrack("Réponses", "rim", 12, 5)
  ];
  return [
    makeTrack("Pulse", "kick", 8, 2),
    makeTrack("Air", "openhat", 12, 3),
    makeTrack("Écho", "clap", 16, 2, 5)
  ];
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw && Array.isArray(raw.tracks) && raw.tracks.length <= MAX_TRACKS) {
      const tracks = raw.tracks.map((t, i) => normalizeTrack(t, i));
      // A corrupted import must not create duplicate DOM identifiers.
      if (new Set(tracks.map(t => t.id)).size === tracks.length) {
        return { bpm: clampInt(raw.bpm, 40, 220, 110), volume: typeof raw.volume === "number" && Number.isFinite(raw.volume) ? Math.max(0, Math.min(1, raw.volume)) : 0.74, tracks };
      }
    }
  } catch (_) { /* private browsing or invalid saved data */ }
  return { bpm: 110, volume: 0.74, tracks: preset("house") };
}
let state = loadState();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("saveStatus").textContent = "✓ Modifications enregistrées localement";
  } catch (_) {
    $("saveStatus").textContent = "Sauvegarde indisponible dans ce navigateur";
  }
}

function updateCounters() {
  $("trackCounter").textContent = String(state.tracks.length);
  $("trackCountCore").textContent = String(state.tracks.length).padStart(2, "0");
  $("addTrack").disabled = state.tracks.length >= MAX_TRACKS;
  $("addTrack").title = state.tracks.length >= MAX_TRACKS ? "Limite de 7 cercles pour garder les pas accessibles" : "Ajouter un cercle";
}

function renderOrbit() {
  orbit.replaceChildren();
  state.tracks.forEach((track, idx) => {
    const radius = 43 - (state.tracks.length - 1 - idx) * (state.tracks.length >= 6 ? 5.25 : 6.7);
    const ring = document.createElement("div");
    ring.className = "orbit-ring";
    ring.style.width = (2 * radius) + "%";
    ring.style.height = (2 * radius) + "%";
    ring.style.borderColor = track.color;
    ring.style.opacity = track.muted ? "0.23" : "0.55";
    orbit.appendChild(ring);
    for (let step = 0; step < track.steps; step++) {
      const angle = Math.PI * 2 * step / track.steps;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "orbit-step" + (track.pattern[step] ? " on" : "") + (track.muted ? " muted" : "");
      button.dataset.id = track.id;
      button.dataset.step = String(step);
      button.style.left = (50 + radius * Math.sin(angle)) + "%";
      button.style.top = (50 - radius * Math.cos(angle)) + "%";
      button.style.setProperty("--step-color", track.color);
      button.title = track.name + " · pas " + (step + 1) + " / " + track.steps;
      button.setAttribute("aria-label", track.name + ", pas " + (step + 1) + ", " + (track.pattern[step] ? "activé" : "désactivé"));
      button.setAttribute("aria-pressed", String(track.pattern[step]));
      orbit.appendChild(button);
    }
  });
  updateCounters();
}

function renderTracks() {
  list.innerHTML = state.tracks.map((track, index) => {
    const options = Object.entries(SOUND_NAMES).map(([key, label]) =>
      '<option value="' + key + '"' + (track.instrument === key ? ' selected' : '') + '>' + label + '</option>'
    ).join("");
    const color = COLORS[index % COLORS.length];
    track.color = color;
    return '<article class="track-card' + (track.muted ? ' is-muted' : '') + '" data-track="' + track.id + '" style="--track-color:' + color + '">' +
      '<div class="track-top"><span class="track-number">' + String(index + 1).padStart(2, "0") + '</span>' +
      '<span class="track-color"></span><input class="track-name" data-field="name" maxlength="36" value="' + escapeHtml(track.name) + '" aria-label="Nom de la piste ' + (index + 1) + '">' +
      '<button type="button" class="track-mute' + (track.muted ? ' is-off' : '') + '" data-action="mute" aria-pressed="' + String(track.muted) + '" title="Activer ou couper cette piste">' + (track.muted ? '⊘ Muette' : '◖)) Son') + '</button>' +
      '<button type="button" class="track-remove" data-action="remove" title="Supprimer cette piste" aria-label="Supprimer ' + escapeHtml(track.name) + '">×</button></div>' +
      '<div class="track-fields"><label>SON <select data-field="instrument" aria-label="Instrument de ' + escapeHtml(track.name) + '">' + options + '</select></label>' +
      '<label>PAS <input type="number" data-field="steps" min="3" max="32" value="' + track.steps + '" aria-label="Subdivisions de ' + escapeHtml(track.name) + '"></label>' +
      '<label>FRAPPES <input type="number" data-field="hits" min="0" max="' + track.steps + '" value="' + track.hits + '"></label>' +
      '<label>DÉCALAGE <input type="number" data-field="rotation" min="0" max="' + (track.steps - 1) + '" value="' + track.rotation + '"></label>' +
      '<button type="button" class="generate-button" data-action="generate" title="Redistribuer les frappes régulièrement sur le cercle">↗ Répartir</button></div>' +
      '</article>';
  }).join("");
  updateCounters();
}

function rerender() {
  renderTracks();
  renderOrbit();
  save();
  // Existing audio cursors must NOT be reset on ordinary UI updates.
}

const engine = new RhythmEngine(
  () => state,
  (progress, playing) => {
    $("orbitSweep").style.transform = "rotate(" + (progress * 360) + "deg)";
    const steps = orbit.querySelectorAll(".orbit-step");
    for (const button of steps) {
      const track = state.tracks.find(t => t.id === button.dataset.id);
      const current = track && currentStep(progress, track.steps) === Number(button.dataset.step);
      button.classList.toggle("is-current", Boolean(playing && current && !track.muted));
    }
  },
  playing => {
    $("playIcon").textContent = playing ? "■" : "▶";
    $("playText").textContent = playing ? "Arrêter" : "Écouter";
    playButton.classList.toggle("is-playing", playing);
    $("statusLight").classList.toggle("is-live", playing);
    $("statusText").textContent = playing ? "En lecture" : "À l'arrêt";
  }
);

orbit.addEventListener("click", event => {
  const button = event.target.closest("button.orbit-step");
  if (!button) return;
  const track = state.tracks.find(t => t.id === button.dataset.id);
  if (!track) return;
  const i = Number(button.dataset.step);
  track.pattern[i] = !track.pattern[i];
  track.hits = track.pattern.filter(Boolean).length;
  renderTracks();
  button.classList.toggle("on", track.pattern[i]);
  button.setAttribute("aria-pressed", String(track.pattern[i]));
  button.setAttribute("aria-label", track.name + ", pas " + (i + 1) + ", " + (track.pattern[i] ? "activé" : "désactivé"));
  save();
});

list.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const track = state.tracks.find(t => t.id === actionButton.closest(".track-card")?.dataset.track);
  if (!track) return;
  const action = actionButton.dataset.action;
  if (action === "remove") {
    state.tracks = state.tracks.filter(t => t.id !== track.id);
    if (state.tracks.length === 0) engine.stop();
  } else if (action === "mute") track.muted = !track.muted;
  else if (action === "generate") track.pattern = euclidean(track.steps, track.hits, track.rotation);
  rerender();
});

list.addEventListener("change", event => {
  const field = event.target.dataset.field;
  const card = event.target.closest(".track-card");
  if (!field || !card) return;
  const track = state.tracks.find(t => t.id === card.dataset.track);
  if (!track) return;
  if (field === "name") track.name = String(event.target.value).slice(0, 36).trim() || "Piste";
  if (field === "instrument" && Object.hasOwn(SOUND_NAMES, event.target.value)) track.instrument = event.target.value;
  if (field === "steps") {
    track.steps = clampInt(event.target.value, 3, 32, track.steps);
    track.hits = Math.min(track.hits, track.steps);
    track.rotation %= track.steps;
    track.pattern = euclidean(track.steps, track.hits, track.rotation);
    engine.resetTrack(track.id);
  }
  if (field === "hits") {
    track.hits = clampInt(event.target.value, 0, track.steps, track.hits);
    track.pattern = euclidean(track.steps, track.hits, track.rotation);
  }
  if (field === "rotation") {
    track.rotation = clampInt(event.target.value, 0, track.steps - 1, track.rotation);
    track.pattern = euclidean(track.steps, track.hits, track.rotation);
  }
  rerender();
});

$("addTrack").addEventListener("click", () => {
  if (state.tracks.length >= MAX_TRACKS) return;
  const count = state.tracks.length;
  state.tracks.push(makeTrack("Nouvelle piste", ["tom", "clap", "shaker", "rim"][count % 4], 8, 3));
  rerender();
  list.lastElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" });
});

for (const button of document.querySelectorAll("[data-preset]")) {
  button.addEventListener("click", () => {
    state.tracks = preset(button.dataset.preset);
    rerender();
  });
}

function changeBpm(value) {
  state.bpm = clampInt(value, 40, 220, state.bpm);
  tempoSlider.value = String(state.bpm);
  tempoNumber.value = String(state.bpm);
  save();
}
tempoSlider.addEventListener("input", e => changeBpm(e.target.value));
tempoNumber.addEventListener("change", e => changeBpm(e.target.value));
$("volumeSlider").addEventListener("input", e => {
  state.volume = clampInt(e.target.value, 0, 100) / 100;
  $("volumeLabel").textContent = Math.round(state.volume * 100) + " %";
  engine.setVolume(state.volume);
  save();
});

playButton.addEventListener("click", async () => {
  if (engine.playing) { engine.stop(); return; }
  if (!state.tracks.length) return;
  playButton.disabled = true;
  try { await engine.start(); }
  catch (error) {
    $("statusText").textContent = "Erreur audio : " + (error?.message || "inconnue");
    console.error("Audio setup failed", error);
  } finally { playButton.disabled = false; }
});
document.addEventListener("keydown", event => {
  if (event.code !== "Space" || event.repeat || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  playButton.click();
});
document.addEventListener("visibilitychange", () => {
  // Continue audio scheduling; the visual rAF naturally pauses when hidden.
  if (!document.hidden && engine.playing) engine.schedule();
});
window.addEventListener("pagehide", () => engine.stop());

tempoNumber.value = tempoSlider.value = String(state.bpm);
$("volumeSlider").value = String(Math.round(state.volume * 100));
$("volumeLabel").textContent = Math.round(state.volume * 100) + " %";
rerender();
