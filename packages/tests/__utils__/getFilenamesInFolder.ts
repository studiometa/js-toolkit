import { resolve } from 'node:path';
import fs from 'node:fs';

export function getFilenamesInFolder(path) {
  return  fs
    .readdirSync(require.resolve(path))
    .filter((file) => file !== 'index.js')
    .map((file) => file.replace(/\.js$/, ''));
}
