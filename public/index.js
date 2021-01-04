var elem = document.documentElement;
var video = document.getElementById("myVideo");
var btn = document.getElementById("btnPlay");
var btnToggleMenu = $("#btnToggleMenu")
var btnPlay = $("#btnPlay")
var btnBlur = $("#btnBlur")
const myVideo = $("#myVideo")
const myMenu = $("#myMenu")


// VAR LOCAL
var nextSongId = ""



video.onended = function(e) {
    playVideo(myMenu.children()[0])
};

function togglePlay() {
    if (video.paused) {
        btnPlay.removeClass("mdi-play-circle-outline")
        btnPlay.addClass("mdi-pause-circle-outline")
    } else {
        btnPlay.removeClass("mdi-pause-circle-outline")
        btnPlay.addClass("mdi-play-circle-outline")
    }
}

function playMusic() {
    if (video.paused) {
        video.play();
        btnPlay.removeClass("mdi-play-circle-outline")
        btnPlay.addClass("mdi-pause-circle-outline")
    } else {
        video.pause();
        btnPlay.removeClass("mdi-pause-circle-outline")
        btnPlay.addClass("mdi-play-circle-outline")
    }
}

function openVideoFullscreen() {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) { /* Safari */
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE11 */
        video.msRequestFullscreen();
    }
}

function refreshListVideos(data) {
    myMenu.empty()
    for (let i of data) {
        myMenu.append(`<li id='${i.videoId}' data-title='${i.title}' data-description='${i.description}' data-authorname='${i.author.name}' onClick="playVideo(this)"><div class="evideo"><img class="thumbnail" src="${i.thumbnail}"/><div class="title-thumbnail">${i.title.substring(0,20)}</div></div></li>`);
    }
}

function searchVideo() {
    const sText = $("#sVideoName").val()
    $.get("http://localhost:3000/search", {
        sText
    }, function(data) {
        refreshListVideos(data)
    })
}

function playVideo(li) {
    $("#infoSongName").html(li.dataset.title)
    $("#infoDescribe").html(li.dataset.description)
    console.log(li.dataset.authorname)
    $("#infoAuthorName").html(li.dataset.authorname)
    myVideo.find("source").attr("src", `http://localhost:3000/video/${li.id}`)
    video.load();
    video.play();
    togglePlay()
    nextSongId = li.dataset.authorname
    $.get(`http://localhost:3000/info/${li.id}`, function(data) {
        refreshListVideos(data)
    })
}

function openAppFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function closeAppFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
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
}

function toggleBlur() {
    if (btnBlur.hasClass("mdi-blur")) {
        myVideo.addClass("blur")
        btnBlur.addClass("mdi-blur-off")
        btnBlur.removeClass("mdi-blur")
    } else {
        myVideo.removeClass("blur")
        btnBlur.addClass("mdi-blur")
        btnBlur.removeClass("mdi-blur-off")
    }
}



//INIT ()
toggleMenu()
playVideo({ id: "Z_A-BrhU8nI", dataset: {} })