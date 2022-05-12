const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const utilsPkg = {
  name: '@studiometa/js-toolkit/utils',
  version: pkg.version,
  type: 'module',
  module: './index.js',
};

fs.writeFileSync(
  path.resolve(__dirname, '../dist/utils/package.json'),
  JSON.stringify(utilsPkg, null, 2),
  { encoding: 'UTF-8' }
);
