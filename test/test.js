const parser = require('./parser');
const raml2obj = require('..');
const fs = require('fs');

const _perf = require('perf_hooks');
if (_perf) {
  global.performance = _perf.performance;
}
// const apiUrl = 'test/address-1.0.0-raml-fragment/address.raml';
// const apiUrl = 'test/employment-1.0.0-raml-fragment/employment.raml';
// const apiUrl = 'test/raml-example-api-master/api.raml';
// const apiUrl = 'test/array-of-foo.raml';
const apiUrl = 'test/cpu-api/eip-pss.raml';
const startTime = performance.now();
let parsingTime;
let processTime;
parser(apiUrl)
.then((result) => {
  parsingTime = performance.now() - startTime;
  console.log('Parsing time', parsingTime, 'ms');
  return raml2obj.parse({
    json: result,
    takeMeasurements: true
  });
})
.then((result) => {
  processTime = performance.now() - startTime;
  console.log('Process API time', processTime, 'ms');
  console.table(result.measurement);
  result.measurement.push({
    name: 'API process time',
    duration: processTime
  });
  result.measurement.push({
    name: 'API parsing time',
    duration: parsingTime
  });
  let csv = 'Operation name;Operation duration;\n';
  result.measurement.forEach((item) => {
    csv += `${item.name};${item.duration};\n`;
  });

  // const jsonString = JSON.stringify(result.measurement, null, 2);
  const filename = 'test/cpu-api.csv';
  fs.writeFileSync(filename, csv);
})
.catch((data) => {
  console.error(data);
});
