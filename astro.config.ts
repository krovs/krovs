import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import homelabDiagrams from "./src/markdown/homelab-diagrams.mjs"; // Shared diagram renderer and icon catalog.

export default defineConfig({
  site: "https://krovs.dev",
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ mdastPlugins: [homelabDiagrams] }),
    shikiConfig: {
      theme: "catppuccin-macchiato",
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  },
});
