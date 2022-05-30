import { loadScene, PickHelper, playAudio, camera, scene, setCookie, getCookie } from "./main.js";

loadScene('scene3');
let innerwindowinteract = 0;
let barricateinteract = 0;
let windowinteract = 0; //창문과 상호작용했는지 확인하는 변수
let backdoor = 0; //1스테이지에서 나온 문과 상호작용했는지 확인하는 변수
let doors = 0; //화장실 문과 1스테이지에서 나온 문을 제외한 문과 상호작용했는지 확인하는 변수
let interactcount = 0; //상호작용한 횟수를 세는 변수
let toilet = 0; //2차 미션의 시작을 나타낼 변수
let poster = 0;

var noYouCant = document.getElementById('accessfail');
var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역

const pickCamera = camera;
const pickScene = scene;
const items = ['Handle_1', 'Handle_2'];
const pickHelper = new PickHelper(items);
const keyStates = {};

if (getCookie('2stage') != 'clear') {
    noYouCant.style.display = 'block';
}

document.addEventListener('keydown', (event) => { //키가 눌려져있는가?
    keyStates[event.code] = true;
});

let interacted = pickHelper.interactedOut();
let interactive = pickHelper.interactiveOut();

function control() {
    if (keyStates['KeyE']) {
        interactionManage(interacted, interactive);
        keyStates['KeyE'] = false; //다른 키와 달리, E는 단발로 눌려야 하므로 한번 입력이 감지되면 그 뒤 입력을 제한.
    }
}

const element = document.getElementById('mainstory');

function interactionManage(interacted, interactive, audio) {
    if (interacted == true) { //상호작용 가능?
        if (interactive.name == "doorlock") { //눈 앞에 출구가 있는가?
            audio = 'sounds/dooropen.mp3';
        }
        playAudio(audio);

    }
}

picking();

function picking(time) {
    time *= 0.001;
    pickHelper.pick(pickScene, pickCamera);
    interacted = pickHelper.interactedOut();
    interactive = pickHelper.interactiveOut();
    control();
    requestAnimationFrame(picking);
}