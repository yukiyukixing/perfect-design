import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { sites } from "./build/sites-vite-plugin.js";

export default defineConfig({
  base: "./",
  plugins: [
    sites(),
    cloudflare({
      viteEnvironment: { name: "server" },
      config: {
        main: "./worker/index.js",
        compatibility_date: "2026-07-12",
        compatibility_flags: ["nodejs_compat"],
        assets: {
          binding: "ASSETS",
          not_found_handling: "single-page-application",
          run_worker_first: true,
        },
      },
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
