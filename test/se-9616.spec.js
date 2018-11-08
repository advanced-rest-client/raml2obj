/* eslint-env node, mocha */

const raml2obj = require('..');
const {assert} = require('chai');
const parser = require('./parser');

describe('raml2obj', () => {
  describe('jira issue SE-9616 - recursive types', () => {
    let obj;

    before(() => {
      return parser('test/SE-9616/loop.raml')
      .then((result) => raml2obj.parse({
        json: result
      }))
      .then((result) => {
        obj = result.json;
      });
    });

    it('types property is computed', () => {
      assert.typeOf(obj.types, 'object');
      assert.lengthOf(Object.keys(obj.types), 1);
    });

    it('resources property is computed', () => {
      assert.typeOf(obj.resources, 'array');
      assert.lengthOf(obj.resources, 1);
    });

    it('Recursive type is computed', () => {
      const type = obj.resources[0].methods[0].headers[0];
      assert.typeOf(type, 'object');
      assert.equal(type.displayName, 'product');
    });

    it('Recursive type has single property', () => {
      const properties = obj.resources[0].methods[0].headers[0].properties;
      assert.typeOf(properties, 'array');
      assert.lengthOf(properties, 1);
    });

    it('Recusrive property is not expanded', () => {
      const property = obj.resources[0].methods[0].headers[0].properties[0];
      assert.equal(property.items, 'product');
    });
  });
});
