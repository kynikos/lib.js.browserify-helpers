"use strict";

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

var uglifyjs;

try {
  uglifyjs = require('uglify-js');
} catch (error10) {}
/* eslint-enable global-require */


var uglify_ = function uglify_(instream, _ref) {
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
  var uglifying = new Promise(function (resolve, reject) {
    instream.on('end', function () {
      // A way to see all available options is https://skalman.github.io/UglifyJS-online/
      // NOTE: Also Uglify's 'preamble' option is interesting
      var minjs = uglifyjs.minify(jscode, {
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
  return uglifying;
};

module.exports.jspack =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(entry, bundlepath, _ref2) {
    var _ref2$require, require, _ref2$external, external, _ref2$coffeeify, coffeeify, _ref2$envify, envify, _ref2$cssify, cssify, _ref2$sassify, sassify, _ref2$scssify, scssify, _ref2$lessify, lessify, _ref2$debug, debug, _ref2$licensify, licensify, _ref2$uglify, uglify, bfy, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, extfile, jsstream, outstream;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _ref2$require = _ref2.require, require = _ref2$require === void 0 ? null : _ref2$require, _ref2$external = _ref2.external, external = _ref2$external === void 0 ? [] : _ref2$external, _ref2$coffeeify = _ref2.coffeeify, coffeeify = _ref2$coffeeify === void 0 ? false : _ref2$coffeeify, _ref2$envify = _ref2.envify, envify = _ref2$envify === void 0 ? false : _ref2$envify, _ref2$cssify = _ref2.cssify, cssify = _ref2$cssify === void 0 ? false : _ref2$cssify, _ref2$sassify = _ref2.sassify, sassify = _ref2$sassify === void 0 ? false : _ref2$sassify, _ref2$scssify = _ref2.scssify, scssify = _ref2$scssify === void 0 ? false : _ref2$scssify, _ref2$lessify = _ref2.lessify, lessify = _ref2$lessify === void 0 ? false : _ref2$lessify, _ref2$debug = _ref2.debug, debug = _ref2$debug === void 0 ? false : _ref2$debug, _ref2$licensify = _ref2.licensify, licensify = _ref2$licensify === void 0 ? false : _ref2$licensify, _ref2$uglify = _ref2.uglify, uglify = _ref2$uglify === void 0 ? false : _ref2$uglify;
            bfy = browserify(entry, {
              extensions: ['.js', '.coffee'],
              debug: debug
            });

            if (require) {
              bfy.require(require);
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 6;

            for (_iterator = external[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              extfile = _step.value;
              bfy.external(extfile);
            }

            _context.next = 14;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](6);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 14:
            _context.prev = 14;
            _context.prev = 15;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 17:
            _context.prev = 17;

            if (!_didIteratorError) {
              _context.next = 20;
              break;
            }

            throw _iteratorError;

          case 20:
            return _context.finish(17);

          case 21:
            return _context.finish(14);

          case 22:
            if (!coffeeify) {
              _context.next = 26;
              break;
            }

            if (coffeeify_) {
              _context.next = 25;
              break;
            }

            throw new Error("'coffeeify' is not installed");

          case 25:
            bfy.transform(coffeeify_);

          case 26:
            if (!envify) {
              _context.next = 30;
              break;
            }

            if (envify_) {
              _context.next = 29;
              break;
            }

            throw new Error("'envify' is not installed");

          case 29:
            bfy.transform(envify_(envify), {
              global: true
            });

          case 30:
            if (!cssify) {
              _context.next = 34;
              break;
            }

            if (cssify_) {
              _context.next = 33;
              break;
            }

            throw new Error("'cssify' is not installed");

          case 33:
            bfy.transform(cssify_, {
              global: true
            });

          case 34:
            if (!sassify) {
              _context.next = 38;
              break;
            }

            if (sassify_) {
              _context.next = 37;
              break;
            }

            throw new Error("'sassify' is not installed");

          case 37:
            bfy.transform(sassify_, {
              global: true
            });

          case 38:
            if (!scssify) {
              _context.next = 42;
              break;
            }

            if (scssify_) {
              _context.next = 41;
              break;
            }

            throw new Error("'scssify' is not installed");

          case 41:
            bfy.transform(scssify_, {
              global: true
            });

          case 42:
            if (!lessify) {
              _context.next = 46;
              break;
            }

            if (lessify_) {
              _context.next = 45;
              break;
            }

            throw new Error("'lessify' is not installed");

          case 45:
            bfy.transform(lessify_, {
              global: true
            });

          case 46:
            if (!licensify) {
              _context.next = 50;
              break;
            }

            if (licensify_) {
              _context.next = 49;
              break;
            }

            throw new Error("'licensify' is not installed");

          case 49:
            bfy.plugin(licensify_);

          case 50:
            bfy.transform(babelify, {
              presets: ['@babel/preset-env'],
              // Yes, it is needed to repeat the 'extensions' option here
              extensions: ['.js', '.coffee'],
              plugins: babelPlugins,
              comments: false,
              compact: false
            });
            jsstream = bfy.bundle();

            if (!uglify) {
              _context.next = 58;
              break;
            }

            if (uglifyjs) {
              _context.next = 55;
              break;
            }

            throw new Error("'uglify-js' is not installed");

          case 55:
            _context.next = 57;
            return uglify_(jsstream, uglify);

          case 57:
            jsstream = _context.sent;

          case 58:
            outstream = jsstream.pipe(fs.createWriteStream(bundlepath));
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              outstream.on('close', function () {
                return resolve(outstream);
              });
              return outstream.on('error', function (error) {
                return reject(error);
              });
            }));

          case 60:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[6, 10, 14, 22], [15,, 17, 21]]);
  }));

  return function (_x, _x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();
