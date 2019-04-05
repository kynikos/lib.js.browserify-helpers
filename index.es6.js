// This file is part of browserify-helpers
// Copyright (C) 2018-present Dario Giovannetti <dev@dariogiovannetti.net>
// Licensed under MIT
// https://github.com/kynikos/browserify-helpers/blob/master/LICENSE

require('@babel/polyfill')
const fs = require('fs')
const {Readable} = require('stream')
const browserify = require('browserify')
const babelify = require('babelify')
const babelPlugins = []

/* eslint-disable global-require */
try {
  babelPlugins.push(require('@babel/plugin-proposal-object-rest-spread'))
} catch (error) {}

try {
  babelPlugins.push(require('@babel/plugin-proposal-class-properties'))
} catch (error1) {}

try {
  babelPlugins.push([
    require('@babel/plugin-proposal-decorators'),
    {decoratorsBeforeExport: true},
  ])
} catch (error2) {}

let coffeeify_
try {
  coffeeify_ = require('coffeeify')
} catch (error3) {}

let envify_
try {
  envify_ = require('envify/custom')
} catch (error4) {}

let cssify_
try {
  cssify_ = require('cssify')
} catch (error5) {}

// Sassify vs. scssify: try both, for example sassify seems to have problem with
// escaped characters such as "\e604" (it drops the backslash)

let sassify_
try {
  sassify_ = require('sassify')
} catch (error6) {}

let scssify_
try {
  scssify_ = require('scssify')
} catch (error7) {}

let lessify_
try {
  lessify_ = require('lessify')
} catch (error8) {}

let licensify_
try {
  licensify_ = require('licensify')
} catch (error9) {}

let Terser
try {
  Terser = require('terser')
} catch (error10) {}
/* eslint-enable global-require */


function compress_(instream, {keep_fnames = false}) {
  let jscode = ''
  const outstream = new Readable()
  instream.on('readable', () => {
    const buffer = instream.read()
    if (buffer) {
      jscode += buffer.toString()
    }
  })
  const compressing = new Promise((resolve, reject) => {
    instream.on('end', () => {
      // NOTE: Also Terser's 'preamble' option is interesting
      const minjs = Terser.minify(jscode, {
        output: {comments: 'some'},
        keep_fnames,
      })

      if (minjs.error) {
        // Simply rejecting minjs.error would only show its message and
        // not the rest of the metadata
        console.error(minjs.error)
        return reject(minjs.error)
      }

      outstream.push(minjs.code)
      // https://stackoverflow.com/a/22085851
      outstream.push(null)
      return resolve(outstream)
    })
    return instream.on('error', (error) => reject(error))
  })
  return compressing
}


module.exports.jspack = async function (entry, bundlepath, { // eslint-disable-line complexity
  require = null,
  external = [],
  coffeeify = false,
  // Note how 'envify' is then used to configure 'envify_'
  envify = false,
  cssify = false,
  sassify = false,
  scssify = false,
  lessify = false,
  debug = false,
  licensify = false,
  // Note how 'compress' is then used to configure 'compress_'
  compress = false,
}) {
  const bfy = browserify(entry, {
    extensions: ['.js', '.coffee'],
    debug,
  })

  if (require) {
    bfy.require(require)
  }

  for (const extfile of external) {
    bfy.external(extfile)
  }

  if (coffeeify) {
    if (!coffeeify_) {
      throw new Error("'coffeeify' is not installed")
    }
    bfy.transform(coffeeify_)
  }

  if (envify) {
    if (!envify_) {
      throw new Error("'envify' is not installed")
    }
    bfy.transform(envify_(envify), {global: true})
  }

  if (cssify) {
    if (!cssify_) {
      throw new Error("'cssify' is not installed")
    }
    bfy.transform(cssify_, {global: true})
  }

  if (sassify) {
    if (!sassify_) {
      throw new Error("'sassify' is not installed")
    }
    bfy.transform(sassify_, {global: true})
  }

  if (scssify) {
    if (!scssify_) {
      throw new Error("'scssify' is not installed")
    }
    bfy.transform(scssify_, {global: true})
  }

  if (lessify) {
    if (!lessify_) {
      throw new Error("'lessify' is not installed")
    }
    bfy.transform(lessify_, {global: true})
  }

  if (licensify) {
    if (!licensify_) {
      throw new Error("'licensify' is not installed")
    }
    bfy.plugin(licensify_)
  }

  bfy.transform(babelify, {
    presets: ['@babel/preset-env'],
    // Yes, it is needed to repeat the 'extensions' option here
    extensions: ['.js', '.coffee'],
    plugins: babelPlugins,
    comments: false,
    compact: false,
  })

  let jsstream = bfy.bundle()

  if (compress) {
    if (!Terser) {
      throw new Error("'terser' is not installed")
    }
    jsstream = await compress_(jsstream, compress)
  }

  const outstream = jsstream.pipe(fs.createWriteStream(bundlepath))

  return new Promise((resolve, reject) => {
    outstream.on('close', () => resolve(outstream))
    return outstream.on('error', (error) => reject(error))
  })
}
