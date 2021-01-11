// const youtubeStream = require('youtube-audio-stream')
//
const fs = require('fs');
const ytdl = require('ytdl-core')
const yts = require('yt-search')
//
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendfile('public/index.html')
})

app.get('/video/:videoId/:audioOnly/:videoQuality', async (req, res, next) => {
    try {
        const params = req.params,
            videoId = params.videoId,
            audioOnly = params.audioOnly,
            videoQuality = params.videoQuality || 'lowestvideo'
        let info = await ytdl.getInfo(videoId, {
            dlChunkSize: 0
        })
        let formats = info.formats
        const range = req.headers.range
        let start, end
        //INIT
        let formatFound = ytdl.filterFormats(formats, audioOnly);
        let vformat = ytdl.chooseFormat(formatFound, {
            quality: videoQuality
        });
        let fileSize = vformat.contentLength

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            start = parseInt(parts[0], 10)
            end = parts[1] ?
                parseInt(parts[1], 10) :
                fileSize - 1

            const chunksize = (end - start) + 1
            const head = {
                'Content-Range': `bytes ${0}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head)
            ytdl.downloadFromInfo(info, {
                format: vformat
            }).pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            ytdl.downloadFromInfo(info).pipe(res)
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
            e.thumbnail = e.thumbnails[0].url
            relatedVideos.push(e)
        }
        const result = relatedVideos
        res.json(result)
    } catch (error) {
        next(error)
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})