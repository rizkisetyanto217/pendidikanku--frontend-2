// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    // (opsional) port fallback kalau tidak diisi dari CLI
    // port: Number(process.env.PORT) || 4173,
    allowedHosts: [
      "pendidikanku-frontend-2-production.up.railway.app", // host yang muncul di error
      ".railway.app", // izinkan semua subdomain Railway
    ],
  },
});
