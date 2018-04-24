# This file is part of browserify-helpers
# Copyright (C) 2018-present Dario Giovannetti <dev@dariogiovannetti.net>
# Licensed under MIT
# https://github.com/kynikos/browserify-helpers/blob/master/LICENSE

require('babel-polyfill')
fs = require('fs')
{Readable} = require('stream')
browserify = require('browserify')
babelify = require('babelify')
babelPlugins = []

try
    babelPlugins.push(require('babel-plugin-transform-object-rest-spread'))
catch

try
    babelPlugins.push(require('babel-plugin-transform-class-properties'))
catch

try
    coffeeify_ = require('coffeeify')
catch

try
    envify_ = require('envify/custom')
catch

try
    sassify_ = require('sassify')
catch

try
    lessify_ = require('lessify')
catch

try
    licensify_ = require('licensify')
catch

try
    uglifyjs = require('uglify-js')
catch


uglify_ = (instream, {keep_fnames = false}) ->
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
                keep_fnames
            })

            if minjs.error
                # Simply rejecting minjs.error would only show its message and
                # not the rest of the metadata
                console.error(minjs.error)
                reject(minjs.error)
                return

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
    coffeeify = false
    # Note how 'envify' is then used to configure 'envify_'
    envify = false
    sassify = false
    lessify = false
    debug = false
    licensify = false
    # Note how 'uglify' is then used to configure 'uglify_'
    uglify = false
}) ->
    bfy = browserify(entry, {
        extensions: ['.js', '.coffee']
        debug: debug
    })

    if require
        bfy.require(require)

    for extfile in external
        bfy.external(extfile)

    if coffeeify
        if not coffeeify_
            throw new Error("'coffeeify' is not installed")
        bfy.transform(coffeeify_)

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
        presets: ['env']
        # Yes, it is needed to repeat the 'extensions' option here
        extensions: ['.js', '.coffee']
        plugins: babelPlugins
        comments: false
        compact: false
    })

    jsstream = bfy.bundle()

    if uglify
        if not uglifyjs
            throw new Error("'uglify-js' is not installed")
        jsstream = await uglify_(jsstream, uglify)

    outstream = jsstream.pipe(fs.createWriteStream(bundlepath))

    return new Promise((resolve, reject) ->
        outstream.on('close', ->
            resolve(outstream)
        )
        outstream.on('error', (error) ->
            reject(error)
        )
    )
