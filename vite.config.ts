import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 3000
  }
})


// Host set to truse or 0.0.0.0 listens on all addresses
//  --host=127.0.0.1 --port=3000 in vite preview package.json