// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Static output — no server required, GitHub Pages compatible
  output: 'static',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});