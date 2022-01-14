const fs = require('fs');
const pkg = require.resolve('@bytebase/vue-kbar');

const file = fs.readFileSync(pkg).toString();
const pattern = '"KBarInternalEvents",setup(){';
const fix = pattern + 'if(typeof window === "undefined")return;'

if (!file.includes(fix)) {
  fs.writeFileSync(pkg, file.replace(pattern, fix));
}
