import { useEffect, useRef, useState } from "react";

const LOOP = "/video/varadiq-loop-720p.mp4";
const FULL = "/video/varadiq-video-1080p.mp4";
const POSTER = "/video/varadiq-video-poster.jpg";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** The full 1-minute video with sound, in a pop-up. */
export function VideoModal({ open, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="VaradIQ in 1 minute" onClick={onClose}>
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} className="absolute -top-11 right-0 rounded-full px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10" aria-label="Close video">
          Close ✕
        </button>
        <video src={FULL} poster={POSTER} controls autoPlay playsInline className="aspect-video w-full rounded-2xl bg-black shadow-2xl" />
      </div>
    </div>
  );
}

/** Home page section: a short silent loop; tap to watch the full video with sound. */
export default function VideoSection({ onPlay }) {
  const [still] = useState(reducedMotion);
  return (
    <section id="video" className="section scroll-mt-20 py-12">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ai-cyan">See it in action</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">VaradIQ in 1 minute</h2>
      </div>
      <button onClick={onPlay} className="group relative mx-auto mt-8 block w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl" aria-label="Watch the 1-minute video with sound">
        {still ? (
          <img src={POSTER} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <video src={LOOP} poster={POSTER} autoPlay muted loop playsInline className="aspect-video w-full object-cover" aria-hidden="true" />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition group-hover:scale-105 sm:text-base">
          ▶ Watch with sound · 1 min
        </span>
      </button>
    </section>
  );
}
