import { useEffect, useMemo, useRef, useState } from "react";
import { geoCircle, geoNaturalEarth1, geoPath } from "d3-geo";
import { BORDERS, LAND, MAP_H, MAP_W, PROJECTION } from "../lib/worldMap.js";
import { priceOf } from "../lib/match.js";
import { countryOf } from "../lib/geo.js";

const projection = geoNaturalEarth1().scale(PROJECTION.scale).translate(PROJECTION.translate);
const toXY = (lng, lat) => projection([lng, lat]);

// Zoom presets as [west, south, east, north] in degrees.
const VIEWS = {
  World: null,
  Australia: [108, -45, 158, -8],
  "Asia-Pacific": [65, -48, 180, 30],
  "Europe & Middle East": [-15, 15, 65, 62],
  Americas: [-135, 5, -55, 58],
};

function viewBoxFor(nameOrBounds) {
  const b = Array.isArray(nameOrBounds) ? nameOrBounds : VIEWS[nameOrBounds];
  if (!b) return [0, 0, MAP_W, MAP_H];
  const [w, s, e, n] = b;
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const lng = w + ((e - w) * i) / 8;
    pts.push(toXY(lng, s), toXY(lng, n));
  }
  pts.push(toXY(w, (s + n) / 2), toXY(e, (s + n) / 2));
  let x0 = Math.min(...pts.map((p) => p[0]));
  let x1 = Math.max(...pts.map((p) => p[0]));
  let y0 = Math.min(...pts.map((p) => p[1]));
  let y1 = Math.max(...pts.map((p) => p[1]));
  // Keep the map's aspect ratio so nothing stretches.
  const aspect = MAP_W / MAP_H;
  const bw = x1 - x0;
  const bh = y1 - y0;
  if (bw / bh > aspect) {
    const nh = bw / aspect;
    y0 -= (nh - bh) / 2;
    y1 = y0 + nh;
  } else {
    const nw = bh * aspect;
    x0 -= (nw - bw) / 2;
    x1 = x0 + nw;
  }
  return [x0, y0, x1 - x0, y1 - y0];
}

