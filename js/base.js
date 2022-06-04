function setCookie(key, value, expiredays) {
    var todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expiredays);
    document.cookie = key + "=" + value + "; path=/; HttpOnly expires=" + todayDate.toGMTString() + ";"
}

function getCookie(key) {
    var result = null;
    var cookie = document.cookie.split(';');
    cookie.some(function(item) {
        item = item.replace(' ', '');

        var dic = item.split('=');

        if (key === dic[0]) {
            result = dic[1];
            return true;
        }
    });
    return result;
}

var audio = new Audio;
let isClear = document.getElementById("clear");

var effectVolume = document.getElementById('effectvolume'); //책날개의 효과음 설정 슬라이드바
if (getCookie("effectvolume") != "Undefined") { //미리 사용자가 설정해놓은 데이터가 쿠키에 저장되어있다면?
    effectVolume.value = getCookie("effectvolume"); //효과음의 볼륨을 저장된 데이터대로!
    audio.volume = effectVolume.value / 100; //백분율 적용
}

function next(index) { //오른쪽 페이지를 클릭했을 때 호출될 함수
    if (isClear.style.opacity == "1") { //만약 클리어 됐다면?
        audio = new Audio('sounds/flip.mp3'); //책 넘기는 소리
        audio.volume = effectVolume.value / 100;
        audio.play(); //재생
        setTimeout(() => {
            location.href = index;
        }, 800); //소리가 다 재생이 되면 다음 페이지로!
    } else { //클리어 되지 않았다면?
        audio = new Audio('sounds/fail.mp3'); //안돼!
        audio.volume = effectVolume.value / 100;
        audio.play();
    }
}
effectVolume.oninput = function() { //사용자가 효과음 크기를 설정했다면?
    setCookie("effectvolume", effectVolume.value, 7); //7일간 쿠키 저장
};