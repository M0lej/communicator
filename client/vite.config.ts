import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/testAPI": "http://localhost:8080",
      "/api/auth": "http://localhost:8080",
      "/api/users": "http://localhost:8080",
      "/api/chats": "http://localhost:8080",
      "/api/chat": "http://localhost:8080",
      "/api/messages": "http://localhost:8080",
      "/api/avatar": "http://localhost:8080",
      "/api/ws": {
        target: "http://localhost:8080",
        ws: true,
      },
    },
  },
});
