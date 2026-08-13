import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import llmstxt from 'vitepress-plugin-llms';

export default defineConfig({
  plugins: [tailwindcss(), llmstxt()],
  // The code samples import the package by name and must compile against the
  // sources, not a build that may not exist. The `typescript` condition of the
  // `exports` map points at `src/`, which beats hand-written aliases: it cannot
  // drift when the package tree moves. Both resolvers need it — VitePress builds
  // a client bundle and an SSR bundle.
  resolve: {
    conditions: ['typescript'],
  },
  ssr: {
    resolve: {
      conditions: ['typescript'],
    },
  },
});
