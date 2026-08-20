/* global process */
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),

    babel({
      presets: [
        reactCompilerPreset(),
        [
          "@babel/preset-react",
          {
            runtime: "automatic",
          },
        ],
      ],
    }),

    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
});
