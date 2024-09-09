const fs = require('fs');

function adjustAppFile(file) {
  const channel = process.argv[2];
  const json = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
  json.build.win.publish[0].channel = channel;
  fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf-8');
}

adjustAppFile('package.json');

fs.writeFileSync('updaterChannel.js', `module.exports = '${process.argv[2]}';`, 'utf-8');
