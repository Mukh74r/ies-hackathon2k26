import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Stop Vite from auto-preloading ALL vendor chunks on every page.
    // Heavy chunks (3d, charts, markdown) load on demand via lazy() imports.
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        // Only preload lightweight, always-needed chunks
        const alwaysNeeded = ['vendor-react', 'vendor-radix', 'vendor-icons', 'vendor-query'];
        return deps.filter(dep =>
          alwaysNeeded.some(name => dep.includes(name)) || !dep.includes('vendor-')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — always needed, cache separately
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // UI primitives — fairly stable, good cache candidate
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],

          // Heavy animation/3D — only used in specific pages
          "vendor-3d-anim": ["three", "gsap", "motion"],

          // Charts — only used inside dashboards
          "vendor-charts": ["recharts"],

          // Markdown/Math rendering — only used in Turbo
          "vendor-markdown": [
            "react-markdown",
            "rehype-katex",
            "remark-math",
            "react-syntax-highlighter",
          ],

          // Icon library — large, but stable cache candidate
          "vendor-icons": ["lucide-react"],

          // Data fetching
          "vendor-query": ["@tanstack/react-query", "zustand"],
        },
      },
    },
    // Increase chunk size warning threshold slightly (heavy libs flagged otherwise)
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: [
      "three",
      "gsap",
      "recharts",
      "lucide-react",
      "motion",
      "react-markdown",
      "rehype-katex",
      "remark-math",
    ],
  },
  server: {
    host: true,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    warmup: {
      clientFiles: [
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/components/turbo/dashboard/TurboChat.jsx",
      ],
    },
  },
});
