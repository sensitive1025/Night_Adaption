import { playerCollider, loadScene, PickHelper, playAudio, camera, scene, setCookie, getCookie, zombieIdleLoad, zombieLoad, zombieDirect, zombieMove, updateZombie } from "./main.js";
import * as THREE from 'three';

camera.rotation.set();
loadScene('scene4', -0.138, 3.5, 0);

var noYouCant = document.getElementById('accessfail');
var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역
var info = document.getElementById('interact'); //문서에서 상호작용 가능을 알릴 객체
const element = document.getElementById('mainstory');

let scream = 0;
const pickCamera = camera;
const pickScene = scene;
const items = ['null'];
const pickHelper = new PickHelper(items); //상호작용 가능한 물체가 많아 items 배열에 저장하지 않고 본 스크립트에서 관할...
const keyStates = {};
const clock = new THREE.Clock(); //시계를 생성한다.

zombieIdleLoad();

if (getCookie('2stage') != 'clear') {
    noYouCant.style.display = 'block';
    setTimeout(() => { history.back(); }, 800);
}

document.addEventListener('keydown', (event) => { //키가 눌려져있는가?
    keyStates[event.code] = true;
});

let interacted = pickHelper.interactedOut();
let interactive = pickHelper.interactiveOut();
let interactcount = 0;
let open = 0;

function control() {
    if (interacted == true && (interactive.name.search("Cylinder") != -1 || interactive.name.search("Door") != -1)) {
        info.style.opacity = "100%";
    }
    if (interacted == false) {
        info.style.opacity = "0";
    }
    if (keyStates['KeyE']) {
        interactionManage(interacted, interactive);
        keyStates['KeyE'] = false; //다른 키와 달리, E는 단발로 눌려야 하므로 한번 입력이 감지되면 그 뒤 입력을 제한.
    }
}

function Run() {
    if (playerCollider.end.x > 6) {
        if (scream == false) {

            playAudio("sounds/Zombie_Scream.mp3");
            zombieLoad();
            var hint = document.getElementById("hint");
            hint.innerText = "도망가자.";
            hint.style.color = "#903016";
            const content = document.createTextNode("얼마 가지 않아, 지훈은 복도 깊숙한 곳에서 사람의 형체를 발견했다. 허나 형체의 비이상적으로 큰 키와 기이한 움직임에 지훈은 큰 괴리감을 느꼈다. 그 순간, 그것이 울부짖으며 죽일 기세로 지훈에게 달려오기 시작했다.");
            element.appendChild(content);
        }
        scream = true;
    }
}


function interactionManage(interacted, interactive, audio) {
    console.log(interactive.name);

    if (interacted == true) { //상호작용 가능?
        if (interactive.name.search("Cylinder") != -1 || interactive.name.search("Door") != -1) { //눈 앞에 문이 있는가?
            if ((interactive.name == "Door_1_11_1" || interactive.name == "Cylinder_11_1" || interactive.name == "Cylinder2_11_1") && open == false) {
                audio = 'sounds/dooropen.mp3';
                setCookie("4stage", "clear", 7); //2스테이지를 클리어했음을 쿠키에 7일간 저장한다.
                container.remove();
                clear.style.zIndex = "80";
                clear.style.opacity = "100%"; //게임창을 가리고 문서에 클리어 메시지를 출력한다.
                clear.style.position = "relative";
                open = true;
            } else {
                interactCount(++interactcount);
                audio = 'sounds/doorlock.mp3';
            }
        }
        playAudio(audio);
    }
}

function interactCount(count) {
    if (count == 1) {
        const content = document.createTextNode("지훈은 급히 괴물을 피해 달아나 교실 문을 잡아당겼으나 문은 잠겨있었다. 그의 심장은 터질 듯이 뛰기 시작했다.");
        element.appendChild(content);
    }
    if (count == 2) {
        const content = document.createTextNode("마음이 급해진 지훈은 괴물과의 거리가 크게 벌어진 틈을 타 다시 한 번 문을 잡아당겼으나 여전히 문은 잠겨있었다.");
        element.appendChild(content);
    }
    if (count == 3) {
        const content = document.createTextNode("지훈이 열려는 문이 잠겨있을 때마다 그의 온몸에서 식은 땀이 흘렀다. 흐른 땀이 어깨의 상처를 자극했지만 이는 그리 중요한 문제가 아니었다.");
        element.appendChild(content);
    }
    if (count == 4) {
        const content = document.createTextNode("그는 간절한 마음으로 문손잡이를 돌렸으나 교실의 문은 열리지 않는다. 지훈의 표정은 크게 일그러졌다.");
        element.appendChild(content);
    }
    if (count == 5) return false;
    element.appendChild(document.createElement("BR"));
    element.appendChild(document.createElement("BR"));
    document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
}

picking();

function picking(time) {
    const deltaTime = Math.min(0.05, clock.getDelta()) / 1.8;
    for (let i = 0; i < 1.8; i++) {
        zombieMove(deltaTime);
        zombieDirect(deltaTime);
        updateZombie(deltaTime);
    }
    time *= 0.001;
    pickHelper.pick(pickScene, pickCamera);
    interacted = pickHelper.interactedOut();
    interactive = pickHelper.interactiveOut();
    control();
    Run(interactive);
    requestAnimationFrame(picking);
}