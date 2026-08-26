import { defineConfig } from 'vite';
import { decorators } from '../vite-plugin-decorators.js';

export default defineConfig({
  plugins: [decorators()],
});
