import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Manifest icons in public/icons are precached once via includeManifestIcons.
      // Do NOT re-list them (or public/assets brand PNGs) in includeAssets —
      // that causes add-to-cache-list-conflicting-entries for the same URL.
      includeManifestIcons: true,
      manifest: {
        name: 'EvoluaFit',
        short_name: 'EvoluaFit',
        description: 'Treinos inteligentes, evolução real.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#061426',
        background_color: '#030b18',
        lang: 'pt-BR',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // App shell only — no PNGs (avoids clashing with manifest icons / public assets)
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'],
        globIgnores: [
          '**/media/**',
          '**/assets/evoluafit-icon.png',
          '**/assets/evoluafit-logo.png',
          '**/icons/**',
          '**/icons/**/*.jpg',
          '**/icons/**/*.jpeg',
          '**/icons/**/thumbs/**',
          '**/icons/antebraco/**',
          '**/icons/biceps/**',
          '**/icons/costas/**',
          '**/icons/lombar/**',
          '**/icons/ombros/**',
          '**/icons/peito/**',
          '**/icons/pernas/**',
          '**/icons/trapezio/**',
          '**/icons/triceps/**',
          '**/icons/fallbacks/**',
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith('.supabase.co') ||
              url.pathname.startsWith('/auth/v1/') ||
              url.pathname.startsWith('/rest/v1/') ||
              url.pathname.startsWith('/storage/v1/') ||
              url.pathname.startsWith('/realtime/v1/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'font' ||
              url.hostname === 'fonts.googleapis.com' ||
              url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'evoluafit-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'image' &&
              url.origin === self.location.origin &&
              !url.pathname.includes('/media/exercises/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'evoluafit-local-images',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'document',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'evoluafit-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: '/',
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    open: false,
  },
})
