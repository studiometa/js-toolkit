import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import llmstxt from 'vitepress-plugin-llms';

export default defineConfig({
  plugins: [tailwindcss(), llmstxt()],
});
