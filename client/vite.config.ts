import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/testAPI": "http://localhost:8080",
      "/auth": "http://localhost:8080",
      "/users": "http://localhost:8080",
      "/chats": "http://localhost:8080",
      "/messages": "http://localhost:8080",
    },
  },
});
