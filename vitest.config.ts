import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt', // or 'happy-dom' for pure unit tests
    globals: true,
    exclude: ['**/node_modules/**', '**/.git/**', 'tests/integration/**'],
  },
})
