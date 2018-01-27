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
    sassify_ = require('sassify')
catch error
    sassify_ = null
try
    lessify_ = require('lessify')
catch error
    lessify_ = null


uglify = (instream) ->
    jscode = ""
    outstream = new Readable()
    instream.on('readable', ->
        buffer = instream.read()
        if buffer
            jscode += buffer.toString()
    )
    uglifying = new Promise((resolve, reject) ->
        instream.on('end', ->
            minjs = uglifyjs.minify(jscode)
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
    sassify = false
    lessify = false
    debug = false
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

    if sassify
        if not sassify_
            throw new Error("'sassify' is not installed")
        bfy.transform(sassify_, {global: true})

    if lessify
        if not lessify_
            throw new Error("'lessify' is not installed")
        bfy.transform(lessify_, {global: true})

    bfy.transform(babelify, {
        presets: ["env"]
        # Yes, it is needed to repeat the 'extensions' option here
        extensions: [".coffee"]
        comments: false
        compact: false
    })

    jsstream = bfy.bundle()

    if not debug
        jsstream = await uglify(jsstream)

    outstream = jsstream.pipe(fs.createWriteStream(bundlepath))

    return new Promise((resolve, reject) ->
        outstream.on('close', ->
            resolve(outstream)
        )
        outstream.on('error', (error) ->
            reject(error)
        )
    )
