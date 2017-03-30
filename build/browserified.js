(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function _isObject(obj) {
  return obj === Object(obj);
}

// EXAMPLE INPUT:
// {
//   foo: {
//     name: "foo!"
//   },
//   bar: {
//     name: "bar"
//   }
// }
//
// EXAMPLE OUTPUT:
// [ { name: "foo!", key: "foo" }, { name: "bar", key: "bar" } ]
function _objectToArray(obj) {
  if (Array.isArray(obj)) {
    return obj;
  }

  return Object.keys(obj).map((key) => {
    if (_isObject(obj[key])) {
      obj[key].key = key;
    }
    return obj[key];
  });
}

// EXAMPLE INPUT:
// [
//   { foo: { ... } },
//   { bar: { ... } },
// ]
//
// EXAMPLE OUTPUT:
// { foo: { ... }, bar: { ... } }
function _arrayToObject(arr) {
  return arr.reduce((acc, cur) => {
    Object.keys(cur).forEach((key) => {
      acc[key] = cur[key];
    });
    return acc;
  }, {});
}

// PUBLIC

function recursiveObjectToArray(obj) {
  if (_isObject(obj)) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (_isObject(obj) && ['responses', 'body', 'queryParameters', 'headers', 'properties',
        'baseUriParameters', 'annotations', 'uriParameters'].indexOf(key) !== -1) {
        obj[key] = _objectToArray(value);
      }

      recursiveObjectToArray(value);
    });
  } else if (Array.isArray(obj)) {
    obj.forEach((value) => {
      recursiveObjectToArray(value);
    });
  }

  return obj;
}

// Transform some TOP LEVEL properties from arrays to simple objects
function arraysToObjects(ramlObj) {
  ['types', 'traits', 'resourceTypes', 'annotationTypes', 'securitySchemes'].forEach((key) => {
    if (ramlObj[key]) {
      ramlObj[key] = _arrayToObject(ramlObj[key]);
    }
  });
  return ramlObj;
}

module.exports = {
  arraysToObjects,
  recursiveObjectToArray,
};

},{}],2:[function(require,module,exports){
const raml2obj = require('./');
/* global self */
if (typeof window === 'undefined') {
  // Web worker environment.
  self.raml2obj = raml2obj;
} else {
  window.raml2obj = raml2obj;
}

},{"./":4}],3:[function(require,module,exports){
function _isObject(obj) {
  return obj === Object(obj);
}

function makeConsistent(obj, types) {
  if (_isObject(obj)) {
    if (obj.type) {
      if (Array.isArray(obj.type)) {
        obj.type = obj.type[0];
      }

      if (types && types && types[obj.type]) {
        Object.assign(obj, types[obj.type]);
      }
    }

    if (obj.items && types && types[obj.items]) {
      obj.items = types[obj.items];
    }

    if (obj.examples && obj.examples.length) {
      obj.examples = obj.examples.map(example => (example.value ? example.value : example));
    }

    if (obj.structuredExample) {
      if (typeof obj.examples === 'undefined') {
        obj.examples = [];
      }

      obj.examples.push(obj.structuredExample.value);
      delete obj.example;
      delete obj.structuredExample;
    }

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      makeConsistent(value, types);
    });
  } else if (Array.isArray(obj)) {
    obj.forEach((value) => {
      makeConsistent(value, types);
    });
  }

  return obj;
}

