/* eslint-env node, mocha */

const raml2obj = require('..');
const {assert} = require('chai');
const parser = require('./parser');

describe('type-with-type.raml', () => {
  let obj;

  before(() => {
    return parser('test/type-with-type.raml')
    .then(result => raml2obj.parse({
      json: result
    }))
    .then((result) => {
      obj = result.json;
    });
  });

  it('Contains 3 properties', () => {
    const props = obj.types.myType.properties;
    assert.lengthOf(props, 3);
  });

  it('All properties are objects', () => {
    const props = obj.types.myType.properties;
    const nonObject = props.find((prop) => typeof prop !== 'object');
    assert.isUndefined(nonObject);
  });
});
