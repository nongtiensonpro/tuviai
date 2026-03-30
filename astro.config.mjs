// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const astroPrerenderEntrypoint = fileURLToPath(
  new URL('./node_modules/astro/dist/entrypoints/prerender.js', import.meta.url),
);

// https://astro.build/config
export default defineConfig({
  // Static output — no server required, GitHub Pages compatible
  output: 'static',
  site: 'https://nongtiensonpro.github.io',
  base: '/tuviai', // Sửa đường dẫn theo Tên Repository của bạn trên Github

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'astro/entrypoints/prerender': astroPrerenderEntrypoint,
      },
    },
  }
});
