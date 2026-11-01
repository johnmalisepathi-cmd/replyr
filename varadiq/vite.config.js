import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works on any host or subpath (GitHub Pages,
// Netlify, a custom domain). Routing is hash-based, so no server rewrites.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
