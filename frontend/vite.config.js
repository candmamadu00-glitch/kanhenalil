import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Kanhen Alil',
        short_name: 'Kanhen',
        description: 'O Melhor Sabor da Guiné',
        theme_color: '#E53E3E',
        background_color: '#ffffff',
        display: 'standalone', // Isso faz abrir como um app, sem a barra do navegador!
        icons: [
          {
            // Usando um ícone temporário de comida para o app (você pode trocar depois)
            src: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})