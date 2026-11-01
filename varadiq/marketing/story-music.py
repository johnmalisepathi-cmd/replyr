"""Generates a soft background pad + pluck, ducks it under the voice, and
mixes everything to mix.wav (48 kHz stereo)."""
import json
import numpy as np
import soundfile as sf

SR = 48000
tl = json.load(open("timeline.json"))
DUR = tl["duration"] + 0.6
n = int(DUR * SR)
t = np.arange(n) / SR

def note(m):  # MIDI -> Hz
    return 440 * 2 ** ((m - 69) / 12)

# Fmaj7 - Am7 - Dm9 - Gsus, 4 s each, looping
CHORDS = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [55, 60, 62, 67]]
pad = np.zeros(n)
for i, start in enumerate(np.arange(0, DUR, 4.0)):
    ch = CHORDS[i % 4]
    a, b = int(start * SR), min(n, int((start + 4.6) * SR))
    seg = t[a:b] - start
    env = np.minimum(1, seg / 1.2) * np.minimum(1, np.maximum(0, (4.6 - seg) / 1.2))
    for m in ch:
        f = note(m)
        pad[a:b] += env * (np.sin(2 * np.pi * f * seg) + 0.3 * np.sin(2 * np.pi * 2 * f * seg + 0.5)) * 0.06

# soft plucks on the beat (arpeggio, an octave up)
pluck = np.zeros(n)
beat = 0.5
for k, start in enumerate(np.arange(0, DUR, beat)):
    ch = CHORDS[int(start // 4) % 4]
    f = note(ch[k % 4] + 12)
    a, b = int(start * SR), min(n, int((start + 0.9) * SR))
    seg = t[a:b] - start
    pluck[a:b] += np.exp(-seg * 6) * np.sin(2 * np.pi * f * seg) * 0.05

music = pad + pluck
# gentle fade in/out
music *= np.minimum(1, t / 1.5) * np.minimum(1, np.maximum(0, (DUR - t) / 2.0))

voice, vsr = sf.read("voice.wav")
voice = np.interp(np.arange(int(len(voice) * SR / vsr)) / SR, np.arange(len(voice)) / vsr, voice)
voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]

# duck music under the voice (smoothed envelope)
env = np.abs(voice)
win = int(0.25 * SR)
env = np.convolve(env, np.ones(win) / win, mode="same")
duck = 1 - 0.65 * np.clip(env / (env.max() * 0.25), 0, 1)
music *= duck

voice = voice / (np.abs(voice).max() + 1e-9) * 0.9
mix = voice + music * 0.9
mix /= max(1.0, np.abs(mix).max() / 0.95)
stereo = np.stack([mix, mix], axis=1)
sf.write("mix.wav", stereo, SR)
print("mix", round(DUR, 2), "s")
