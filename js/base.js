function setCookie(key, value, expiredays) {
    var todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expiredays);
    document.cookie = key + "=" + value + "; path=/; HttpOnly expires=" + todayDate.toGMTString() + ";"
}

function getCookie(key) {
    var result = null;
    var cookie = document.cookie.split(';');
    cookie.some(function(item) { // 공백을 제거
        item = item.replace(' ', '');

        var dic = item.split('=');

        if (key === dic[0]) {
            result = dic[1];
            return true; // 멈춰!;
        }
    });
    return result;
}

var audio = new Audio;
let isClear = document.getElementById("clear");

var effectVolume = document.getElementById('effectvolume');
if (getCookie("effectvolume") != "Undefined") {
    effectVolume.value = getCookie("effectvolume");
    audio.volume = effectVolume.value / 100;
}

function next(index) {
    if (isClear.style.opacity == "1") {
        audio = new Audio('sounds/flip.mp3');
        audio.volume = effectVolume.value / 100;
        audio.play();
        setTimeout(() => {
            location.href = index + ".html";
        }, 800);
    } else {
        audio = new Audio('sounds/fail.mp3');
        audio.volume = effectVolume.value / 100;
        audio.play();
    }
}
effectVolume.oninput = function() {
    setCookie("effectvolume", effectVolume.value, 7);
};

var view = document.createElement('div');
document.body.appendChild(view);
devtoolsDetector.addListener(function(isOpen) {
    document.location.href = "https://youtu.be/pd3eiF3bH38?t=89";
});
//devtoolsDetector.launch();