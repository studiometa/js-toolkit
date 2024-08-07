import { resolve, dirname } from 'node:path';
import { writeFileSync } from 'node:fs';

const index = resolve(
  dirname(new URL(import.meta.url).pathname),
  '../packages/js-toolkit/index.ts',
);

const content = `
import * as BASE from './base/index.js';
import * as DECORATORS from './decorators/index.js';
import * as HELPERS from './helpers/index.js';
import * as SERVICES from './services/index.js';
import * as UTILS from './utils/index.js';

export * from './Base/index.js';
export * from './decorators/index.js';
export * from './helpers/index.js';
export * from './services/index.js';
export * from './utils/index.js';

export { BASE, DECORATORS, HELPERS, SERVICES, UTILS };

export const FRAMEWORK = {
  BASE,
  DECORATORS,
  HELPERS,
  SERVICES,
};

export const ALL = {
  FRAMEWORK,
  UTILS,
};
`;

writeFileSync(index, content, { encoding: 'UTF-8' });
