// An original score for the Keel showcase video, synthesized in the browser (no samples, no
// third-party music, so no license to clear). Calm and unhurried, like the product:
// F major at 70 bpm, a four-chord pad (Fmaj7, Dm9, Bbmaj7, Csus), a soft bass, a plucked
// arpeggio that enters after the brand scene, and a glass chime on each scene change.
// renderScore(seconds, cues) returns a stereo AudioBuffer at 48 kHz, peak-normalized to -3 dBFS.

const SR = 48000;
const BEAT = 60 / 70;
const BAR = BEAT * 4;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// two bars per chord; voicings kept in a narrow, soft register
const CHORDS = [
  { root: 41, notes: [53, 57, 60, 64] },        // Fmaj7
  { root: 38, notes: [50, 53, 57, 60, 64] },    // Dm9
  { root: 46, notes: [50, 53, 57, 62] },        // Bbmaj7 (add the 3rd above)
  { root: 36, notes: [48, 55, 60, 62, 67] },    // Csus2 with the 5th on top
];

function impulse(ctx, seconds, decay) {
  const len = Math.floor(SR * seconds), buf = ctx.createBuffer(2, len, SR);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let seed = 1234 + c * 77;   // deterministic noise, so every render is identical
    for (let i = 0; i < len; i++) { seed = (seed * 16807) % 2147483647; d[i] = ((seed / 2147483647) * 2 - 1) * Math.pow(1 - i / len, decay); }
  }
  return buf;
}

export async function renderScore(seconds, cues = []) {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * SR), SR);
  // master chain: dry + reverb -> compressor -> fade -> out
  const master = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 2.5; comp.attack.value = 0.02; comp.release.value = 0.4;
  const fade = ctx.createGain();
  fade.gain.setValueAtTime(0, 0); fade.gain.linearRampToValueAtTime(1, 1.6);
  fade.gain.setValueAtTime(1, Math.max(1.7, seconds - 3.2)); fade.gain.linearRampToValueAtTime(0, seconds - 0.05);
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 3.2, 2.6);
  const wet = ctx.createGain(); wet.gain.value = 0.32;
  master.connect(comp); master.connect(verb); verb.connect(wet); wet.connect(comp);
  comp.connect(fade); fade.connect(ctx.destination);

  const voice = (type, freq, start, dur, peak, { attack = 0.02, release = 0.4, pan = 0, cutoff = 0 } = {}) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(peak, start + attack);
    g.gain.setValueAtTime(peak, Math.max(start + attack, start + dur));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur + release);
    let node = o;
    if (cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = 0.4; node.connect(f); node = f; }
    node.connect(g);
    if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(master); } else g.connect(master);
    o.start(start); o.stop(start + dur + release + 0.05);
  };

  const span = BAR * 2;
  for (let t = 0, i = 0; t < seconds; t += span, i++) {
    const ch = CHORDS[i % CHORDS.length];
    for (const n of ch.notes) {
      voice('sine', hz(n), t, span, 0.045, { attack: 1.4, release: 2.2, cutoff: 1600 });
      voice('triangle', hz(n) * 1.004, t, span, 0.018, { attack: 1.8, release: 2.2, cutoff: 1100, pan: (n % 2 ? -0.25 : 0.25) });
    }
    voice('sine', hz(ch.root), t, span, 0.11, { attack: 0.4, release: 1.2, cutoff: 400 });
    // the arpeggio: after the brand scene, eighth notes over the chord, an octave up
    const arpFrom = cues.length > 1 ? cues[1] : 4;
    const tones = ch.notes.slice(1).concat(ch.notes[1] + 12);
    for (let k = 0; k < 16; k++) {
      const at = t + k * (BEAT / 2);
      if (at < arpFrom || at > seconds - 3.5) continue;
      const n = tones[(k * 2 + (k >> 2)) % tones.length] + 12;
      voice('triangle', hz(n), at, 0.02, k % 4 === 0 ? 0.032 : 0.022, { attack: 0.006, release: 0.75, cutoff: 3200, pan: k % 2 ? 0.35 : -0.35 });
    }
  }
  // a glass chime at each scene change (the first cue is the start)
  for (const c of cues.slice(1)) {
    voice('sine', hz(84), c, 0.01, 0.05, { attack: 0.004, release: 2.6 });
    voice('sine', hz(84) * 2.76, c, 0.01, 0.012, { attack: 0.004, release: 1.4 });
  }

  const buf = await ctx.startRendering();
  // peak-normalize to -3 dBFS
  let peak = 0;
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i])); }
  const gain = peak > 0 ? Math.pow(10, -3 / 20) / peak : 1;
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= gain; }
  return buf;
}

