import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" — the renderer is loaded from file:// inside the packaged app.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "chrome128",
  },
  server: {
    port: 5273,
  },
});
