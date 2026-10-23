/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // AI accents: used only on AI surfaces so they read as "the AI is working".
        ai: { cyan: "#22d3ee", violet: "#a78bfa", deep: "#1e1b4b" },
        // Deep navy for trust, emerald for "fit / opportunity".
        navy: {
          950: "#070d1a",
          900: "#0b1426",
          800: "#122039",
          700: "#1b2d4d",
          600: "#2a4170",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        brand: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      keyframes: {
        scan: { "0%": { top: "0%" }, "100%": { top: "100%" } },
        blink: { "50%": { opacity: "0" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        glowpulse: { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        dot: { "0%,80%,100%": { transform: "scale(0.6)", opacity: "0.4" }, "40%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        scan: "scan 3.2s linear infinite",
        blink: "blink 1s step-end infinite",
        floaty: "floaty 4s ease-in-out infinite",
        glow: "glowpulse 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        dot: "dot 1.2s ease-in-out infinite",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.18)",
        glow: "0 0 60px -12px rgba(16,185,129,0.55)",
        "ai-glow": "0 0 0 1px rgba(167,139,250,0.25), 0 0 50px -10px rgba(34,211,238,0.45)",
      },
    },
  },
  plugins: [],
};
