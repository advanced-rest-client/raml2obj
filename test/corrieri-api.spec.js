const raml2obj = require('..');
const {assert} = require('chai');
const parser = require('./parser');

describe('raml2obj', () => {
  describe('Memory consumption', function() {
    this.timeout(10000);
    let obj;
    before(() => {
      return parser('test/corrieri-api/api.raml')
      .then((result) => raml2obj.parse({
        json: result
      }))
      .then((result) => {
        obj = result.json;
      });
    });

    it('Parses the API', () => {
      assert.ok(obj);
    });
  });
});
