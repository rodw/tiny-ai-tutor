import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const dotEnvCandidates = [
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "../.env"),
];

for (const envFile of dotEnvCandidates) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    break;
  }
}

const SERVER_PORT = process.env.SERVER_PORT || "3000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      }
    }
  }
});