module.exports = makeConsistent;

},{}],4:[function(require,module,exports){
'use strict';

/**
 * This library is meant to work in browser. It's hidden dependency is
 * https://github.com/raml-org/raml-parser-toolbelt
 * This library require to include it's browser/index.js script included into the document.
 * Then the `datatype_expansion.js` global variable will be available which is used
 * to extend RAML properties.
 *
 * Compering to original library it is also missing a raml js parser. In ARC this library
 * is used alongside own RAML parser implementation.
 *
 * Use `npm run browser` to build the script in `./build` folder. Final library if the
 * `raml2object.js`. It exposes `window.raml2object.parse` function to be used with parser output.
 */
/* global datatype_expansion */
const makeConsistent = require('./consistency-helpers');
const {arraysToObjects, recursiveObjectToArray} = require('./arrays-objects-helpers');

class Raml2Object {

  constructor(object) {
    this.raml = object;
    // If set to true it will use the performance API to measure the time of work.
    // Call `getMeasurement()` to get the list of results.
    this.debug = false;
  }
  /**
   * Uses the performance API to mark time for an event.
   */
  mark(title) {
    if (this.debug && performance && performance.mark) {
      performance.mark(title);
    }
  }
  /**
   * Computes times of execution of specific parts of the library.
   *
   * Entries names:
   * - raml2obj-enhace - time to execture the entire enhacement process
   * - raml2obj-arrays-to-object
   * - raml2obj-expanding-root-types
   * - raml2obj-make-consistent-root-types
   * - raml2obj-make-consistent-raml
   * - raml2obj-recursive-object-to-array
   * - raml2obj-apply-raml-types
   *
   * @return {Array<PerformanceEntry>} A list of entries. If the `debug` flag is not set to true
   * the it will return empty list.
   */
  getMeasurement() {
    if (!this.debug) {
      return [];
    }
    try {
      performance.measure('raml2obj-enhace', 'raml2obj-enhace-start',
          'raml2obj-enhace-end');
      performance.measure('raml2obj-arrays-to-object', 'raml2obj-arrays-to-object-start',
        'raml2obj-arrays-to-object-end');
      performance.measure('raml2obj-expanding-root-types',
        'raml2obj-expanding-root-types-start',
        'raml2obj-expanding-root-types-end');
      performance.measure('raml2obj-make-consistent-root-types',
        'raml2obj-make-consistent-root-types-start',
        'raml2obj-make-consistent-root-types-end');
      performance.measure('raml2obj-make-consistent-raml',
        'raml2obj-make-consistent-raml-start',
        'raml2obj-make-consistent-raml-end');
      performance.measure('raml2obj-recursive-object-to-array',
        'raml2obj-recursive-object-to-array-start',
        'raml2obj-recursive-object-to-array-end');
      performance.measure('raml2obj-apply-raml-types',
        'raml2obj-apply-raml-types-start',
        'raml2obj-apply-raml-types-end');
    } catch (e) {
      return [];
    }
    return performance.getEntriesByType('measure');
  }

  /**
   * Enchances RAML's JSON parser output by normalizing data type structure and
   * by expanding types definition useing the datatype_expansion library.
   *
   * @return {Promise} Fulfilled object with enhanced RAML JSON structure.
   */
  enhance() {
    this.mark('raml2obj-enhace-start');
    this.mark('raml2obj-arrays-to-object-start');
    arraysToObjects(this.raml);
    this.mark('raml2obj-arrays-to-object-end');
    this.mark('raml2obj-expanding-root-types-start');
    return this.expandRootTypes(this.raml.types)
    .then((expanded) => {
      this.mark('raml2obj-expanding-root-types-end');
      this.mark('raml2obj-make-consistent-root-types-start');
      const types = makeConsistent(expanded);
      this.mark('raml2obj-make-consistent-root-types-end');
      delete this.raml.types;
      this.mark('raml2obj-make-consistent-raml-start');
      makeConsistent(this.raml, types);
      this.mark('raml2obj-make-consistent-raml-end');
      this.mark('raml2obj-recursive-object-to-array-start');
      recursiveObjectToArray(this.raml);
      this.mark('raml2obj-recursive-object-to-array-end');
      this.securitySchemes = this.raml.securitySchemes;
      this.mark('raml2obj-apply-raml-types-start');
      this.applyRamlTypes(this.raml);
      this.mark('raml2obj-apply-raml-types-end');
      if (types) {
        this.raml.types = types;
      }
      this.mark('raml2obj-enhace-end');
      return this.raml;
    });
  }

  /**
   * Applies security schemas properties to the resources and methods.
   * If the security scheme has a `describedBy` field the corresponding fields
   * will be updated.
   *
   * This function should be called once per object since it won't check
   * if the properties from the security schema was already applied.
   *
   * This function returns nothing. Changes are made deep inside the object
   * so it is resolved by referewnce.
   *
   * @param {Object} object resource or method definition
   */
  applySecuritySchemes(object) {
    if (!object.queryParameters) {
      object.queryParameters = [];
    }
    if (!object.headers) {
      object.headers = [];
    }
    if (!object.securedBy) {
      object.securedBy = [];
    }
    var responses = [];
    object.securedBy.forEach(function(scheme) {
      if (!scheme || typeof scheme === 'string') {
        return;
      }
      if (scheme.describedBy) {
        if (scheme.describedBy.queryParameters) {
          object.queryParameters = object.queryParameters
            .concat(scheme.describedBy.queryParameters);
        }
        if (scheme.describedBy.headers) {
          object.headers = object.headers.concat(scheme.describedBy.headers);
        }
        if (scheme.describedBy.responses) {
          responses = responses.concat(scheme.describedBy.responses);
        }
      }
    });
    if (object.responses) {
      responses = responses.concat(object.responses);
    }
    responses.sort(function(a, b) {
      var aCode = Number(a.code);
      var bCode = Number(b.code);
      if (aCode > bCode) {
        return 1;
      }
      if (aCode < bCode) {
        return -1;
      }
      return 0;
    });
    object.responses = responses;
  }

  // Checks if given `obj` is an Object.
  isObject(obj) {
    return obj === Object(obj);
  }

  /**
   * Detect and add security scheme definitions to the object.
   * It replaces the id of the security scheme on a resource / method level with
   * Security Scheme type definition.
   *
   * @param {Object} object An object where security schemes should be applied. Either RAML method
   * or resource
   * @param {Object} rootSchemes Defined on a root level security schemes.
   */
  addSecuritSchemes(object) {
    var rootSchemes = this.securitySchemes;
    if (!rootSchemes || !Object.keys(rootSchemes).length) {
      return;
    }

    if (!object || !object.securedBy || !object.securedBy.length) {
      return;
    }

    var added = false;
    object.securedBy.forEach((item, i) => {
      if (typeof item === 'string') {
        if (item in rootSchemes) {
          added = true;
          object.securedBy[i] = rootSchemes[item];
        }
      } else if (this.isObject(item)) {
        let keys = Object.keys(item);
        let key = keys[0];
        if (key in rootSchemes) {
          added = true;
          let schema = rootSchemes[key];
          let params = item[key];
          schema.settings = Object.assign(schema.settings, params);
          object.securedBy[i] = schema;
        }
      }
    });
    if (added) {
      this.applySecuritySchemes(object);
    }
  }

  /**
   * Adds URI parameters to methods and resources to the lowest level in the resource hierarchy.
   * Also applies security schemas definitions on a resource and method level.
   */
  applyRamlTypes(ramlObj, parentUrl, allUriParameters) {
    if (!ramlObj.resources) {
      return;
    }

    ramlObj.resources.forEach((resource) => {
      resource.parentUrl = parentUrl || '';
      resource.allUriParameters = ramlObj.baseUriParameters || [];

      if (allUriParameters) {
        resource.allUriParameters = resource.allUriParameters.concat(allUriParameters);
      }

      if (resource.uriParameters) {
        resource.allUriParameters = resource.allUriParameters.concat(resource.uriParameters);
      }

      // Copy the RESOURCE uri parameters to the METHOD, because that's where they will be rendered.
      if (resource.methods) {
        resource.methods.forEach((method) => {
          method.allUriParameters = resource.allUriParameters;
          method.absoluteUri = resource.absoluteUri;
          this.addSecuritSchemes(method);
        });
      }
      this.addSecuritSchemes(resource);

      this.applyRamlTypes(resource, resource.parentUrl + resource.relativeUri,
        resource.allUriParameters);
    });
  }

  // This uses the datatype-expansion library to expand all the root type to their canonical
  // expanded form
  expandRootTypes(types) {
    if (!types) {
      return Promise.resolve(types);
    }
    var promises = Object.keys(types).map((key) => this._expandType(types, key));
    return Promise.all(promises)
    .then((results) => {
      results.forEach((result) => {
        types[result[0]] = result[1];
      });
      return types;
    });
  }

  _expandType(types, key) {
    return new Promise((resolve) => {
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      datatype_expansion.js.expandedForm(types[key], types, (err, expanded) => {
        if (expanded) {
          datatype_expansion.js.canonicalForm(expanded, (err2, canonical) => {
            if (canonical) {
              resolve([key, canonical]);
            } else {
              resolve([key, types[key]]);
            }
          });
        } else {
          resolve([key, types[key]]);
        }
      });
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });
  }
}

module.exports.parse = function(source) {
  const r2o = new Raml2Object(source);
  return r2o.enhance();
};

},{"./arrays-objects-helpers":1,"./consistency-helpers":3}]},{},[2]);