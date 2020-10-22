"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// This file is part of browserify-helpers
// Copyright (C) 2018-present Dario Giovannetti <dev@dariogiovannetti.net>
// Licensed under MIT
// https://github.com/kynikos/browserify-helpers/blob/master/LICENSE
require('@babel/polyfill');

var fs = require('fs');

var _require = require('stream'),
    Readable = _require.Readable;

var browserify = require('browserify');

var babelify = require('babelify');

var babelPlugins = [];
/* eslint-disable global-require */

try {
  babelPlugins.push(require('@babel/plugin-proposal-object-rest-spread'));
} catch (error) {}

try {
  babelPlugins.push(require('@babel/plugin-proposal-class-properties'));
} catch (error1) {}

try {
  babelPlugins.push([require('@babel/plugin-proposal-decorators'), {
    decoratorsBeforeExport: true
  }]);
} catch (error2) {}

var coffeeify_;

try {
  coffeeify_ = require('coffeeify');
} catch (error3) {}

var envify_;

try {
  envify_ = require('envify/custom');
} catch (error4) {}

var cssify_;

try {
  cssify_ = require('cssify');
} catch (error5) {} // Sassify vs. scssify: try both, for example sassify seems to have problem with
// escaped characters such as "\e604" (it drops the backslash)


var sassify_;

try {
  sassify_ = require('sassify');
} catch (error6) {}

var scssify_;

try {
  scssify_ = require('scssify');
} catch (error7) {}

var lessify_;

try {
  lessify_ = require('lessify');
} catch (error8) {}

var licensify_;

try {
  licensify_ = require('licensify');
} catch (error9) {}

var Terser;

try {
  Terser = require('terser');
} catch (error10) {}
/* eslint-enable global-require */


function compress_(instream, _ref) {
  var _ref$keep_fnames = _ref.keep_fnames,
      keep_fnames = _ref$keep_fnames === void 0 ? false : _ref$keep_fnames;
  var jscode = '';
  var outstream = new Readable();
  instream.on('readable', function () {
    var buffer = instream.read();

    if (buffer) {
      jscode += buffer.toString();
    }
  });
  var compressing = new Promise(function (resolve, reject) {
    instream.on('end', function () {
      // NOTE: Also Terser's 'preamble' option is interesting
      var minjs = Terser.minify(jscode, {
        output: {
          comments: 'some'
        },
        keep_fnames: keep_fnames
      });

      if (minjs.error) {
        // Simply rejecting minjs.error would only show its message and
        // not the rest of the metadata
        console.error(minjs.error);
        return reject(minjs.error);
      }

      outstream.push(minjs.code); // https://stackoverflow.com/a/22085851

      outstream.push(null);
      return resolve(outstream);
    });
    return instream.on('error', function (error) {
      return reject(error);
    });
  });
  return compressing;
}

