import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import react from "@vitejs/plugin-react-swc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
