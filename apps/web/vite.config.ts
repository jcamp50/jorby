import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const envDir = path.resolve(rootDir, '../..')

function foundryProxy(foundryOrigin: string | undefined) {
  if (!foundryOrigin) {
    return undefined
  }
  return {
    '/api': { target: foundryOrigin, changeOrigin: true, secure: true, ws: true },
    '/multipass': { target: foundryOrigin, changeOrigin: true, secure: true },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  const proxy = foundryProxy(env.VITE_FOUNDRY_API_URL)

  return {
    plugins: [react(), tailwindcss()],
    // Root `.env` holds public VITE_* values and FOUNDRY_TOKEN. Vite only exposes
    // VITE_* to the browser; the token stays in the Node process for npm.
    envDir,
    server: {
      port: 8080,
      strictPort: true,
      proxy,
    },
    preview: {
      port: 8080,
      strictPort: true,
      proxy,
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    optimizeDeps: {
      include: ['@jorby/sdk'],
    },
  }
})