module.exports.jspack = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(entry, bundlepath, _ref2) {
    var _ref2$require, require, _ref2$external, external, _ref2$extensions, extensions, _ref2$babelConf, babelConf, _ref2$coffeeify, coffeeify, _ref2$envify, envify, _ref2$cssify, cssify, _ref2$sassify, sassify, _ref2$scssify, scssify, _ref2$lessify, lessify, _ref2$debug, debug, _ref2$licensify, licensify, _ref2$compress, compress, bfy, _iterator, _step, extfile, jsstream, outstream;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _ref2$require = _ref2.require, require = _ref2$require === void 0 ? null : _ref2$require, _ref2$external = _ref2.external, external = _ref2$external === void 0 ? [] : _ref2$external, _ref2$extensions = _ref2.extensions, extensions = _ref2$extensions === void 0 ? ['.js', '.coffee'] : _ref2$extensions, _ref2$babelConf = _ref2.babelConf, babelConf = _ref2$babelConf === void 0 ? {} : _ref2$babelConf, _ref2$coffeeify = _ref2.coffeeify, coffeeify = _ref2$coffeeify === void 0 ? false : _ref2$coffeeify, _ref2$envify = _ref2.envify, envify = _ref2$envify === void 0 ? false : _ref2$envify, _ref2$cssify = _ref2.cssify, cssify = _ref2$cssify === void 0 ? false : _ref2$cssify, _ref2$sassify = _ref2.sassify, sassify = _ref2$sassify === void 0 ? false : _ref2$sassify, _ref2$scssify = _ref2.scssify, scssify = _ref2$scssify === void 0 ? false : _ref2$scssify, _ref2$lessify = _ref2.lessify, lessify = _ref2$lessify === void 0 ? false : _ref2$lessify, _ref2$debug = _ref2.debug, debug = _ref2$debug === void 0 ? false : _ref2$debug, _ref2$licensify = _ref2.licensify, licensify = _ref2$licensify === void 0 ? false : _ref2$licensify, _ref2$compress = _ref2.compress, compress = _ref2$compress === void 0 ? false : _ref2$compress;
            bfy = browserify(entry, {
              extensions: extensions,
              debug: debug
            });

            if (require) {
              bfy.require(require);
            }

            _iterator = _createForOfIteratorHelper(external);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                extfile = _step.value;
                bfy.external(extfile);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            if (!coffeeify) {
              _context.next = 9;
              break;
            }

            if (coffeeify_) {
              _context.next = 8;
              break;
            }

            throw new Error("'coffeeify' is not installed");

          case 8:
            bfy.transform(coffeeify_);

          case 9:
            if (!envify) {
              _context.next = 13;
              break;
            }

            if (envify_) {
              _context.next = 12;
              break;
            }

            throw new Error("'envify' is not installed");

          case 12:
            bfy.transform(envify_(envify), {
              global: true
            });

          case 13:
            if (!cssify) {
              _context.next = 17;
              break;
            }

            if (cssify_) {
              _context.next = 16;
              break;
            }

            throw new Error("'cssify' is not installed");

          case 16:
            bfy.transform(cssify_, {
              global: true
            });

          case 17:
            if (!sassify) {
              _context.next = 21;
              break;
            }

            if (sassify_) {
              _context.next = 20;
              break;
            }

            throw new Error("'sassify' is not installed");

          case 20:
            bfy.transform(sassify_, {
              global: true
            });

          case 21:
            if (!scssify) {
              _context.next = 25;
              break;
            }

            if (scssify_) {
              _context.next = 24;
              break;
            }

            throw new Error("'scssify' is not installed");

          case 24:
            bfy.transform(scssify_, {
              global: true
            });

          case 25:
            if (!lessify) {
              _context.next = 29;
              break;
            }

            if (lessify_) {
              _context.next = 28;
              break;
            }

            throw new Error("'lessify' is not installed");

          case 28:
            bfy.transform(lessify_, {
              global: true
            });

          case 29:
            if (!licensify) {
              _context.next = 33;
              break;
            }

            if (licensify_) {
              _context.next = 32;
              break;
            }

            throw new Error("'licensify' is not installed");

          case 32:
            bfy.plugin(licensify_);

          case 33:
            bfy.transform(babelify, _objectSpread({
              presets: ['@babel/preset-env'],
              // Yes, it is needed to repeat the 'extensions' option here
              extensions: extensions,
              plugins: babelPlugins,
              comments: false,
              compact: false
            }, babelConf));
            jsstream = bfy.bundle();

            if (!compress) {
              _context.next = 41;
              break;
            }

            if (Terser) {
              _context.next = 38;
              break;
            }

            throw new Error("'terser' is not installed");

          case 38:
            _context.next = 40;
            return compress_(jsstream, compress);

          case 40:
            jsstream = _context.sent;

          case 41:
            outstream = jsstream.pipe(fs.createWriteStream(bundlepath));
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              outstream.on('close', function () {
                return resolve(outstream);
              });
              return outstream.on('error', function (error) {
                return reject(error);
              });
            }));

          case 43:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();
