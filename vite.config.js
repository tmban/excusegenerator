import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In local dev, proxy /api calls to Vercel dev server
      // Run `vercel dev` instead of `vite` if you want the API working locally
    },
  },
});
