import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
// import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  // define: {
  //   VITE_PRODUCTION_BACKEND_API_URL: `${process.env.VITE_PRODUCTION_BACKEND_API_URL}`,
  //   VITE_PRODUCTION_BACKEND_BASE_URL: `${process.env.VITE_PRODUCTION_BACKEND_BASE_URL}`,
  // },
  plugins: [
    react(),
  ],
  preview: {
    host: true,
    port: 3000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

})

// TanStackRouterVite(),

// Host set to truse or 0.0.0.0 listens on all addresses
//  --host=127.0.0.1 --port=3000 in vite preview package.json