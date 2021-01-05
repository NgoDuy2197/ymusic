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

app.get('/video/:videoId', async(req, res, next) => {
    try {
        const params = req.params,videoId = params.videoId
        let info = await ytdl.getInfo(videoId, { quality: 'lowestvideo'})
        let vFormats = info.formats
        // fs.createWriteStream('s_high.mp4')
        let fileSize = info.player_response.streamingData.formats[0].contentLength
    const range = req.headers.range
    let start, end
    // ytdl.downloadFromInfo(info).pipe(fs.createWriteStream('s_high.mp4'))

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        start = parseInt(parts[0], 10)
        end = parts[1] ?
            parseInt(parts[1], 10) :
            fileSize - 1

        const chunksize = (end - start) + 1
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head)
        ytdl.downloadFromInfo(info).pipe(res)
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

app.get('/search', async(req, res, next) => {
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

app.get('/info/:videoId', async(req, res, next) => {
    try {
        const params = req.params,
            videoId = params.videoId
        let info = await ytdl.getInfo(videoId, { quality: 'lowestvideo'}),
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
