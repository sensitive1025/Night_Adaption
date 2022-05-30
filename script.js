function imagesLoadFunc() {
    for (var e = 1; e < mbgNum; e++) {
        _image = new Image;
        var i = "https://digitalspecial.joongang.co.kr/_o/img/newsroom/2019/1104_aptwar/m_bg/m_" +
                "bg_imge_" + returnNum(e) + ".jpg";
        _image.src = i,
        bg_imageArr.push(_image)
    }
    bg_imageArr[0].addEventListener("load", function () {
        Bg_canvas.drawImage(_image, 0, 0),
        draw(0)
    }, !1)
}
function draw(e) {
    Bg_canvas.drawImage(bg_imageArr[e], 0, 0)
}
function returnNum(e) {
    var i = 0;
    return e < 10
        ? i = "000" + e
        : e < 100
            ? i = "00" + e
            : e < 1e3 && (i = "0" + e),
    i
}
function pageSetfunc() {
    var e = $(".subPage")
        .eq(pageNum)
        .offset()
        .top;
    TweenMax.to($(window), 1.4, {
        scrollTo: {
            y: e,
            autoKill: !1
        },
        ease: Expo.easeInOut
    })
}
function naviSet() {
    $(".subNavi li")
        .eq(pageNum)
        .addClass("active")
        .siblings()
        .removeClass("active")
}
function stageResize() {
    WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    mainHEIGHT = $("main").height(),
    $(".height_fix").css("min-height", HEIGHT);
    var e = HEIGHT * (1280 / 720),
        i = .5625 * WIDTH,
        n = (WIDTH - e) / 2;
    is_mobile || (
        subNaviTop = subNavi.offset().top,
        WIDTH < e
            ? (
                $(".full_vodSet").css("width", e),
                $(".full_vodSet").css("height", HEIGHT),
                $(".full_vodSet").css("left", n)
            )
            : (
                $(".full_vodSet").css("width", WIDTH),
                $(".full_vodSet").css("height", i),
                $(".full_vodSet").css("left", "auto")
            )
    ),
    is_mobile && $("#vod_1").removeAttr("autoplay")
}
function scrollActFunc() {
    if (scrollTop = $(window).scrollTop(), is_mobile) {
        var e = percentageFunc(scrollTop, mainHEIGHT - HEIGHT, mbgNum);
        e <= mbgNum && draw(e)
    } else 
        subNaviTop <= scrollTop + 200
            ? subNavi.addClass("fixedSet")
            : subNavi.removeClass("fixedSet")
    }
function numberWithCommas(e) {
    return e
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
function urlCopy() {
    var e = document.getElementById("textUrl");
    e.value = window.location.href,
    e.select(),
    document.execCommand("Copy"),
    alert("URL이 복사 되었습니다.")
}
function getUrlParams() {
    var e = {};
    return window
        .location
        .search
        .replace(/[?&]+([^=&]+)=([^&]*)/gi, function (i, n, a) {
            e[n] = a
        }),
    e
}
var WIDTH,
    HEIGHT,
    mainHEIGHT,
    _bgWrap,
    subNavi,
    imgClo,
    Bg_canvas,
    currentPage = location.host,
    pageNum = 0,
    mbgNum = 200;
window.onload = function () {
    $(window).resize(function () {
        stageResize()
    })
},
$(document).ready(function (e) {
    contID = 404,
    is_mobile = isMobile(),
    e(window).bind("scroll", function () {
        scrollActFunc()
    }),
    subNavi = e(".subNavi"),
    e(".mainNavi li").on("click", function () {
        var i = e(this).index();
        return pageNum = i,
        pageSetfunc(),
        !1
    }),
    is_mobile || e(".subNavi li").on("click", function () {
        var i = e(this).index();
        return pageNum = i,
        pageSetfunc(),
        !1
    }),
    is_mobile && (
        _bgWrap = e(".bg_wrap"),
        Bg_canvas = document.getElementById("Bg_canvas").getContext("2d"),
        imagesLoadFunc()
    ),
    stageResize(),
    scrollActFunc();
    var i = is_mobile
        ? "96%"
        : "80%";
    e("p, .mainPage h1, h5, h2, .subPage_title img").waypoint(function (i) {
        "down" == i && (e(this.element).addClass("active"), this.destroy())
    }, {offset: i});
    e(".subPage").waypoint(function (i) {
        var n = e(this.element) || e(this);
        "down" === i
            ? pageNum = n.index() - 5
            : "up" === i && (pageNum = n.index() - 6),
        is_mobile || naviSet()
    }, {offset: i})
});
var scrollTop,
    subNaviTop,
    bg_imageArr = [],
    percentageFunc = function (e, i, n) {
        return Math.ceil(e / i * n)
    };
$.fn.pixels = function (e) {
    return parseInt(this.css(e).slice(0, -2))
};