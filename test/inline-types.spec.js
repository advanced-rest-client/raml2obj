/* eslint-env node, mocha */
const raml2obj = require('..');
const {assert} = require('chai');
const parser = require('./parser');

describe('raml2obj', () => {
  describe('inline-types.raml', () => {
    let obj;
    let response;
    before(() => {
      return parser('test/inline-types.raml')
      .then(result => raml2obj.parse({
        json: result
      }))
      .then((result) => {
        obj = result.json;
        response = obj.resources[1].methods[0].responses[0].body[0];
      });
    });

    it('Response\'s type is object', () => {
      assert.equal(response.type, 'object');
    });

    it('Response has properties', () => {
      assert.typeOf(response.properties, 'array');
      assert.lengthOf(response.properties, 3);
    });

    it('Meta property has properties', function() {
      assert.typeOf(response.properties[0].properties, 'array');
      assert.lengthOf(response.properties[0].properties, 1);
    });

    it('Meta property has array property', function() {
      assert.equal(response.properties[0].properties[0].type, 'array');
    });
  });
});
