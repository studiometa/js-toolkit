import fs from 'node:fs';

export function getFilenamesInFolder(path, base) {
  return fs
    .readdirSync(new URL(path, base).pathname)
    .filter((file) => file !== 'index.js' && file !== 'index.ts')
    .map((file) => file.replace(/\.(j|t)s$/, ''));
}
