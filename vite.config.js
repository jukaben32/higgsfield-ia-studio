import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiDevPlugin } from './server/vitePlugin.js'

// https://vite.dev/config/
// apiDevPlugin hace que /api/* funcione en local con `npm run dev`
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
})
