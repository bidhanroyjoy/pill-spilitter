import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-ignore: Tailwind's Vite plugin has no types yet
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
