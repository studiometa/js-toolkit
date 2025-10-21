import { resolve, dirname } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

export function setVersion(version) {
  const index = resolve(
    dirname(new URL(import.meta.url).pathname),
    '../../packages/js-toolkit/index.ts',
  );

  const content = readFileSync(index, { encoding: 'UTF-8' });
  writeFileSync(index, content.replace('__VERSION__', version), { encoding: 'UTF-8' });
}
