import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev serves at "/", production build is served under the GitHub Pages
// project subpath "/replyr/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/replyr/" : "/",
  plugins: [react()],
}));
