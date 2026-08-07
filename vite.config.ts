import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Canonical TanStack Start config (Nitro-based).
// NOTE: this intentionally uses the official plugin composition rather than
// @lovable.dev/vite-tanstack-config — that wrapper registers tanstackStart(),
// nitro() and viteReact() itself, so passing them again as plugins would
// double-register every plugin. It also defaults builds to the
// cloudflare-module preset, which is wrong for a Vercel deployment.
export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro(),
  ],
})
