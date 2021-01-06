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


// VAR LOCAL
var nextSongId = ""
var videoSize = 0


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
    for (let i of data) {
        myMenu.append(`<li id='${i.videoId}' data-title='${i.title}' data-description='${i.description || ""}' data-authorname='${i.author.name}' onClick="playVideo(this)"><div class="evideo"><img class="thumbnail" src="${i.thumbnail}"/><div class="title-thumbnail">${i.title.substring(0,20)}</div></div></li>`);
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
    $("#infoSongName").html(li.dataset.title)
    $("#infoDescribe").html(li.dataset.description)
    $("#infoAuthorName").html(li.dataset.authorname)
    myVideo.find("source").attr("src", `./video/${li.id}`)
    video.load();
    video.play();
    nextSongId = li.dataset.authorname
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
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("app").style.marginLeft = "250px";
        btnToggleMenu.removeClass("mdi mdi-menu-right")
        btnToggleMenu.addClass("mdi mdi-close")
    }
    document.getElementById("myVideo").style.marginLeft = "35px";
}

function toggleBlur(item) {
    var btn = $(`#${item.id}`)
    if (btn.hasClass("mdi-blur")) {
        myVideo.addClass("blur")
        btn.addClass("mdi-blur-off")
        btn.removeClass("mdi-blur")
    } else {
        myVideo.removeClass("blur")
        btn.addClass("mdi-blur")
        btn.removeClass("mdi-blur-off")
    }
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
    document.getElementById("mySidenav").style.width = "250px";
  }
  
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }


//INIT ()
infoAreaSmall.hide()
toggleMenu()
playVideo({
    id: "cpvzKPgFOmg",
    dataset: {
        title: "Một điều anh ngại nói ra",
        description: `<h3>https://www.facebook.com/duynq2197</h3>`,
        authorname: "Copyright by duynq2197@gmail.com"
    }
})