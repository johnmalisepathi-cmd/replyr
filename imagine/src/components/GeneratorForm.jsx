import { aspectRatios } from "../lib/pollinations";

export default function GeneratorForm({
  prompt,
  setPrompt,
  finalPrompt,
  aspect,
  setAspect,
  count,
  setCount,
  onGenerate,
  generating,
  error,
}) {
  return (
    <div className="glass flex flex-col gap-4 rounded-2xl p-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Describe your idea</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. a cute baby dinosaur, or a cozy cottage in an enchanted forest"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/60 focus:outline-none"
        />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Final prompt sent</h3>
        <p className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs leading-relaxed text-white/60">
          {finalPrompt || "Pick a style and describe your idea above."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-white/50">
          Shape
          <select
            value={aspect}
            onChange={(e) => setAspect(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm font-normal normal-case text-white focus:border-cyan-400/60 focus:outline-none"
          >
            {aspectRatios.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-ink-900">
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-white/50">
          Variations — {count}
          <input
            type="range"
            min="1"
            max="4"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2 accent-cyan-400"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      <button
        onClick={onGenerate}
        disabled={generating || !prompt.trim()}
        className="btn-accent px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {generating ? "Generating…" : "Generate artwork"}
      </button>

      <p className="text-center text-[11px] text-white/30">
        Free to use • no account • powered by Pollinations AI
      </p>
    </div>
  );
}
