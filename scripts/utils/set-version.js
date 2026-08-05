import { resolve, dirname } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Inject the version into the built entry file.
 *
 * The `version` export in `packages/js-toolkit/index.ts` holds a `__VERSION__`
 * placeholder. Replacing it in the built `dist/index.js` (instead of the
 * tracked source) keeps the placeholder in the repository, so a local build can
 * never commit a stale version string back into the source.
 */
export function setVersion(version) {
  const index = resolve(dirname(new URL(import.meta.url).pathname), '../../dist/index.js');

  const content = readFileSync(index, { encoding: 'UTF-8' });
  if (!content.includes('__VERSION__')) {
    throw new Error(`setVersion: could not find the '__VERSION__' placeholder in ${index}`);
  }
  writeFileSync(index, content.replace('__VERSION__', version), { encoding: 'UTF-8' });
}
