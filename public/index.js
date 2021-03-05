try {
    var $ = jQuery.noConflict();
    var elem = document.documentElement;
    var video = document.getElementById("myVideo");
    var btn = document.getElementById("btnPlayBig");
    var btnToggleMenu = $("#btnToggleMenu")
    var btnPlayBig = $("#btnPlayBig")
    var btnPlaySmall = $("#btnPlaySmall")
    var btnBlur = $("#btnBlur")
    var rangeVideo = $("#rangeVideo")
    var rangeVideoLabel = $("#rangeVideoLabel")
    var myVideo = $("#myVideo")
    var myMenu = $("#myMenu")
    var infoAreaBig = $("#infoAreaBig")
    var infoAreaSmall = $("#infoAreaSmall")
    var contentRight = $("#contentRight")
    var btnToggleRotate = $(".btnToggleRotate")
    var divVideo = $(".divVideo")
    var sVideoName = $("#sVideoName")
    var settingBigPanel = $("#settingBigPanel")
    var settingSmallPanel = $("#settingSmallPanel")
    var adsAndNews = $("#adsAndNews")

    // CONST VAR
    var storage_videoCurrentTime = "videoCurrentTime"
    var storage_setting = "setting"

    // VAR LOCAL
    var creator = "https://www.facebook.com/duynq2197"
    var currentLi
    var nextSongId = ""
    var listAutocomplete = []
    var previousSongId = []
    var btnActionPause = false
    var videoIsDacing
    let intervalCountCurrTime
    var videoSize = 0
    var videoQuality = 'lowest'
    var playStyle = 'audioandvideo'
    var arrResolution = ['lowest', '135', '136', '137', 'highest']
    var loadingTag = "<span class='mdi mdi-spin mdi-sync'/>"
    var thisVideoIsFullLoading = false


    // STORAGE KEY
    var storageAutoComplete = "autocomplete"
    video.onended = function (e) {
        playVideo(myMenu.children()[Math.round(Math.random() * 5)])
        togglePlay()
    };
    video.onloadeddata = function (e) {
        rangeVideo.val(video.currentTime)
        rangeVideo.attr('max', video.duration)
    }
    video.onpause = function (e) {
        // if (btnActionPause) btnActionPause = false
        // else playVideo(getRandomVideo(10))
    }
    video.onplaying = function (e) {
        toggleCountCurrentTime()
        btnPlayBig.removeClass("mdi-play-circle-outline")
        btnPlayBig.addClass("mdi-pause-circle-outline")
        btnPlaySmall.removeClass("mdi-play-circle-outline")
        btnPlaySmall.addClass("mdi-pause-circle-outline")
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Title',
                artist: 'Artist',
                album: 'Album',
                artwork: [{
                    src: 'https://static.centro.org.uk/img/wmca/favicons/android-chrome-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                }, ]
            });
        }
    };
    // INIT FUNCTION
    function removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function getAutoCompleteArr() {
        return JSON.parse(storageGet(storageAutoComplete) || "[]")
    }

    function storagePut(key, value) {
        try {
            localStorage.setItem(key, value)
        } catch (error) {
            console.log("Storage put error:",error)
        }
    }

    function storageGet(key) {
        var res = ""
        try {
            res = localStorage.getItem(key)
        } catch (error) {
            console.log("Storage get error:",error)
        }
        return res
    }

    function saveSessionData(e) {
        storagePut(storage_videoCurrentTime, video.currentTime)
    }

    function getStorageSetting() {
        var raw = storageGet(storage_setting) || "{}"
        var json = JSON.parse(raw)
        return json
    }

    function saveStorageSetting(key, value) {
        var setting = getStorageSetting()
        setting[key] = value
        storagePut(storage_setting, JSON.stringify(setting))
    }
    //
    window.onbeforeunload = saveSessionData;
    sVideoName.on('keypress', function (e) {
        if (e.which == 13) {
            searchVideo()
        } else {
            sVideoName.autocomplete({
                source: getAutoCompleteArr()
            })
        }
    });

    function togglePlay() {
        if (video.paused) {
            btnPlayBig.removeClass("mdi-play-circle-outline")
            btnPlayBig.addClass("mdi-pause-circle-outline")
        } else {
            btnActionPause = true
            btnPlayBig.removeClass("mdi-pause-circle-outline")
            btnPlayBig.addClass("mdi-play-circle-outline")
        }
    }

    function getRandomVideo(iint) {
        return myMenu.children()[Math.round(Math.random() * iint)]
    }

    function playMusic(item) {
        var btn = $(`#${item.id}`)
        if (video.paused) {
            video.play()
            btn.removeClass("mdi-play-circle-outline")
            btn.addClass("mdi-pause-circle-outline")
        } else {
            btnActionPause = true
            video.pause();
            btn.removeClass("mdi-pause-circle-outline")
            btn.addClass("mdi-play-circle-outline")
        }
    }

    function nextMusic() {
        playVideo(nextSongId)
    }

    function previousMusic() {
        playVideo(previousSongId.pop() || getRandomVideo(5))
        previousSongId.pop()
    }

    function openVideoFullscreen() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            /* Safari */
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            /* IE11 */
            video.msRequestFullscreen();
        }
    }

    function refreshListVideos(data) {
        myMenu.empty()
        var isRotated = contentRight.hasClass("rotate-right-90-no-scale") && "rotate-right-90-scale" || ""
        for (let i of data) {
            myMenu.append(`<li id='${i.videoId}' data-title='${i.title}' data-description='${i.description || ""}' data-authorname='${i.author.name}' onClick="playVideo(this)"><div class="img-container evideo ${isRotated}"><img class="thumbnail" src="${i.thumbnail}"/><div class="title-thumbnail img-text-centered">${i.title.substring(0,20)}</div></div></li>`);
        }
        nextSongId = myMenu.children()[0]
        myMenu.scrollTop(0)
    }

    function pushStoreAutoComplete(text) {
        rsText = removeAccents(text)
        let arrAutoComplete = getAutoCompleteArr()
        if (arrAutoComplete.length > 19) arrAutoComplete = arrAutoComplete.slice(1)
        if (!arrAutoComplete.some(e => e.includes(rsText))) arrAutoComplete.push(rsText)
        storagePut(storageAutoComplete, JSON.stringify(arrAutoComplete))
    }

    function searchVideo(sText) {
        if (!sText) sText = sVideoName.val()
        pushStoreAutoComplete(sText)
        myMenu.empty()
        $.get("./search", {
            sText
        }, function (data) {
            refreshListVideos(data)
        })

    }

    function stopAndClear() {
        window.stop()
        URL.revokeObjectURL(video.src)
        thisVideoIsFullLoading = false
    }

    function playVideo(li) {
        // STOP and Clear Cache
        stopAndClear()
        //
        let infoSongName = $("#infoSongName")
        if (previousSongId.length < 10) previousSongId.push(currentLi)
        currentLi = li
        window.history.replaceState(null, "", `/?v=${li.id}`);
        let isnHTML = `<a class="title-link" target="_blank" href="https://www.youtube.com/watch?v=${li.id}">${li.dataset.title}</a>`
        infoSongName.html(`${loadingTag}${isnHTML}`)
        infoSongName.addClass("loading")
        $("#infoDescribe").html(li.dataset.description)
        $("#infoAuthorName").html(li.dataset.authorname)
        storagePut("videoPlaying", JSON.stringify({
            id: li.id,
            title: li.dataset.title,
            description: li.dataset.description,
            authorname: li.dataset.authorname
        }))

        video.src = `./video/${li.id}/${playStyle}/${videoQuality}`

        // myVideo.find("source").attr("src", `./video/${li.id}/${playStyle}/${videoQuality}`)
        // video.load()
        // video.play()
        // TEST 
        if (!thisVideoIsFullLoading) {
            thisVideoIsFullLoading = true
            var req = new XMLHttpRequest()
            req.open('GET', `./video/${li.id}/${playStyle}/${videoQuality}`, true)
            req.responseType = 'blob'
            req.onload = function () {
                if (this.status === 200) {
                    var videoBlob = this.response
                    var vid = URL.createObjectURL(videoBlob),
                        currentTimePlay = video.currentTime
                    video.src = vid
                    video.currentTime = currentTimePlay
                    infoSongName.html(`${isnHTML}`)
                    infoSongName.removeClass("loading")
                    thisVideoIsFullLoading = false
                }
            }
            req.onerror = function () {
                console.error("ERROR")
            }
            req.send()
        } else {
            infoSongName.text(`${li.dataset.title}`)
            infoSongName.removeClass("loading")
        }
        // TEST+ END

        $.get(`./info/${li.id}`, function (info) {
            let des = info.videoDetails.description || ""
            var headDes = des.slice(0, 100)
            var lastDes = des.slice(100)
            $("#infoDescribe").html(`${headDes}<span class="more-content">${lastDes}</span><span id="btnMoreDesText" onclick="toggleReadtxt()" class="btn-moredestext"> (Đọc thêm...)</span>`)
            $("#infoAuthorName").html(info.videoDetails.author.name)
            if (!li.dataset.title) infoSongName.html(`<a class="title-link" target="_blank" href="https://www.youtube.com/watch?v=${info.videoDetails.videoId}">${info.videoDetails.title}</a>`)
            refreshListVideos(info.related_videos)
        })
    }

    function openAppFullscreen() {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE11 */
            elem.msRequestFullscreen();
        }
    }

    function closeAppFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            /* IE11 */
            document.msExitFullscreen();
        }
    }

    function toggleFullscreen() {
        if ((document.fullscreen) ||
            (window.fullScreen) ||
            (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
            closeAppFullscreen()
        } else {
            openAppFullscreen()
        }
    }

    function videoFullscreen() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    }


    // MENU SLIDE

    function toggleMenu() {
        if ($("#mySidenav").width() > 0) {
            $(".menu").css("background-color", "transparent")
            document.getElementById("myVideo").style.left = "50%";
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("app").style.marginLeft = "0";
            btnToggleMenu.removeClass("mdi mdi-close")
            btnToggleMenu.addClass("mdi mdi-chevron-right")
        } else {
            $(".menu").css("background-color", "#000")
            document.getElementById("myVideo").style.left = "40%";
            document.getElementById("mySidenav").style.width = "210px";
            document.getElementById("app").style.marginLeft = "210px";
            btnToggleMenu.removeClass("mdi mdi-chevron-right")
            btnToggleMenu.addClass("mdi mdi-close")
        }
    }

    function toggleBlur() {
        var btnB = $(`#btnBlurBig`)
        var btnS = $(`#btnBlurSmall`)
        if (btnB.hasClass("mdi-blur")) {
            divVideo.addClass("blur")
            // myVideo.addClass("blur")
            btnB.addClass("mdi-blur-off")
            btnS.addClass("mdi-blur-off")
            btnB.removeClass("mdi-blur")
            btnS.removeClass("mdi-blur")
        } else {
            divVideo.removeClass("blur")
            // myVideo.removeClass("blur")
            btnB.addClass("mdi-blur")
            btnS.addClass("mdi-blur")
            btnB.removeClass("mdi-blur-off")
            btnS.removeClass("mdi-blur-off")
        }
    }

    function changeVideoQuality() {
        var currentQualityIndex = arrResolution.indexOf(videoQuality)
        if (currentQualityIndex == (arrResolution.length - 1)) {
            videoQuality = arrResolution[0]
        } else {
            videoQuality = arrResolution[currentQualityIndex + 1]
        }
        playVideo(currentLi)
    }

    function toggleAudioOnly() {
        var btnB = $(`#btnAudiOnlyBig`)
        var btnS = $(`#btnAudiOnlySmall`)
        if (btnB.hasClass("mdi-monitor-speaker")) {
            saveStorageSetting("audio", 0)
            playStyle = 'audioandvideo'
            btnB.addClass("mdi-speaker")
            btnS.addClass("mdi-speaker")
            btnB.removeClass("mdi-monitor-speaker")
            btnS.removeClass("mdi-monitor-speaker")
            btnB.attr('title', "Chỉ nghe nhạc")
            btnS.attr('title', "Chỉ nghe nhạc")
        } else {
            saveStorageSetting("audio", 1)
            playStyle = 'audioonly'
            btnB.addClass("mdi-monitor-speaker")
            btnS.addClass("mdi-monitor-speaker")
            btnB.removeClass("mdi-speaker")
            btnS.removeClass("mdi-speaker")
            btnB.attr('title', "Video và nhạc")
            btnS.attr('title', "Video và nhạc")
        }
        var videoPlayCurrentTime_ = video.currentTime
        playVideo(currentLi)
        video.currentTime = videoPlayCurrentTime_
    }

    function toggleRotateVideo() {
        btnToggleRotate.toggleClass("mdi-rotate-270")
        infoAreaBig.toggleClass("translateY-25")
        infoAreaSmall.toggleClass("translateY-25")
        divVideo.toggleClass("scale-15")
        $(".evideo").toggleClass("rotate-right-90-scale")
        $(".right").toggleClass("rotate-right-90-no-scale")
        myVideo.toggleClass("margin-left-35px")
    }

    function toggleCountCurrentTime() {
        clearInterval(intervalCountCurrTime)
        intervalCountCurrTime = setInterval(() => {
            let currentTime = video.currentTime || 0,
                duration = video.duration
            if (duration) rangeVideo.val(currentTime)
            if (currentTime > 0) {
                let minT = Math.floor(duration / 60).toString().padStart(2, "0")
                let secT = Math.floor(duration % 60).toString().padStart(2, "0")
                let minC = Math.floor(currentTime / 60).toString().padStart(2, "0")
                let secC = Math.floor(currentTime % 60).toString().padStart(2, "0")
                let total = ""
                if (video.duration != "Infinity") total = ` / ${minT}:${secT}`
                rangeVideoLabel.text(`${minC}:${secC}${total}`)
            }
        }, 1000)
    }

    function toggleControls() {
        if (video.hasAttribute("controls")) {
            video.removeAttribute("controls")
            $("#myVideo").width("100%")
        } else {
            video.setAttribute("controls", "controls")
            $("#myVideo").width("70%")
        }
    }

    function toggleInfo() {
        infoAreaBig.toggle()
        infoAreaSmall.toggle()
        toggleControls()
    }

    function rangeVideoChange(value) {
        video.currentTime = value
    }

    function changeVideoSize() {
        myVideo.width(videoSize < 100 ? `${videoSize+=25}%` : `${videoSize+=-75}%`)
    }

    function openNav() {
        document.getElementById("mySidenav").style.width = "210px";
    }

    function closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    function toggleDancingVideo(view) {
        if ($(view).hasClass("gradient-text")) {
            $(view).removeClass("gradient-text")
            myVideo.toggleClass("transition-5s")
            if (videoIsDacing) clearInterval(videoIsDacing)
        } else {
            $(view).addClass("gradient-text")
            myVideo.toggleClass("transition-5s")
            videoIsDacing = setInterval(() => {
                myVideo.width(`${Math.round(Math.random()*30+70)}%`)
            }, 2000)
        }
    }


    function toggleSetting() {
        $("#btnSettingBig").toggleClass("mdi-cog-outline")
        $("#btnSettingSmall").toggleClass("mdi-cog-outline")
        $("#btnSettingBig").toggleClass("mdi-cog-off-outline")
        $("#btnSettingSmall").toggleClass("mdi-cog-off-outline")
        settingBigPanel.toggleClass("display-block");
        settingSmallPanel.toggleClass("display-block");
    }

    function openAdsAndNews() {
        adsAndNews.show()
    }

    function toggleReadtxt() {
        //var dots = document.getElementById("dots");
        var moreText = $(".more-content")
        var btnMoreDesText = document.getElementById("btnMoreDesText");
        if (moreText.css("display") === "none") {
            //dots.style.display = "inline";
            btnMoreDesText.innerHTML = " (Rút gọn...)";
            moreText.css("display", "inline")
        } else {
            //dots.style.display = "none";
            btnMoreDesText.innerHTML = " (Đọc thêm...)";
            moreText.css("display", "none")
        }
    }

    // PARAMS
    var url_string = location.href
    var url = new URL(url_string)
    var videoParam = url.searchParams.get("v")

    //INIT ()
    try {
        document.getElementById('adsAndNews').style.display = 'block'
        infoAreaSmall.hide()
        toggleMenu()
        var videoPlaying = JSON.parse(storageGet("videoPlaying")) || {},
            sCurrentTime = storageGet(storage_videoCurrentTime) || 0
        sVideoName.autocomplete({
            source: getAutoCompleteArr(),
            select: function (e, ui) {
                searchVideo(ui.item.value)
            }
        })
        delete localStorage[storage_videoCurrentTime]
        playVideo({
            id: videoParam || videoPlaying.id || "cpvzKPgFOmg",
            dataset: {
                title: videoPlaying.title || "Một điều anh ngại nói ra",
                description: videoPlaying.description || `<h4><a class="title-link" target="_blank" href="${creator}">${creator}</a></h4>`,
                authorname: videoPlaying.authorname || "Copyright by duynq2197@gmail.com"
            }
        })
        video.currentTime = sCurrentTime

        // SETTING OLD CONFIG
        var setting = getStorageSetting()
        if (setting.audio) toggleAudioOnly()
        // SETTING OLD CONFIG -- END
    } catch (e) {
        nextMusic()
    }
    try {
        // NEWS RIGHT BAOMOI
        $.post(`./news`, {
            url: "https://baomoi.com/tin-video.epi",
            tag: ".main-col"
        }).then(function (html) {
            $("#divNewsLeft").html(html.replace(/data-src/g, "src").replace(/href="/g, `target="_blank" href="https://baomoi.com`))
        })
        $.post(`./news`, {
            url: "https://baomoi.com",
            tag: ".main-col"
        }).then(function (html) {
            $("#divNewsRight").html(html.replace(/data-src/g, "src").replace(/href="/g, `target="_blank" href="https://baomoi.com`))
        })
    } catch (error) {
        console.error(error)
    }
    setTimeout(() => {
        console.log("HI")
        $(".ads-area").css('background-image', 'url(./ads-background.jpg)')
    }, 100)
} catch (error) {
    alert(error)
}