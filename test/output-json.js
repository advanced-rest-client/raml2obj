const fs = require('fs');
const raml2obj = require('..');
const glob = require('glob');
const parser = require('./parser');

process.chdir(__dirname);

const ramlFiles = glob.sync('*.raml');

const ps = ramlFiles.map((ramlFile) => {
  console.log('Parsing', ramlFile);
  return parser(ramlFile)
  .then((result) => {
    console.log('Expanding', ramlFile);
    return raml2obj.parse({json: result});
  })
  .then((result) => {
    const filename = ramlFile.replace('.raml', '.json');
    console.log('Saving', filename);
    const jsonString = JSON.stringify(result.json, null, 2);
    fs.writeFileSync(filename, jsonString);
  });
});
Promise.all(ps)
.then(() => console.log('done'))
.catch((cause) => console.error(cause));
