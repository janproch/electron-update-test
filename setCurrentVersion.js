const fs = require('fs');

const packageJson = fs.readFileSync('package.json', { encoding: 'utf-8' });
const json = JSON.parse(packageJson);

fs.writeFileSync('index.html', json.version);

