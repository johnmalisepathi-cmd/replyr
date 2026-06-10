import { stylePresets } from "../lib/presets";

export default function StylePresets({ selectedId, onSelect }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Style</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {stylePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
              selectedId === preset.id
                ? "border-cyan-400/60 bg-cyan-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <span
              className="mt-1 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: preset.swatch }}
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium text-white/90">{preset.name}</span>
              <span className="mt-0.5 block text-xs text-white/50">{preset.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
