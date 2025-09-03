import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // This will expose the server on all network interfaces
    port: 8000, // Custom port - change this to your preferred port
    historyApiFallback: true,
  },
  base: "/",
})
