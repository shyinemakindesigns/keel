# Keel showcase video: audio prompts for Gemini

The showcase video (`video/keel-showcase-1080x1350.mp4`, 1:09) now carries the ElevenLabs voiceover over a bank-commercial style background track, both mixed in code (`source/video/music.js`, cue sheet in `source/audio/keel-voiceover-cues.json`). Use these prompts if you'd rather generate your own music or add a voiceover. Timings match the video.

## Scene timings

| Time | Scene |
| --- | --- |
| 0:00 | Brand: the Keel logo draws in |
| 0:04.2 | The problem: 72% (U.S.) and 43% (Canada) |
| 0:08.8 | Meet Keel: the prototype in a phone |
| 0:11.4 | First-run setup |
| 0:19.9 | The reading: steady through Oct 25 |
| 0:23.1 | A $250 purchase check |
| 0:27.6 | Spending in days |
| 0:35.5 | Adding $100 to a goal |
| 0:42.5 | Trying a plan |
| 0:49.7 | Motion system |
| 0:56.7 | Design system |
| 1:03.5 | Links |
| 1:09.1 | End |

## Music prompt

```
Create a 69-second instrumental music bed for a product video about a calm personal finance app.

Mood: calm, reassuring, modern and clean. Not corporate, not upbeat, no drama, no tension.
Tempo: 70 BPM. Key: F major. Chords, two bars each, repeating: Fmaj7, Dm9, Bbmaj7, Csus2.
Instruments: a warm soft synth pad, a quiet sub bass, a gentle plucked arpeggio (felt piano or soft mallet), and a light glass chime. No vocals. No drums, or only a very soft shaker.

Structure:
0:00 to 0:04  the pad swells in slowly, no arpeggio yet
0:04          a single glass chime; the arpeggio enters softly
0:09          a chime; the arpeggio settles into a steady eighth-note pattern
0:50, 0:57, 1:04  a glass chime at each of these moments
1:04 to 1:09  resolve to F major and fade out to silence by 1:09

Mix: steady level (about -14 LUFS), no sudden peaks, and leave room in the midrange for a voiceover.
Export: WAV, 48 kHz, stereo.
```

If the tool makes shorter clips, ask for a 30-second section that loops cleanly, in the same key and tempo, and ask for a separate 5-second ending.

## Voiceover prompt (optional)

For Gemini's text-to-speech, paste the direction and then the script. Each line is timed to its scene; leave the gaps silent.

```
Read this in a calm, warm, confident voice with a neutral North American accent. Unhurried, about 140 words per minute, like a thoughtful product designer explaining their work, not an announcer. Let each line land, with a short pause after it.
```

| Start | Line |
| --- | --- |
| 0:00.5 | Most money apps meet a hard week with red numbers. |
| 0:04.6 | Seventy-two percent of U.S. adults feel money stress. In Canada, it’s the top stressor for forty-three percent. |
| 0:11.5 | Keel starts somewhere calmer. Four short steps, then one answer. |
| 0:20.0 | Steady through October twenty-fifth: nine days past payday. |
| 0:23.3 | Check a purchase before you buy. The keel moves first. |
| 0:27.8 | Spending shows up in days, not red overages. |
| 0:35.7 | Set money aside, and see what it does to your reading. |
| 0:42.7 | Try a plan before you commit. |
| 0:50.0 | Motion that settles, not startles. |
| 0:57.0 | A design system that holds up: ninety-four contrast pairings, none failing. |
| 1:03.8 | Read it. Try it. Take it apart. Links in the comments. |

## Putting it together

- In an editor (CapCut, Premiere, DaVinci Resolve): replace the video's audio with your music, and keep the music about 15 dB under the voice wherever the voice speaks.
- Or send the files back here: the composer can mix a music file and a voice file into the video in place of the generated score.
- LinkedIn autoplays videos muted, and the captions are burned in, so the video still works with the sound off.
