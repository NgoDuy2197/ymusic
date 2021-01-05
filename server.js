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
        const params = req.params,
            videoId = params.videoId
        let info = await ytdl.getInfo(videoId),
            vFormats = info.formats
/*
        let format = ytdl.chooseFormat(info.formats, {
            quality: '136'
        })
        */
        ytdl(videoId).pipe(res)
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
        let info = await ytdl.getInfo(videoId),
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
