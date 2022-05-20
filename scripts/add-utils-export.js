const path = require('path');
const fs = require('fs');

const index = path.resolve(__dirname, '../packages/js-toolkit/index.js');

let content = fs.readFileSync(index, { encoding: 'utf-8' });
content += "\nexport * from './utils/index.js';\n";

fs.writeFileSync(index, content, { encoding: 'UTF-8' });
