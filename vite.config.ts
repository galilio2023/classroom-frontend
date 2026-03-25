import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "apple-icon-180.png"],
      manifest: {
        name: "Classroom AI",
        short_name: "Classroom",
        description: "A modern classroom management system",
        theme_color: "#ffffff",
        icons: [
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Increase limit to 5MiB
        runtimeCaching: [
          {
            // Cache both localhost and production API calls
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // 1. Isolate the absolute heaviest dependencies
            if (id.includes("@excalidraw")) {
              return "vendor-excalidraw";
            }
            
            // 2. Group the Rich Text Editor ecosystem
            if (id.includes("@tiptap") || id.includes("prosemirror")) {
              return "vendor-editor";
            }

            // 3. Group heavy visualization tools
            if (id.includes("recharts") || id.includes("framer-motion")) {
              return "vendor-viz";
            }

            // 4. Let Vite/Rollup handle React, Refine, and Radix automatically.
            // This prevents circular dependencies because Vite can intelligently 
            // share modules between these framework-level libraries.
          }
        },
      },
    },
    chunkSizeWarningLimit: 2500, // Adjusted for the combined weight of framework + UI
  },
  define: {
    "process.env": {},
  },
});
