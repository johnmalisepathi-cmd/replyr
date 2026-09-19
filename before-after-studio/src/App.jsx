import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadImageFromFile, renderFrame, recordVideo, TOTAL_SECONDS } from "./lib/recorder.js";

const ASPECTS = {
  vertical: { label: "Vertical (Reels/TikTok)", width: 540, height: 960 },
  square: { label: "Square (Feed post)", width: 720, height: 720 },
};

function UploadSlot({ label, file, onChange }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/15 bg-white/5 text-sm text-slate-300 transition hover:border-accent-500/60 hover:bg-white/10"
    >
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <span className="text-2xl">+</span>
          <span className="mt-1">{label}</span>
        </>
      )}
      {previewUrl && (
        <span className="absolute bottom-0 w-full bg-black/60 py-1 text-center text-xs font-medium text-white">
          {label} — tap to replace
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}

export default function App() {
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforeImg, setBeforeImg] = useState(null);
  const [afterImg, setAfterImg] = useState(null);

  const [aspectKey, setAspectKey] = useState("vertical");
  const [transitionType, setTransitionType] = useState("crossfade");
  const [caption, setCaption] = useState("");

  const [status, setStatus] = useState("idle"); // idle | recording | done | error
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef(null);
  const aspect = ASPECTS[aspectKey];

  useEffect(() => {
    if (!beforeFile) return setBeforeImg(null);
    let cancelled = false;
    loadImageFromFile(beforeFile).then((img) => !cancelled && setBeforeImg(img));
    return () => {
      cancelled = true;
    };
  }, [beforeFile]);

  useEffect(() => {
    if (!afterFile) return setAfterImg(null);
    let cancelled = false;
    loadImageFromFile(afterFile).then((img) => !cancelled && setAfterImg(img));
    return () => {
      cancelled = true;
    };
  }, [afterFile]);

  // Static preview of the first frame whenever inputs change (and we're not
  // mid-recording, where the animation loop owns the canvas).
  useEffect(() => {
    if (status === "recording") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = aspect.width;
    canvas.height = aspect.height;
    const ctx = canvas.getContext("2d");
    if (beforeImg && afterImg) {
      renderFrame(ctx, {
        beforeImg,
        afterImg,
        width: aspect.width,
        height: aspect.height,
        t: 0,
        transitionType,
        captionBottom: caption,
      });
    } else {
      ctx.clearRect(0, 0, aspect.width, aspect.height);
      ctx.fillStyle = "#0e1013";
      ctx.fillRect(0, 0, aspect.width, aspect.height);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "500 20px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload a before + after photo to preview", aspect.width / 2, aspect.height / 2, aspect.width - 60);
    }
  }, [beforeImg, afterImg, aspectKey, transitionType, caption, status, aspect.width, aspect.height]);

  const handleGenerate = useCallback(async () => {
    if (!beforeImg || !afterImg || !canvasRef.current) return;
    setStatus("recording");
    setProgress(0);
    setErrorMsg("");
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);

    try {
      const { url } = await recordVideo({
        canvas: canvasRef.current,
        beforeImg,
        afterImg,
        transitionType,
        captionBottom: caption,
        onProgress: setProgress,
      });
      setResultUrl(url);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong generating the video.");
      setStatus("error");
    }
  }, [beforeImg, afterImg, transitionType, caption, resultUrl]);

  const canGenerate = Boolean(beforeImg && afterImg) && status !== "recording";

  return (
    <div className="min-h-full bg-ink-950">
      <header className="border-b border-white/10 bg-ink-900/60 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Before/After Studio</h1>
            <p className="text-sm text-slate-400">Upload two photos, get a share-ready video. Nothing leaves your browser.</p>
          </div>
          <span className="rounded-full bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-300">MVP · client-side only</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-8 md:grid-cols-[380px_1fr]">
        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">1. Photos</h2>
            <div className="grid grid-cols-2 gap-3">
              <UploadSlot label="Before" file={beforeFile} onChange={setBeforeFile} />
              <UploadSlot label="After" file={afterFile} onChange={setAfterFile} />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">2. Format</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ASPECTS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAspectKey(key)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                    aspectKey === key
                      ? "border-accent-500 bg-accent-500/10 text-accent-200"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">3. Transition</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "crossfade", label: "Crossfade" },
                { key: "wipe", label: "Wipe" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTransitionType(t.key)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                    transitionType === t.key
                      ? "border-accent-500 bg-accent-500/10 text-accent-200"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">4. Caption (optional)</h2>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 70))}
              placeholder="e.g. Kitchen remodel — book yours today"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="w-full rounded-xl bg-accent-grad px-4 py-3 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "recording" ? `Generating… ${Math.round(progress * 100)}%` : "Generate video"}
          </button>

          {status === "error" && <p className="text-xs text-red-400">{errorMsg}</p>}
        </section>

        <section className="flex flex-col items-center gap-4">
          <div
            className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-card"
            style={{ aspectRatio: `${aspect.width} / ${aspect.height}`, width: aspectKey === "vertical" ? 300 : 420 }}
          >
            {status === "done" && resultUrl ? (
              <video src={resultUrl} controls loop autoPlay className="h-full w-full object-contain" />
            ) : (
              <canvas ref={canvasRef} className="h-full w-full" />
            )}
          </div>

          {status === "done" && resultUrl && (
            <a
              href={resultUrl}
              download="before-after.webm"
              className="rounded-xl border border-accent-500/50 bg-accent-500/10 px-4 py-2 text-sm font-medium text-accent-200 transition hover:bg-accent-500/20"
            >
              Download video (.webm)
            </a>
          )}

          <p className="max-w-xs text-center text-xs text-slate-500">
            ~{TOTAL_SECONDS.toFixed(1)}s clip. Works best in Chrome/Edge — Safari's video recording support is limited.
          </p>
        </section>
      </main>
    </div>
  );
}
