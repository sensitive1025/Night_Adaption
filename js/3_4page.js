import { loadScene, PickHelper, playAudio, camera, scene, setCookie, getCookie } from "./main.js";

loadScene('scene1', -0.138, 0.6, 0);
const pickCamera = camera;
const pickScene = scene;
let locked = 0;
let opened = 0; //문이 열려있는지 확인하는 변수
const items = ["Key", "Doorlock"];
const pickHelper = new PickHelper(items);
const keyStates = {};
var page = document.getElementById('gamepage'); //문서에서 gamepage ID를 지닌 객체 container가 들어가는 영역
var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역

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

function interactionManage(interacted, interactive, audio) {
    if (interacted == true) { //상호작용 가능?
        if (interactive.name == "Key") { //눈 앞에 열쇠가 있는가?
            if (locked >= 0) { //문이 잠겨있는가?
                audio = 'sounds/key.m4a'; //열쇠 줍는 소리
                const element = document.getElementById('mainstory');
                const content = document.createTextNode("절뚝거리며 방 안을 돌아다니던 지훈은 우연히도, 책상 서랍 안에 놓여 희미하게 반짝이는 열쇠를 발견했다.\n\n\n");
                element.appendChild(content); //문서에 내용을 추가한다.
                document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
            }
            interactive.parent.position.set(0, 10, 0); //열쇠를 공간으로부터 (멀리 보냄으로서)제거한다.
            locked = -1; //잠금 해제!
        }
        if (interactive.name == "Doorlock") { //눈 앞에 문이 있는가?
            if (locked == 0) { //열쇠가 없는가?
                audio = 'sounds/doorlock.mp3'; //잠긴 문 소리
                const element = document.getElementById('mainstory');
                const content = document.createTextNode("지훈은 당장 눈 앞에 보이는 문을 열려 힘썼지만 문은 굳게 잠겨있었다. \n\n\n");
                element.appendChild(content);
                document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                locked++; //잠긴 상태에서 상호작용 시 동일한 내용이 계속 추가되는 것을 방지한다.
            }
            if (locked == -1) { //열쇠가 있는가?
                if (opened == 0) { //문이 닫혀있는가?
                    audio = 'sounds/dooropen.mp3'; //문 여는 소리
                    const element = document.getElementById('mainstory');
                    const content =
                        document.createTextNode("\n\n지훈은 곧내 발견한 열쇠를 문에 달린 작은 열쇠구멍에 넣어 돌렸다. 다행히도, 열쇠는 잠겨있는 문의 것이었다. 철컥거리는 소리 몇 번만에 잠겨있던 문이 열렸다.\n\n\n");
                    element.appendChild(content);
                    document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                    container.remove();
                    clear.style.zIndex = "80";
                    clear.style.opacity = "100%"; //게임창을 가리고 문서에 클리어 메시지를 출력한다.
                    clear.style.position = "relative";
                    opened++;
                    setCookie("1stage", "clear", 7); //1스테이지를 클리어했음을 쿠키에 7일간 저장한다.
                } else {
                    audio = 'sounds/doorlock.mp3';
                }
            } else {
                audio = 'sounds/doorlock.mp3';
            }
        }
        playAudio(audio);
    }
}

picking();

function picking() {
    pickHelper.pick(pickScene, pickCamera);
    interacted = pickHelper.interactedOut();
    interactive = pickHelper.interactiveOut();
    control();
    requestAnimationFrame(picking);
}