const fitColor = (score) => (score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#94a3b8");
const kindColor = (op) => (op.kind === "watch" ? "#a78bfa" : "#22d3ee");

// Groups pins that would overlap at the current zoom.
function cluster(points, radius) {
  const out = [];
  for (const p of points) {
    const c = out.find((k) => Math.hypot(k.x - p.x, k.y - p.y) < radius);
    if (c) {
      c.items.push(p);
      c.x = (c.x * (c.items.length - 1) + p.x) / c.items.length;
      c.y = (c.y * (c.items.length - 1) + p.y) / c.items.length;
    } else out.push({ x: p.x, y: p.y, items: [p] });
  }
  return out;
}

// colorBy "fit": pins coloured by the viewer's fit score (dashboard).
// colorBy "kind": available options vs things being watched (home page showcase).
export default function WorldMap({ items, home, radiusKm, onOpen, initialView = "World", title = "Opportunity map", colorBy = "fit" }) {
  const [view, setView] = useState(initialView);
  const [vb, setVb] = useState(() => viewBoxFor(initialView));
  const [selected, setSelected] = useState(null);
  const [group, setGroup] = useState(null); // jobs in a tapped cluster
  const raf = useRef(0);

  // Smoothly animate between zoom presets.
  const zoomTo = (target) => {
    setView(Array.isArray(target) ? "" : target);
    const from = vb;
    const to = viewBoxFor(target);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cancelAnimationFrame(raf.current);
    if (still) return setVb(to);
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 650);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      setVb(from.map((v, i) => v + (to[i] - v) * e));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const points = useMemo(
    () =>
      items.map((it) => {
        const [x, y] = toXY(it.op.lng, it.op.lat);
        return { ...it, x, y };
      }),
    [items]
  );

  const unit = vb[2] / MAP_W; // shrink marks as we zoom in
  const clusters = useMemo(() => cluster(points, 14 * unit), [points, unit]);
  const homeXY = home ? toXY(home.lng, home.lat) : null;
  const rangePath = useMemo(
    () => (home && radiusKm ? geoPath(projection)(geoCircle().center([home.lng, home.lat]).radius(radiusKm / 111.2)()) : null),
    [home, radiusKm]
  );

  const countries = new Set(items.map((i) => countryOf(i.op.region))).size;
  const inView = points.filter((p) => p.x >= vb[0] && p.x <= vb[0] + vb[2] && p.y >= vb[1] && p.y <= vb[1] + vb[3]).length;

  const choose = (c) => {
    if (c.items.length === 1) {
      setGroup(null);
      return setSelected(c.items[0]);
    }
    // Zoom into the cluster's own bounds, at least ~4 degrees across.
    const lngs = c.items.map((p) => p.op.lng);
    const lats = c.items.map((p) => p.op.lat);
    const pad = (lo, hi, min) => {
      const mid = (lo + hi) / 2;
      const half = Math.max((hi - lo) / 2 + 0.6, min / 2);
      return [mid - half, mid + half];
    };
    const [w, e] = pad(Math.min(...lngs), Math.max(...lngs), 6);
    const [s, n] = pad(Math.min(...lats), Math.max(...lats), 4);
    zoomTo([w, s, e, n]);
    setSelected(null);
    setGroup([...c.items].sort((a, b) => b.score - a.score));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-950 text-slate-200 shadow-ai-glow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">
            {items.length} finds · {countries} {countries === 1 ? "country" : "countries"} · {inView} in view · sample data
          </p>
        </div>
        <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1" role="tablist" aria-label="Map region">
          {Object.keys(VIEWS).map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={view === name}
              onClick={() => zoomTo(name)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${view === name ? "bg-ai-cyan text-navy-950" : "text-slate-300 hover:bg-white/10"}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={vb.join(" ")} className="block h-auto w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }} role="img" aria-label={`${title}: ${items.length} finds across ${countries} countries`}>
          <defs>
            <radialGradient id="pin-glow">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0.55" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <pattern id="map-dots" width={8 * unit} height={8 * unit} patternUnits="userSpaceOnUse">
              <circle cx={unit} cy={unit} r={0.6 * unit} fill="#1e2b45" />
            </pattern>
          </defs>
          <rect x={vb[0]} y={vb[1]} width={vb[2]} height={vb[3]} fill="url(#map-dots)" />
          <path d={LAND} fill="#13213b" stroke="#2a4170" strokeWidth={0.6 * unit} />
          <path d={BORDERS} fill="none" stroke="#24375c" strokeWidth={0.4 * unit} />

          {rangePath && <path d={rangePath} fill="rgba(34,211,238,0.08)" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth={0.8 * unit} strokeDasharray={`${3 * unit} ${3 * unit}`} />}

          {clusters.map((c, i) => {
            const best = Math.max(...c.items.map((p) => p.score));
            const color = colorBy === "kind" ? (c.items.every((p) => p.op.kind === "watch") ? "#a78bfa" : "#22d3ee") : fitColor(best);
            const valueBoost = colorBy === "kind" && c.items.length === 1 ? Math.min(1.8, 0.8 + Math.log10(Math.max(1, c.items[0].op.value || 100) / 100) * 0.45) : 1;
            const isSel = selected && c.items.some((p) => p.op.id === selected.op.id);
            const r = (c.items.length > 1 ? 5.5 : 3.6 * Math.max(0.8, valueBoost)) * unit;
            const signal = c.items.length === 1 && c.items[0].op.kind === "watch";
            return (
              <g
                key={i}
                transform={`translate(${c.x} ${c.y})`}
                onClick={() => choose(c)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && choose(c)}
                tabIndex={0}
                role="button"
                aria-label={c.items.length > 1 ? `${c.items.length} finds, tap to zoom` : `${c.items[0].op.title}, ${c.items[0].score}% fit`}
                className="cursor-pointer outline-none"
              >
                <circle r={r * 3.2} fill="url(#pin-glow)" opacity={isSel ? 1 : 0.6} />
                <circle r={r} fill={color} opacity="0.35" className="map-ping" />
                <circle r={r} fill={signal ? "#0b1023" : color} stroke={signal ? "#a78bfa" : isSel ? "#fff" : "#070d1a"} strokeWidth={(signal ? 1.2 : 0.8) * unit} strokeDasharray={signal ? `${1.5 * unit} ${1.2 * unit}` : undefined} />
                {c.items.length > 1 && (
                  <text textAnchor="middle" dy="0.35em" fontSize={5.5 * unit} fontWeight="700" fill="#070d1a">
                    {c.items.length}
                  </text>
                )}
              </g>
            );
          })}

          {homeXY && (
            <g transform={`translate(${homeXY[0]} ${homeXY[1]})`} pointerEvents="none">
              <rect x={-3 * unit} y={-3 * unit} width={6 * unit} height={6 * unit} transform="rotate(45)" fill="#22d3ee" stroke="#070d1a" strokeWidth={0.8 * unit} />
              <text y={-6 * unit} textAnchor="middle" fontSize={6 * unit} fontWeight="600" fill="#a5f3fc">
                You · {home.city}
              </text>
            </g>
          )}
        </svg>
        <div className="map-sweep pointer-events-none absolute inset-y-0 w-1/4" aria-hidden="true" />
        <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-navy-950/80 px-2.5 py-1 text-[11px] font-medium text-ai-cyan">
          <span className="h-1.5 w-1.5 animate-glow rounded-full bg-ai-cyan" /> AI scanning sources
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 px-4 py-2.5 text-[11px] text-slate-400">
        {colorBy === "kind" ? (
          <>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ai-cyan" /> Available now</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-dashed border-ai-violet" /> Watching for you</span>
            
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-400" /> Great match</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Good option</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Worth a look</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-dashed border-ai-violet" /> Watching for you</span>
          </>
        )}
        {home && <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 bg-ai-cyan" /> You{radiusKm ? `, ${radiusKm} km range` : ""}</span>}
        <span className="ml-auto">Tap a pin or a number</span>
      </div>

      {group && !selected && (
        <div className="border-t border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between px-4 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ai-violet">{group.length} finds here</p>
            <button onClick={() => setGroup(null)} className="text-xs text-slate-400 hover:text-white" aria-label="Close list">✕</button>
          </div>
          <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto px-2 pb-2">
            {group.map((p) => (
              <li key={p.op.id}>
                <button onClick={() => setSelected(p)} className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{p.op.title}</span>
                    <span className="block text-xs text-slate-400">{p.op.location} · {priceOf(p.op)}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold" style={{ color: colorBy === "fit" ? fitColor(p.score) : kindColor(p.op) }}>
                    {colorBy === "fit" ? `${p.score}%` : p.op.kind === "watch" ? "Watching" : "Option"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{selected.op.title}</p>
            <p className="text-xs text-slate-400">
              {selected.op.location} · {countryOf(selected.op.region)} · {priceOf(selected.op)} · {colorBy === "fit" ? `${selected.op.distanceKm.toLocaleString()} km from you` : selected.op.tag}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {colorBy === "fit" ? (
              <span className="text-lg font-extrabold" style={{ color: fitColor(selected.score) }}>{selected.score}%</span>
            ) : (
              <span className="text-xs font-semibold" style={{ color: kindColor(selected.op) }}>{selected.op.kind === "watch" ? "Watching for you" : "Available now"}</span>
            )}
            <button onClick={() => onOpen(selected.op)} className="btn-primary px-4 py-2">Open →</button>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-white" aria-label="Close">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
