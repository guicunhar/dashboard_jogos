import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: {
    allowedHosts: ["cm596v-4173.csb.app"],
  },
});
