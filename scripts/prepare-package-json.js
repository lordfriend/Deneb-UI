let fs = require('fs');

let jsonContent = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf8'}));

jsonContent.scripts = undefined;

fs.writeFileSync('dist/package.json', JSON.stringify(jsonContent, null, 2), {encoding: 'utf8'});
