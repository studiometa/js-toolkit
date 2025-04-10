import { defineConfig, js, ts, prettier, globals } from '@studiometa/eslint-config';

export default defineConfig(js, ts, prettier, {
  files: ['src/js/**/*'],
  languageOptions: {
    globals: globals.browser,
  },
});
