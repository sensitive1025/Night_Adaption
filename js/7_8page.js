import { loadScene, PickHelper, playAudio, camera, scene, setCookie, getCookie } from "./main.js";

loadScene('scene3', -0.138, 1, 0);

var noYouCant = document.getElementById('accessfail');
var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역

const pickCamera = camera;
const pickScene = scene;
const items = ['Box_4', 'Box_5'];
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

let DidYouHear = 0;
let heard = 0;
let fakeTap = 0;

function interactionManage(interacted, interactive, audio) {

    console.log(interactive.name);
    if (interacted == true) { //상호작용 가능?
        if (interactive.name == "doorlock") { //눈 앞에 출구가 있는가?
            if (heard == true) {
                audio = 'sounds/dooropen.mp3';
                setCookie("3stage", "clear", 7); //2스테이지를 클리어했음을 쿠키에 7일간 저장한다.

                container.remove();
                clear.style.zIndex = "80";
                clear.style.opacity = "100%"; //게임창을 가리고 문서에 클리어 메시지를 출력한다.
                clear.style.position = "relative";
            }
        }
        if (interactive.name == "Box_4") {
            if (DidYouHear == true && heard == false) {
                audio = 'sounds/null.mp3';
                const content = document.createTextNode("그가 다시금 밸브를 닫자 물줄기가 흐르던 입구에 작은 물방울이 맺혔다.\n\n\n");
                element.appendChild(content); //문서에 내용을 추가한다.
                document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                heard = true;
                setTimeout(() => {
                    audio = 'sounds/growling.mp3';
                    const content = document.createTextNode("그러던 중, 갑작스레 지훈의 귀에 그르렁대는 소리가 들렸다. 지훈은 바짝 얼어붙은 채 자신의 두 귀를 의심했지만 그의 귀에 닿은 소리는 선명하고 확실했다. 그의 머릿 속에 셀 수 없는 생각들이 오고간 끝내, 그는 문 바깥을 내다보기로 결정했다.\n\n\n");
                    element.appendChild(content); //문서에 내용을 추가한다.
                    document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                    items.push('doorlock');
                    playAudio(audio);
                }, 4000);
            }
            if (DidYouHear == false) {
                audio = 'sounds/watertap.mp3';
                const content = document.createTextNode("지훈은 세면대 위 밸브를 젖혔다. 수도꼭지의 입구에서 얇은 물줄기가 흘러나와 세면대의 밑바닥을 얕게 채웠다. 지훈은 밑바닥의 물을 손에 담아 상처에 흘려보냈다. 그의 상처 위에 찬 물이 지나며 굳은 피가 씻겨져나갔다.\n\n\n");
                element.appendChild(content); //문서에 내용을 추가한다.
                element.appendChild(document.createElement("BR"));
                element.appendChild(document.createElement("BR"));
                document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                DidYouHear = true;
            }
        }
        if (interactive.name == "Box_5") {
            if (fakeTap == false) {
                if (DidYouHear == false) {
                    audio = 'sounds/none.mp3';
                    const content = document.createTextNode("그가 한 쪽 수도꼭지의 밸브를 젖혔으나, 이상하게도 물 한방울 나오지 않았다.\n\n\n");
                    element.appendChild(content); //문서에 내용을 추가한다.
                    element.appendChild(document.createElement("BR"));
                    element.appendChild(document.createElement("BR"));
                    document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                    fakeTap = true;
                }
                if (DidYouHear == true) {
                    audio = 'sounds/none.mp3';
                    const content = document.createTextNode("그가 나머지 한 쪽 수도꼭지의 밸브를 젖혔으나, 물 한방울 나오지 않았다.\n\n\n");
                    element.appendChild(content); //문서에 내용을 추가한다.
                    element.appendChild(document.createElement("BR"));
                    element.appendChild(document.createElement("BR"));
                    document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
                    fakeTap = true;
                }
            }
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