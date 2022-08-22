const path = require('path');
const fs = require('fs');

const index = path.resolve(__dirname, '../packages/js-toolkit/index.ts');

const content = `import Base from './Base/index.js';
import * as DECORATORS from './decorators/index.js';
import * as HELPERS from './helpers/index.js';
import * as SERVICES from './services/index.js';
import * as UTILS from './utils/index.js';

export * from './decorators/index.js';
export * from './helpers/index.js';
export * from './services/index.js';
export * from './utils/index.js';

export { Base, DECORATORS, HELPERS, SERVICES, UTILS };

export const FRAMEWORK = {
  Base,
  DECORATORS,
  HELPERS,
  SERVICES,
};

export const ALL = {
  FRAMEWORK,
  UTILS,
};
`;

fs.writeFileSync(index, content, { encoding: 'UTF-8' });
