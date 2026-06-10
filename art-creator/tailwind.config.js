/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm creative accent (fuchsia → amber) for the art studio theme.
        accent: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        ink: {
          950: "#0b0710",
          900: "#120c1a",
          850: "#171022",
          800: "#1d1729",
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
        glow: "0 0 40px -8px rgba(236,72,153,0.55)",
        "glow-sm": "0 0 22px -8px rgba(236,72,153,0.6)",
        card: "0 10px 40px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "accent-grad": "linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 120%)",
      },
    },
  },
  plugins: [],
};
