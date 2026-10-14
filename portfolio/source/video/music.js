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
