import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS(), svgr({ include: "**/*.svg" })],
  server: {
    host: "0.0.0.0",
    https: {
      key: "../../certs/server.key",
      cert: "../../certs/server.crt"
    },
    proxy: {
      "/api": {
        target: "http://webauthn.localhost:3310",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      },
      "/.well-known": {
        target: "http://webauthn.localhost:3310",
        changeOrigin: true
      }
    }
  }
});
