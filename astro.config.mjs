import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  redirects: {
    '/posts': '/writing',
    '/posts/[...slug]': '/writing/[...slug]',
  },
  integrations: [tailwind({ applyBaseStyles: true }), mdx()],
  server: { host: true, port: 4321 },
  vite: {
    server: { watch: { usePolling: true } },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
