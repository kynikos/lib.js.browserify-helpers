# Browserify Helpers
# Copyright (C) 2018 Dario Giovannetti <dev@dariogiovannetti.net>
#
# This file is part of Browserify Helpers.
#
# Browserify Helpers is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Browserify Helpers is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Browserify Helpers.  If not, see <http://www.gnu.org/licenses/>.

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

    jsstream = bfy.transform(coffeeify).transform(babelify, {
        presets: ["env"]
        # Yes, it is needed to repeat the 'extensions' option here
        extensions: [".coffee"]
        comments: false
        compact: false
    }).bundle()

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
