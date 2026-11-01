import { useEffect, useRef, useState } from "react";

// Speak instead of typing, using the browser's speech recognition where it
// exists (Chrome, Edge, Safari). Hidden where it isn't available or allowed.
export default function VoiceButton({ onText, className = "" }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef(null);
  const latest = useRef(onText);
  latest.current = onText;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "en-AU";
    r.interimResults = false;
    r.onresult = (e) => latest.current(Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setSupported(false);
    };
    rec.current = r;
    setSupported(true);
    return () => r.abort();
  }, []);

  if (!supported) return null;
  const toggle = () => {
    try {
      if (listening) rec.current.stop();
      else {
        rec.current.start();
        setListening(true);
      }
    } catch {
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop listening" : "Speak your goals"}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${listening ? "animate-glow bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0014 0M12 18v3" />
      </svg>
    </button>
  );
}
