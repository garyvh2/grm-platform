import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    css: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
    },
  },
})
