"""Voices the Sam's Day script line by line and writes voice.wav plus
timeline.json (scene, caption, start, end) for the animation to follow."""
import json
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = "af_heart"
SR = 24000

# (scene, spoken text, caption shown on screen, pause after in seconds)
LINES = [
    ("meet", "Meet Sam.", "Meet Sam.", 0.35),
    ("meet", "Sam has a few dreams. A holiday in Bali. A phone that actually lasts the day. A first home.", "Sam has a few dreams: a holiday in Bali, a phone that lasts the day, a first home…", 0.25),
    ("meet", "And right now, honestly? Dinner.", "…and right now, honestly? Dinner.", 0.5),
    ("tabs", "But finding the right deal for each one means hours of tabs, and second-guessing.", "But finding the right deal for each one means hours of tabs and second-guessing.", 0.5),
    ("tell", "So Sam just tells Opportunity I Q. In plain words.", "So Sam just tells OpportunityIQ. In plain words.", 0.3),
    ("tell", "Bali in six months, under four thousand. A phone with a great camera. A three bed near the train. Spicy Thai, tonight.", "\"Bali in 6 months, under $4,000. A great camera phone. A 3-bed near the train. Spicy Thai tonight.\"", 0.5),
    ("watch", "From then on, the AI watches the world for Sam, twenty four seven. Flights, prices, listings, rates and restaurants.", "From then on, the AI watches the world for Sam, 24/7: flights, prices, listings, rates and restaurants.", 0.5),
    ("alerts", "Seven A M. Bali flights drop twenty two percent.", "7am: Bali flights drop 22%.", 0.2),
    ("alerts", "Eleven. The phone Sam wanted is two hundred dollars off.", "11am: the phone Sam wanted is $200 off.", 0.2),
    ("alerts", "Afternoon. A new three bedroom, four minutes from the train.", "2pm: a new 3-bedroom, 4 minutes from the train.", 0.2),
    ("alerts", "And five thirty. Spicy Thai, four point seven stars, table at seven.", "5:30pm: spicy Thai, 4.7 stars, table at 7.", 0.55),
    ("done", "One day. Every wish moving forward. And not a single tab opened.", "One day. Every wish moving forward. Not a single tab opened.", 0.6),
    ("logo", "Opportunity I Q. Tell it what you want. It watches the world for you.", "OpportunityIQ. Tell it what you want. It watches the world for you.", 1.6),
]

LEAD_IN = 0.6

def main():
    kokoro = Kokoro("kokoro-v1.0.int8.onnx", "voices-v1.0.bin")
    pieces, timeline, t = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)], [], LEAD_IN
    for scene, text, caption, pause in LINES:
        audio, sr = kokoro.create(text, voice=VOICE, speed=1.1, lang="en-us")
        assert sr == SR
        audio = audio.astype(np.float32)
        dur = len(audio) / SR
        timeline.append({"scene": scene, "caption": caption, "start": round(t, 3), "end": round(t + dur, 3)})
        pause *= 0.8
        pieces += [audio, np.zeros(int(pause * SR), dtype=np.float32)]
        t += dur + pause
    voice = np.concatenate(pieces)
    sf.write("voice.wav", voice, SR)
    json.dump({"duration": round(t, 3), "lines": timeline}, open("timeline.json", "w"), indent=1)
    print("duration", round(t, 2))
    for l in timeline:
        print(f'{l["start"]:6.2f}–{l["end"]:6.2f}  {l["scene"]:7} {l["caption"][:60]}')

if __name__ == "__main__":
    main()
