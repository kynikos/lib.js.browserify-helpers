# This file is part of browserify-helpers
# Copyright (C) 2018-present Dario Giovannetti <dev@dariogiovannetti.net>
# Licensed under MIT
# https://github.com/kynikos/browserify-helpers/blob/master/LICENSE

fs = require('fs')
{Readable} = require('stream')
browserify = require('browserify')
coffeeify = require('coffeeify')
babelify = require("babelify")
uglifyjs = require("uglify-js")


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

    jsstream = bfy
        .transform(coffeeify)
        .transform(babelify, {
            presets: ["env"]
            # Yes, it is needed to repeat the 'extensions' option here
            extensions: [".coffee"]
            comments: false
            compact: false
        })
        .bundle()

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
