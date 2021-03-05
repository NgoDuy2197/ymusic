// Require the package
var Crawler = require("crawler");
const axios = require('axios').default;
const cheerio = require('cheerio');
// const youtubeStream = require('youtube-audio-stream')
//
const fs = require('fs');
const ytdl = require('ytdl-core')
const yts = require('yt-search')
//
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const crawlHtml = (url = "", sTag = "") => {
    return new Promise((resolve, reject) => {
        try {
            var c = new Crawler({
                maxConnections: 5,
                callback: function (error, res, done) {
                    if (error) {
                        console.log(error);
                    } else {
                        var $ = res.$;
                        let htmlContent = []
                        sTag = sTag.split("-")
                        for (let tag of sTag) {
                            const cherioData = $(tag)
                            for (let i = 0; i < cherioData.length; i++) {
                                const item = cherioData[i]
                                htmlContent.push({
                                    attr: item.attribs
                                })
                            }
                        }
                        resolve(htmlContent)
                    }
                    done();
                }
            });
            c.queue(url)
        } catch (error) {
            console.log("ERROR crawler")
            reject(error)
        }
    })
}
const callAxios = (url = "") => {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(function (response) {
                resolve(response)
            })
            .catch(function (error) {
                console.log("ERROR Axios")
                reject(error)
            })
    })
}
const callCheerio = async (url = "", sign = "") => {
    const page = await callAxios(url)
    const $ = cheerio.load(page.data);
    return $(sign).html()
}
app.post('/news', async (req, res, next) => {
    // Execute within an async function, pass a config object (further documentation below)
    try {
        const body = req.body,
        url = body.url,
        tag = body.tag
        let html = await callCheerio(url, tag)
        res.json(html)
    } catch (error) {
        next(error)
    }
})

app.get('/video/:videoId/:audioOnly/:videoQuality', async (req, res, next) => {
    try {
        const params = req.params,
            videoId = params.videoId,
            audioOnly = params.audioOnly
        let videoQuality = params.videoQuality || 'lowest',
            contentType = "video/mp4"
        if (audioOnly == "audioonly") {
            videoQuality = 'lowest'
            contentType = "audio/mpeg"
        } else {
            // videoQuality = params.videoQuality || 'lowest'
            videoQuality = "18"
            contentType = "video/mp4"
        }
        let info = await ytdl.getInfo(videoId, {
            dlChunkSize: 0
        })
        let formats = info.formats
        const range = req.headers.range
        let start, end
        //INIT
        let formatFound = ytdl.filterFormats(formats, audioOnly);
        let vformat
        try {
            vformat = ytdl.chooseFormat(formatFound, {
                quality: videoQuality
            });
        } catch (error) {
            vformat = ytdl.chooseFormat(formatFound, {
                quality: "lowest"
            });
        }
        let fileSize = parseInt(vformat.contentLength) || 1

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            start = parseInt(parts[0] || 0, 10)
            end = parts[1] ?
                parseInt(parts[1], 10) :
                fileSize - 1

            // 'Content-Range': `bytes ${0}-${end}/${fileSize}`,
            const chunksize = (end - start) + 1
            const head = {
                'Content-Range': `bytes ${0}-${start}/${end}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': fileSize,
                'Content-Type': contentType,
            }
            res.writeHead(206, head)
            ytdl.downloadFromInfo(info, {
                format: vformat
            }).pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': contentType,
            }
            res.writeHead(200, head)
            ytdl.downloadFromInfo(info, {
                format: vformat
            }).pipe(res)
        }
    } catch (error) {
        next(error)
    }
})

app.get('/search', async (req, res, next) => {
    try {
        let query = req.query,
            sText = query.sText
        const r = await yts(sText)
        const result = r.videos
        res.json(result)
    } catch (error) {
        next(error)
    }
})

app.get('/info/:videoId', async (req, res, next) => {
    try {
        const params = req.params,
            videoId = params.videoId
        let info = await ytdl.getBasicInfo(videoId),
            relatedVideos = []
        for (let e of info.related_videos) {
            e.videoId = e.id
            e.thumbnail = e.thumbnails[0].url.split("?")[0]
            relatedVideos.push(e)
        }
        info.related_videos = relatedVideos
        res.json(info)
    } catch (error) {
        next(error)
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})