// ------------------------------------------------------------------ voiceover mix
// A bright, clean bed in the style of a bank or fintech commercial, written to sit under the
// voice: D major at 96 bpm, one bar per chord on an uplifting I-V-vi-IV (Dadd9, A/C#, Bm7,
// Gmaj7). A felt-piano eighth-note pulse and a warm pad open it; from bar 3 a soft kick,
// syncopated bass and a shaker carry it; a light finger snap on 2 and 4 joins at the walk
// through; the last bars resolve to D and fade. A notch at 2.5 kHz leaves room for the voice.
// The bed sits about 14 dB under the speech and ducks a further 6 dB while a line plays.
const BPM = 96;
const BED = [
  { root: 38, notes: [62, 64, 66, 69] },   // Dadd9   (D E F# A)
  { root: 37, notes: [61, 64, 69, 71] },   // A/C#    (C# E A B, add9)
  { root: 35, notes: [62, 66, 69, 71] },   // Bm7     (D F# A B)
  { root: 43, notes: [62, 66, 67, 71] },   // Gmaj7   (D F# G B)
];
const PULSE = [0, 2, 3, 2, 1, 2, 3, 2];    // which chord tone each eighth note plays

function noise(ctx, seconds) {
  const len = Math.floor(SR * seconds), buf = ctx.createBuffer(1, len, SR), d = buf.getChannelData(0);
  let seed = 4242;
  for (let i = 0; i < len; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 2147483647) * 2 - 1; }
  return buf;
}

async function renderBed(seconds, duck) {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * SR), SR);
  const beat = 60 / BPM, bar = beat * 4, bars = Math.ceil(seconds / bar);
  const lastBar = Math.floor((seconds - 0.05) / bar);
  const bus = ctx.createGain();
  if (duck) { bus.gain.setValueAtTime(1, 0); for (const [a, b] of duck) { bus.gain.setTargetAtTime(0.5, Math.max(0, a - 0.15), 0.06); bus.gain.setTargetAtTime(1, b + 0.2, 0.3); } }
  const notch = ctx.createBiquadFilter(); notch.type = 'peaking'; notch.frequency.value = 2500; notch.Q.value = 0.9; notch.gain.value = -5;
  const air = ctx.createBiquadFilter(); air.type = 'lowpass'; air.frequency.value = 9000; air.Q.value = 0.2;
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 2.2, 3);
  const wet = ctx.createGain(); wet.gain.value = 0.22;
  const fade = ctx.createGain();
  fade.gain.setValueAtTime(0, 0); fade.gain.linearRampToValueAtTime(1, 1.2);
  fade.gain.setValueAtTime(1, Math.max(1.3, seconds - 3.5)); fade.gain.linearRampToValueAtTime(0, seconds - 0.05);
  bus.connect(notch); notch.connect(air); air.connect(fade); air.connect(verb); verb.connect(wet); wet.connect(fade); fade.connect(ctx.destination);
  const out = (node, pan) => { if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(bus); } else node.connect(bus); };
  const tone = (type, freq, start, dur, peak, attack, decay, pan = 0) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(peak, start + attack);
    g.gain.setTargetAtTime(0.0001, start + attack, decay);
    o.connect(g); out(g, pan); o.start(start); o.stop(start + attack + decay * 6 + dur);
  };
  const piano = (midi, at, peak, pan) => {        // felt piano: soft triangle body, a sine octave, quick decay
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 0.006); g.gain.setTargetAtTime(0.0001, at + 0.006, 0.32);
    for (const [type, mult, lvl] of [['triangle', 1, 1], ['sine', 2, 0.35]]) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = hz(midi) * mult;
      const l = ctx.createGain(); l.gain.value = lvl; o.connect(l); l.connect(lp); o.start(at); o.stop(at + 2.2);
    }
    lp.connect(g); out(g, pan);
  };
  const nz = noise(ctx, 0.4);
  const hit = (at, type, freq, q, peak, decay, pan = 0) => {   // shaker and snap: shaped noise
    const src = ctx.createBufferSource(); src.buffer = nz;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 0.004); g.gain.setTargetAtTime(0.0001, at + 0.004, decay);
    src.connect(f); f.connect(g); out(g, pan); src.start(at); src.stop(at + 0.35);
  };
  const kick = (at, peak) => {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.12);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 0.003); g.gain.setTargetAtTime(0.0001, at + 0.01, 0.09);
    o.connect(g); out(g); o.start(at); o.stop(at + 0.6);
  };
  const snapFrom = Math.round(8.8 / bar);   // the snap joins when the walk-through starts
  for (let i = 0; i < bars; i++) {
    const t = i * bar, end = i >= lastBar - 1;
    const ch = end ? BED[0] : BED[i % BED.length];
    for (const n of ch.notes) tone('sine', hz(n - 12), t, bar, 0.018, 0.4, bar * 0.6, n % 2 ? -0.35 : 0.35);   // pad
    if (end) { if (i === lastBar - 1) { ch.notes.forEach((n, j) => piano(n, t + j * 0.02, 0.05, (j - 1.5) * 0.15)); tone('sine', hz(ch.root), t, bar, 0.09, 0.01, 1.2); } continue; }
    for (let e = 0; e < 8; e++) piano(ch.notes[PULSE[e]], t + e * beat / 2, e % 2 ? 0.032 : 0.045, e % 2 ? 0.2 : -0.2);  // pulse
    if (i < 2) continue;                       // the groove enters on bar 3
    for (const [k, len] of [[0, 1.4], [2.5, 0.5], [3, 0.9]]) {                       // syncopated bass
      tone('sine', hz(ch.root), t + k * beat, len * beat, 0.09, 0.01, len * beat * 0.5);
      tone('triangle', hz(ch.root), t + k * beat, len * beat, 0.025, 0.01, len * beat * 0.3);
    }
    kick(t, 0.22); kick(t + 2 * beat, 0.18);
    for (let s = 0; s < 16; s++) hit(t + s * beat / 4, 'highpass', 7000, 0.7, s % 2 ? 0.012 : 0.028, 0.03, 0.25);   // shaker
    if (i >= snapFrom) for (const k of [1, 3]) hit(t + k * beat, 'bandpass', 1800, 1.4, 0.05, 0.05, -0.1);          // snap
  }
  return ctx.startRendering();
}

