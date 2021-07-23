import fs from 'fs';

export default function getFilenamesInFolder(path, base) {
  return  fs
    .readdirSync(new URL(path, base))
    .filter((file) => file !== 'index.js')
    .map((file) => file.replace(/\.js$/, ''));
}
