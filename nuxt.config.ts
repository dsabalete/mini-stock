import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Stock F1',
    },
  },
  runtimeConfig: {
    public: {
      adminEmail: process.env.ADMIN_EMAIL,
    },
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'cloudflare_pages',
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