const rms = (buf, ranges) => {
  const d = buf.getChannelData(0), sr = buf.sampleRate; let s = 0, n = 0;
  for (const [a, b] of ranges) for (let i = Math.floor(a * sr); i < Math.min(d.length, Math.floor(b * sr)); i++) { s += d[i] * d[i]; n++; }
  return Math.sqrt(s / Math.max(1, n));
};

/**
 * The voiceover placed line by line over a ducked bed. `cues` is keel-voiceover-cues.json:
 * each line (from/to in the voice file) starts at `at` seconds in the video, with a little
 * breath kept on either side and 15 ms fades so no cut clicks. Returns { buffer, segments }.
 */
export async function renderVoiceMix(seconds, voiceUrl, cues) {
  const probe = new OfflineAudioContext(1, SR, SR);
  const voice = await probe.decodeAudioData(await (await fetch(voiceUrl)).arrayBuffer());
  const PRE = 0.12, POST = 0.25, F = 0.015;
  const lines = cues.lines.map((l) => ({ ...l, a: Math.max(0, l.from - PRE), b: Math.min(voice.duration, l.to + POST) }));
  lines.forEach((l, i) => {                  // a line must not run into the next one or past the end
    const end = l.at - (l.from - l.a) + (l.b - l.a), next = lines[i + 1];
    if (next && end > next.at - (next.from - next.a)) throw new Error(`line ${i + 1} overlaps line ${i + 2}`);
    if (end > seconds - 0.3) throw new Error(`line ${i + 1} runs past the end`);
  });
  const placed = lines.map((l) => [l.at, l.at + (l.to - l.from)]);
  // level the bed against the voice: about 14 dB under the speech, before ducking
  const dry = await renderBed(seconds, null);
  const bedGain = (rms(voice, cues.lines.map((l) => [l.from, l.to])) * Math.pow(10, -14 / 20)) / rms(dry, [[3, seconds - 4]]);
  const bed = await renderBed(seconds, placed);
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * SR), SR);
  const bs = ctx.createBufferSource(); bs.buffer = bed; const bg = ctx.createGain(); bg.gain.value = bedGain; bs.connect(bg); bg.connect(ctx.destination); bs.start(0);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 70;
  const vc = ctx.createDynamicsCompressor(); vc.threshold.value = -20; vc.ratio.value = 2; vc.attack.value = 0.01; vc.release.value = 0.25;
  hp.connect(vc); vc.connect(ctx.destination);
  for (const l of lines) {
    const start = l.at - (l.from - l.a), dur = l.b - l.a;
    const src = ctx.createBufferSource(); src.buffer = voice;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(1, start + F);
    g.gain.setValueAtTime(1, start + dur - F); g.gain.linearRampToValueAtTime(0, start + dur);
    src.connect(g); g.connect(hp); src.start(start, l.a, dur);
  }
  const out = await ctx.startRendering();
  let peak = 0;
  for (let c = 0; c < 2; c++) { const d = out.getChannelData(c); for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i])); }
  const g = Math.pow(10, -2 / 20) / peak;
  for (let c = 0; c < 2; c++) { const d = out.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; }
  return { buffer: out, segments: placed };
}
