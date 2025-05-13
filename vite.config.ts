import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The base URL must match your GitHub Pages URL structure
  // If your repo is https://github.com/username/react-minimal-tetris
  // The app will be deployed to https://username.github.io/react-minimal-tetris/
  base: process.env.NODE_ENV === "production" ? "/react-minimal-tetris/" : "/",
});
