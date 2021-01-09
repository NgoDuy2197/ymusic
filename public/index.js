var elem = document.documentElement;
var video = document.getElementById("myVideo");
var btn = document.getElementById("btnPlayBig");
var btnToggleMenu = $("#btnToggleMenu")
var btnPlayBig = $("#btnPlayBig")
var btnPlaySmall = $("#btnPlaySmall")
var btnBlur = $("#btnBlur")
var rangeVideo = $("#rangeVideo")
var rangeVideoLabel = $("#rangeVideoLabel")
const myVideo = $("#myVideo")
const myMenu = $("#myMenu")
const infoAreaBig = $("#infoAreaBig")
const infoAreaSmall = $("#infoAreaSmall")
const btnToggleRotate = $(".btnToggleRotate")


// VAR LOCAL
var currentLi
var nextSongId = ""
var videoSize = 0
var videoQuality = 'lowest'
var playStyle = 'audioandvideo'

video.onended = function (e) {
    playVideo(myMenu.children()[0])
    togglePlay()
};
video.onloadeddata = function (e) {
    rangeVideo.val(video.currentTime)
    rangeVideo.attr('max', video.duration)
}
video.onplaying = function (e) {
    toggleCountCurrentTime()
    btnPlayBig.removeClass("mdi-play-circle-outline")
    btnPlayBig.addClass("mdi-pause-circle-outline")
    btnPlaySmall.removeClass("mdi-play-circle-outline")
    btnPlaySmall.addClass("mdi-pause-circle-outline")
};

$("#sVideoName").on('keypress',function(e) {
    if(e.which == 13) {
        searchVideo()
    }
});

function togglePlay() {
    if (video.paused) {
        btnPlayBig.removeClass("mdi-play-circle-outline")
        btnPlayBig.addClass("mdi-pause-circle-outline")
    } else {
        btnPlayBig.removeClass("mdi-pause-circle-outline")
        btnPlayBig.addClass("mdi-play-circle-outline")
    }
}

function playMusic(item) {
    var btn = $(`#${item.id}`)
    if (video.paused) {
        video.play();
        btn.removeClass("mdi-play-circle-outline")
        btn.addClass("mdi-pause-circle-outline")
    } else {
        video.pause();
        btn.removeClass("mdi-pause-circle-outline")
        btn.addClass("mdi-play-circle-outline")
    }
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
    const isRotated = myVideo.hasClass("rotate-right-90") && "rotate-right-90"
    for (let i of data) {
        myMenu.append(`<li id='${i.videoId}' data-title='${i.title}' data-description='${i.description || ""}' data-authorname='${i.author.name}' onClick="playVideo(this)"><div class="evideo ${isRotated}"><img class="thumbnail" src="${i.thumbnail}"/><div class="title-thumbnail">${i.title.substring(0,20)}</div></div></li>`);
    }
}

function searchVideo() {
    const sText = $("#sVideoName").val()
    $.get("./search", {
        sText
    }, function (data) {
        refreshListVideos(data)
    })
}

function playVideo(li) {
    currentLi = li
    $("#infoSongName").html(`<a class="title-link" target="_blank" href="https://www.youtube.com/watch?v=${li.id}">${li.dataset.title}</a>`)
    $("#infoDescribe").html(li.dataset.description)
    $("#infoAuthorName").html(li.dataset.authorname)
    myVideo.find("source").attr("src", `./video/${li.id}/${playStyle}/${videoQuality}`)
    video.load();
    video.play();
    nextSongId = li.dataset.authorname
    localStorage.setItem("videoPlaying",JSON.stringify({id:li.id, title:li.dataset.title, description:li.dataset.description, authorname:li.dataset.authorname}))
    $.get(`./info/${li.id}`, function (data) {
        refreshListVideos(data)
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
    if ((window.fullScreen) ||
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
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("app").style.marginLeft = "0";
        btnToggleMenu.removeClass("mdi mdi-close")
        btnToggleMenu.addClass("mdi mdi-menu-right")
    } else {
        document.getElementById("mySidenav").style.width = "210px";
        document.getElementById("app").style.marginLeft = "210px";
        btnToggleMenu.removeClass("mdi mdi-menu-right")
        btnToggleMenu.addClass("mdi mdi-close")
    }
}

function toggleBlur() {
    var btnB = $(`#btnBlurBig`)
    var btnS = $(`#btnBlurSmall`)
    if (btnB.hasClass("mdi-blur")) {
        myVideo.addClass("blur")
        btnB.addClass("mdi-blur-off")
        btnS.addClass("mdi-blur-off")
        btnB.removeClass("mdi-blur")
        btnS.removeClass("mdi-blur")
    } else {
        myVideo.removeClass("blur")
        btnB.addClass("mdi-blur")
        btnS.addClass("mdi-blur")
        btnB.removeClass("mdi-blur-off")
        btnS.removeClass("mdi-blur-off")
    }
}

function toggleAudioOnly(item) {
    var btnB = $(`#btnAudiOnlyBig`)
    var btnS = $(`#btnAudiOnlySmall`)
    if (btnB.hasClass("mdi-monitor-speaker")) {
        playStyle = 'audioandvideo'
        btnB.addClass("mdi-speaker")
        btnS.addClass("mdi-speaker")
        btnB.removeClass("mdi-monitor-speaker")
        btnS.removeClass("mdi-monitor-speaker")
        btnB.attr('title', "Chỉ nghe nhạc")
        btnS.attr('title', "Chỉ nghe nhạc")
    } else {
        playStyle = 'audioonly'
        btnB.addClass("mdi-monitor-speaker")
        btnS.addClass("mdi-monitor-speaker")
        btnB.removeClass("mdi-speaker")
        btnS.removeClass("mdi-speaker")
        btnB.attr('title', "Video và nhạc")
        btnS.attr('title', "Video và nhạc")
    }
    playVideo(currentLi)
}
function toggleRotateVideo() {
    btnToggleRotate.toggleClass("mdi-rotate-270")
    infoAreaBig.toggleClass("translateY-25")
    infoAreaSmall.toggleClass("translateY-25")
    $(".divVideo").toggleClass("scale-15")
    $(".evideo").toggleClass("rotate-right-90-scale")
    $(".right").toggleClass("rotate-right-90-no-scale")
    myVideo.toggleClass("margin-left-35px")
}

function toggleCountCurrentTime() {
    let ite = setInterval(() => {
        let currentTime = video.currentTime || 0, duration = video.duration
        if (duration) rangeVideo.val(currentTime)
        if (currentTime > 0) {
            let minT = Math.floor(duration / 60).toString().padStart(2,"0")
            let secT = Math.floor(duration % 60).toString().padStart(2,"0")
            let minC = Math.floor(currentTime / 60).toString().padStart(2,"0")
            let secC = Math.floor(currentTime % 60).toString().padStart(2,"0")
            let total = ""
            if (video.duration != "Infinity") total = ` / ${minT}:${secT}`
            rangeVideoLabel.text(`${minC}:${secC}${total}`)
        }
    }, 1000)
}

function toggleInfo() {
    infoAreaBig.toggle()
    infoAreaSmall.toggle()
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


//INIT ()
infoAreaSmall.hide()
toggleMenu()
const videoPlaying = JSON.parse(localStorage.getItem("videoPlaying")) || {}
playVideo({
    id: videoPlaying.id || "cpvzKPgFOmg",
    dataset: {
        title: videoPlaying.title || "Một điều anh ngại nói ra",
        description: videoPlaying.description || `<h3>https://www.facebook.com/duynq2197</h3>`,
        authorname: videoPlaying.authorname || "Copyright by duynq2197@gmail.com"
    }
})