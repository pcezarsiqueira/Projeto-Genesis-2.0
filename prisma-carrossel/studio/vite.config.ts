import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const raiz = path.resolve(__dirname, "..");
const servidor = "http://127.0.0.1:4317";

export default defineConfig({
  root: __dirname,
  base: "/",
  plugins: [react()],
  build: { outDir: path.join(__dirname, "dist"), emptyOutDir: true, sourcemap: false },
  server: {
    // Só para desenvolvimento: a interface final é servida pelo servidor do PRISMA.
    fs: { allow: [raiz] },
    proxy: { "/api": servidor, "/motor": servidor, "/download": servidor },
  },
});
