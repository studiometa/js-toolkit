const fs = require('node:fs');
const path = require('node:path');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve(__dirname, '../package.json'));

const content = `/* eslint-disable vars-on-top, no-var */
declare global {
  var __VERSION__: '${pkg.version}';
}

export {};
`;

fs.writeFileSync(path.resolve(__dirname, '../packages/version.d.ts'), content);
