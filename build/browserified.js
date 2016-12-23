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
      if (_isObject(obj) && ['responses', 'body', 'queryParameters', 'headers', 'properties', 'baseUriParameters', 'annotations', 'uriParameters'].indexOf(key) !== -1) {
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
window.raml2obj = raml2obj;

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
const makeExamplesAndTypesConsistent = require('./consistency-helpers');
const {arraysToObjects, recursiveObjectToArray} = require('./arrays-objects-helpers');

function _makeUniqueId(string) {
  string = string.replace(/\W/g, '_');
  string = string.replace(new RegExp('^_+'), '');
  return string.toLowerCase();
}

// Add unique id's and parent URL's plus parent URI parameters to resources
function _addRaml2htmlProperties(ramlObj, parentUrl, allUriParameters, baseUri) {
  // Add unique id's to top level documentation chapters
  if (ramlObj.documentation) {
    ramlObj.documentation.forEach((docSection) => {
      docSection.uniqueId = _makeUniqueId(docSection.title);
    });
  }

  if (!ramlObj.resources) {
    return ramlObj;
  }

  baseUri = baseUri || ramlObj.baseUri;
  if (baseUri && baseUri[baseUri.length - 1] === '/') {
    baseUri = baseUri.substr(0, baseUri.length - 1);
  }

  ramlObj.resources.forEach((resource) => {
    resource.parentUrl = parentUrl || '';
    resource.uniqueId = _makeUniqueId(resource.parentUrl + resource.relativeUri);
    resource.absoluteUrl = baseUri + resource.relativeUri;
    resource.allUriParameters = ramlObj.baseUriParameters || [];

    if (allUriParameters) {
      resource.allUriParameters = resource.allUriParameters.concat(allUriParameters);
    }

    if (resource.uriParameters) {
      resource.allUriParameters = resource.allUriParameters.concat(resource.uriParameters);
      // resource.uriParameters.forEach((uriParameter) => {
      //   resource.allUriParameters.push(uriParameter);
      // });
    }

    // Copy the RESOURCE uri parameters to the METHOD, because that's where they will be rendered.
    if (resource.methods) {
      resource.methods.forEach((method) => {
        method.allUriParameters = resource.allUriParameters;
        method.absoluteUrl = resource.absoluteUrl;
      });
    }

    _addRaml2htmlProperties(resource, resource.parentUrl + resource.relativeUri,
      resource.allUriParameters, baseUri);
  });

  return ramlObj;
}

// This uses the datatype-expansion library to expand all the root type to their canonical
// expanded form
function _expandRootTypes(types) {
  if (!types) {
    return types;
  }

  Object.keys(types).forEach((key) => {
    datatype_expansion.js.expandedForm(types[key], types, (err, expanded) => {
      if (expanded) {
        datatype_expansion.js.canonicalForm(expanded, (err2, canonical) => {
          if (canonical) {
            types[key] = canonical;
          }
        });
      }
    });
  });
  return types;
}

function _enhanceRamlObj(ramlObj) {
  // Some of the structures (like `types`) are an array that hold key/value pairs, which is
  // very annoying to work with.
  // Let's make them into a simple object, this makes it easy to use them for direct lookups.
  //
  // EXAMPLE of these structures:
  // [
  //   { foo: { ... } },
  //   { bar: { ... } },
  // ]
  //
  // EXAMPLE of what we want:
  // { foo: { ... }, bar: { ... } }
  ramlObj = arraysToObjects(ramlObj);

  // We want to expand inherited root types, so that later on when we copy type properties
  // into an object,
  // we get the full graph.
  // Delete the types from the ramlObj so it's not processed again later on.
  const types = makeExamplesAndTypesConsistent(_expandRootTypes(ramlObj.types));
  delete ramlObj.types;

  // Recursibely go over the entire object and make all examples and types consistent.
  ramlObj = makeExamplesAndTypesConsistent(ramlObj, types);

  // Other structures (like `responses`) are an object that hold other wrapped objects.
  // Flatten this to simple (non-wrapped) objects in an array instead,
  // this makes it easy to loop over them in raml2html / raml2md.
  //
  // EXAMPLE of these structures:
  // {
  //   foo: {
  //     name: "foo!"
  //   },
  //   bar: {
  //     name: "bar"
  //   }
  // }
  //
  // EXAMPLE of what we want:
  // [ { name: "foo!", key: "foo" }, { name: "bar", key: "bar" } ]
  ramlObj = recursiveObjectToArray(ramlObj);

  // Now add all the properties and things that we need for raml2html,
  // stuff like the uniqueId, parentUrl,
  // and allUriParameters.
  ramlObj = _addRaml2htmlProperties(ramlObj);

  if (types) {
    ramlObj.types = types;
  }

  return ramlObj;
}
module.exports.parse = function(source) {
  return _enhanceRamlObj(source);
};

},{"./arrays-objects-helpers":1,"./consistency-helpers":3}]},{},[2]);
