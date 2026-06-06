import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          const [, modulePath] = id.split('node_modules/')
          const parts = modulePath.split('/')
          const packageName = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]

          if (['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'].includes(packageName)) return 'react'
          if (['@tanstack/react-query', 'axios', 'zustand'].includes(packageName)) return 'query'
          if (['i18next', 'i18next-browser-languagedetector', 'react-i18next'].includes(packageName)) return 'i18n'
          if (packageName.startsWith('@radix-ui/') || ['framer-motion', 'lucide-react', 'react-icons'].includes(packageName)) return 'ui'
          if (['leaflet', 'react-leaflet', 'leaflet.markercluster'].includes(packageName)) return 'maps'
          if (packageName === 'recharts' || packageName.startsWith('d3-')) return 'charts'
        },
      },
    },
  },
})
