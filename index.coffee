# This file is part of browserify-helpers
# Copyright (C) 2018-present Dario Giovannetti <dev@dariogiovannetti.net>
# Licensed under MIT
# https://github.com/kynikos/browserify-helpers/blob/master/LICENSE

require('babel-polyfill')
fs = require('fs')
{Readable} = require('stream')
browserify = require('browserify')
coffeeify = require('coffeeify')
babelify = require("babelify")
uglifyjs = require("uglify-js")
try
    envify_ = require('envify/custom')
catch error
    envify_ = null
try
    sassify_ = require('sassify')
catch error
    sassify_ = null
try
    lessify_ = require('lessify')
catch error
    lessify_ = null
try
    licensify_ = require('licensify')
catch error
    licensify_ = null


uglify = (instream, keep_fnames) ->
    jscode = ""
    outstream = new Readable()
    instream.on('readable', ->
        buffer = instream.read()
        if buffer
            jscode += buffer.toString()
    )
    uglifying = new Promise((resolve, reject) ->
        instream.on('end', ->
            # A way to see all available options is https://skalman.github.io/UglifyJS-online/
            # NOTE: Also Uglify's 'preamble' option is interesting
            minjs = uglifyjs.minify(jscode, {
                output: {comments: 'some'}
                compress: {keep_fnames}
                mangle: {keep_fnames}
            })
            outstream.push(minjs.code)
            # https://stackoverflow.com/a/22085851
            outstream.push(null)
            resolve(outstream)
        )
        instream.on('error', (error) ->
            reject(error)
        )
    )
    return uglifying


module.exports.jspack = (entry, bundlepath, {
    require = null
    external = []
    # Note how 'envify' is then used to configure 'envify_'
    envify = false
    sassify = false
    lessify = false
    debug = false
    uglify_keep_fnames = false
    licensify = false
}) ->
    bfy = browserify(entry, {
        extensions: ['.coffee']
        debug: debug
    })

    if require
        bfy.require(require)

    for extfile in external
        bfy.external(extfile)

    bfy.transform(coffeeify)

    if envify
        if not envify_
            throw new Error("'envify' is not installed")
        bfy.transform(envify_(envify), {global: true})

    if sassify
        if not sassify_
            throw new Error("'sassify' is not installed")
        bfy.transform(sassify_, {global: true})

    if lessify
        if not lessify_
            throw new Error("'lessify' is not installed")
        bfy.transform(lessify_, {global: true})

    if licensify
        if not licensify_
            throw new Error("'licensify' is not installed")
        bfy.plugin(licensify_)

    bfy.transform(babelify, {
        presets: ["env"]
        # Yes, it is needed to repeat the 'extensions' option here
        extensions: [".coffee"]
        comments: false
        compact: false
    })

    jsstream = bfy.bundle()

    if not debug
        jsstream = await uglify(jsstream, uglify_keep_fnames)

    outstream = jsstream.pipe(fs.createWriteStream(bundlepath))

    return new Promise((resolve, reject) ->
        outstream.on('close', ->
            resolve(outstream)
        )
        outstream.on('error', (error) ->
            reject(error)
        )
    )
