/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Cosmic teal → violet accent for the AI generator theme.
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        ink: {
          950: "#070912",
          900: "#0c0f1a",
          850: "#101422",
          800: "#151a2c",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(34,211,238,0.5)",
        "glow-sm": "0 0 22px -8px rgba(34,211,238,0.6)",
        card: "0 10px 40px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "accent-grad": "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 60%, #22d3ee 120%)",
      },
    },
  },
  plugins: [],
};
