import { barDuration, stepTime } from "./rhythm.js";

/**
 * One AudioContext clock for ALL tracks. setInterval only wakes up the scheduler;
 * audio nodes start at absolute AudioContext timestamps, never timer callback times.
 */
export class RhythmEngine {
  constructor(getState, onFrame, onState) {
    this.getState = getState;
    this.onFrame = onFrame;
    this.onState = onState;
    this.context = null;
    this.master = null;
    this.noise = null;
    this.sources = new Set();
    this.cursors = new Map();
    this.bars = [];
    this.playing = false;
    this.generation = 0;
    this.timer = 0;
    this.frameId = 0;
  }

  async start() {
    if (this.playing) return;
    const generation = ++this.generation;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) throw new Error("Web Audio n'est pas disponible dans ce navigateur.");
    if (!this.context) {
      this.context = new AudioCtor();
      this.master = this.context.createGain();
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.ratio.value = 5;
      this.master.connect(compressor);
      compressor.connect(this.context.destination);
      this.noise = this.makeNoise();
    }
    await this.context.resume();
    if (generation !== this.generation) return;
    this.setVolume(this.getState().volume);
    this.playing = true;
    const start = this.context.currentTime + 0.065;
    this.barStart = start;
    this.duration = barDuration(this.getState().bpm);
    this.cursors.clear();
    this.bars = [{ start, duration: this.duration }];
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
    this.draw();
    this.onState(true);
  }

  stop() {
    ++this.generation;
    this.playing = false;
    window.clearInterval(this.timer);
    window.cancelAnimationFrame(this.frameId);
    this.timer = 0;
    this.frameId = 0;
    for (const source of this.sources) {
      try { source.stop(this.context?.currentTime || 0); } catch (_) { /* already stopped */ }
    }
    this.sources.clear();
    this.cursors.clear();
    this.bars = [];
    this.onFrame(0, false);
    this.onState(false);
  }

  setVolume(value) {
    if (this.master) this.master.gain.setTargetAtTime(Math.max(0, Math.min(1, Number(value))) * 0.68, this.context.currentTime, 0.018);
  }

  resetTrack(id) {
    // Re-align an edited or newly added track to the CURRENT shared bar.
    const track = this.getState().tracks.find(t => t.id === id);
    if (!track || !this.playing) return;
    const elapsed = Math.max(0, this.context.currentTime - this.barStart);
    this.cursors.set(id, Math.min(track.steps, Math.ceil(elapsed / this.duration * track.steps - 1e-8)));
  }

  schedule() {
    if (!this.playing || this.context.state !== "running") return;
    const horizon = this.context.currentTime + 0.14;
    // Usually < 2 bars; bound any loop in case of invalid state.
    for (let bar = 0; bar < 32; bar++) {
      const tracks = this.getState().tracks;
      let barCompleted = true;
      for (const track of tracks) {
        let index = this.cursors.get(track.id);
        if (index === undefined) {
          const elapsed = Math.max(0, this.context.currentTime - this.barStart);
          index = Math.min(track.steps, Math.ceil(elapsed / this.duration * track.steps - 1e-8));
        }
        while (index < track.steps) {
          const at = stepTime(this.barStart, this.duration, track.steps, index);
          if (at >= horizon) break;
          if (at >= this.context.currentTime - 0.025 && track.pattern[index] && !track.muted) {
            this.playSound(track.instrument, Math.max(at, this.context.currentTime));
          }
          index++;
        }
        this.cursors.set(track.id, index);
        if (index < track.steps) barCompleted = false;
      }
      if (!barCompleted || this.barStart + this.duration >= horizon) break;
      this.barStart += this.duration;
      this.duration = barDuration(this.getState().bpm); // Tempo applied at a shared bar boundary.
      this.cursors.clear();
      this.bars.push({ start: this.barStart, duration: this.duration });
      this.bars = this.bars.filter(b => b.start + b.duration > this.context.currentTime - 1);
    }
  }

  draw() {
    if (!this.playing) return;
    const now = this.context.currentTime;
    let bar = this.bars[0];
    for (const item of this.bars) if (item.start <= now) bar = item;
    const progress = bar ? Math.max(0, Math.min(0.99999, (now - bar.start) / bar.duration)) : 0;
    this.onFrame(progress, true);
    this.frameId = window.requestAnimationFrame(() => this.draw());
  }

  makeNoise() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
    return buffer;
  }

  hold(source, end) {
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
    source.stop(end);
  }

  tone(at, frequency, endFrequency, length, gainAmount, waveform = "sine") {
    const c = this.context;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = waveform;
    o.frequency.setValueAtTime(frequency, at);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), at + length);
    g.gain.setValueAtTime(Math.max(0.0001, gainAmount), at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + length);
    o.connect(g);
    g.connect(this.master);
    o.start(at);
    this.hold(o, at + length + 0.008);
  }

  burst(at, length, amount, filterType, frequency, q = 0.8) {
    const c = this.context;
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const env = c.createGain();
    src.buffer = this.noise;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    env.gain.setValueAtTime(Math.max(amount, 0.0001), at);
    env.gain.exponentialRampToValueAtTime(0.0001, at + length);
    src.connect(filter);
    filter.connect(env);
    env.connect(this.master);
    src.start(at);
    this.hold(src, at + length + 0.005);
  }

  playSound(id, at) {
    switch (id) {
      case "kick":
        this.tone(at, 165, 43, 0.31, 1.0);
        this.burst(at, 0.024, 0.15, "lowpass", 1800);
        break;
      case "snare":
        this.burst(at, 0.19, 0.56, "highpass", 1350);
        this.tone(at, 180, 110, 0.12, 0.22, "triangle");
        break;
      case "hat":
        this.burst(at, 0.065, 0.24, "highpass", 7600);
        break;
      case "openhat":
        this.burst(at, 0.47, 0.20, "highpass", 6900);
        break;
      case "clap":
        this.burst(at, 0.085, 0.35, "bandpass", 1650);
        this.burst(at + 0.025, 0.085, 0.25, "bandpass", 1900);
        this.burst(at + 0.052, 0.21, 0.29, "bandpass", 1300);
        break;
      case "tom":
        this.tone(at, 285, 94, 0.30, 0.66);
        break;
      case "rim":
        this.tone(at, 940, 550, 0.037, 0.21, "triangle");
        this.burst(at, 0.027, 0.15, "bandpass", 3300);
        break;
      case "cowbell":
        this.tone(at, 540, 535, 0.18, 0.13, "square");
        this.tone(at, 810, 800, 0.15, 0.11, "square");
        break;
      case "shaker":
        this.burst(at, 0.105, 0.22, "highpass", 9000);
        break;
      default:
        this.tone(at, 180, 55, 0.25, 0.45);
    }
  }

  preview(id) {
    if (!this.context || this.context.state !== "running") return;
    this.playSound(id, this.context.currentTime + 0.006);
  }
}
