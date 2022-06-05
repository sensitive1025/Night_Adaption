import { loadScene, PickHelper, playAudio, camera, scene, setCookie, getCookie } from "./main.js";

loadScene('scene2', -0.138, 1.2, 0);
let innerwindowinteract = 0;
let barricateinteract = 0;
let windowinteract = 0; //창문과 상호작용했는지 확인하는 변수
let backdoor = 0; //1스테이지에서 나온 문과 상호작용했는지 확인하는 변수
let doors = 0; //화장실 문과 1스테이지에서 나온 문을 제외한 문과 상호작용했는지 확인하는 변수
let interactcount = 0; //상호작용한 횟수를 세는 변수
let toilet = 0; //2차 미션의 시작을 나타낼 변수
let poster = 0;

var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역
var noYouCant = document.getElementById('accessfail'); //이전 페이지를 클리어하지 않으면 접근 제한 메시지를 띄울 영역

const pickCamera = camera;
const pickScene = scene;
const items = ['Back_1', 'Back_2', 'Back_3', 'Back_4',
    'Door_1', 'Door_1_1', 'Door_1_2', 'Door_1_3',
    'Door_1_4', 'Door_1_5', 'Door_1_6', 'Door_1_7',
    'Door_1_8', 'Door_1_9', 'Door_1_10', 'Door_1_11',
    'Cylinder_1', 'Cylinder_1_1', 'Cylinder_1_2', 'Cylinder_1_3',
    'Cylinder_1_4', 'Cylinder_1_5', 'Cylinder_1_6', 'Cylinder_1_7',
    'Cylinder_1_8', 'Cylinder_1_9', 'Cylinder_1_10', 'Cylinder_1_11',
    'Cylinder_2', 'Cylinder_2_1', 'Cylinder_2_2', 'Cylinder_2_3',
    'Cylinder_2_4', 'Cylinder_2_5', 'Cylinder_2_6', 'Cylinder_2_7',
    'Cylinder_2_8', 'Cylinder_2_9', 'Cylinder_2_10', 'Cylinder_2_11',
    'Cylinder', 'Cylinder_1', 'Cylinder_2', 'Cylinder_3',
    'Cylinder_4', 'Cylinder_5', 'Cylinder_6', 'Cylinder_7',
    'Cylinder_8', 'Cylinder_9', 'Cylinder_10', 'Cylinder_11',
    'Outerwindow', 'Outerwindow_1', 'Window_1', 'block_1', 'Window', 'Poster'
];
const pickHelper = new PickHelper(items); //클래스 선언!
const keyStates = {};

if (getCookie('1stage') != 'clear') { //만약 이전 스테이지가 클리어되지 않았다면?
    noYouCant.style.display = 'block';
    setTimeout(() => { history.back(); }, 800);
}

document.addEventListener('keydown', (event) => { //키가 눌려져있는가?
    keyStates[event.code] = true; //입력한 키 값 참으로!
});

let interacted = pickHelper.interactedOut(); //클래스에서 "상호작용 가능한가?" 변수 가져오기
let interactive = pickHelper.interactiveOut(); //클래스에서 "상호작용할 수 있는 물체가 무엇인가?" 변수 가져오기

function control() {
    if (keyStates['KeyE']) {
        interactionManage(interacted, interactive);
        keyStates['KeyE'] = false; //다른 키와 달리, E는 단발로 눌려야 하므로 한번 입력이 감지되면 그 뒤 입력을 제한.
    }
}

const element = document.getElementById('mainstory');

function interactionManage(interacted, interactive, audio) {
    console.log(interactive.name)
    if (interacted == true) { //상호작용 가능?
        if (interactive.name.search("Back") != -1) { //눈 앞에 나왔던 문이 있는가?
            if (backdoor == false) {
                audio = 'sounds/doorclose.mp3';
                const content = document.createTextNode("지훈은 조심스레 문을 닫았다.\n\n\n");
                element.appendChild(content);
                backdoor = true; //동일한 내용이 계속 추가되는 것을 방지한다.ß
                interactcount++;
                interactCount(interactcount);
            }
        }
        if (interactive.name.search("Cylinder") != -1 || interactive.name.search("Door") == 0) { //눈 앞에 문이 있는가?
            audio = 'sounds/doorlock.mp3';
            if (doors == false) {
                interactcount++;
                const content = document.createTextNode("지훈은 복도에 드문히 서있는 문을 열려 시도했다. 당연히도 문들은 대개 다 잠겨있었다.\n\n\n");
                element.appendChild(content);
                doors = true; //동일한 내용이 계속 추가되는 것을 방지한다.
                interactCount(interactcount);
            }
        }
        if (interactive.name == "Outerwindow") { //눈 앞에 바깥방향 창문이 있는가?
            if (windowinteract == false) {
                audio = 'sounds/null.mp3';
                interactcount++;
                const content = document.createTextNode("지훈은 넓은 창 바깥을 내다보았다. 바깥에는 지훈이 있는 건물의 일부 외에는 아무 것도 보이지 않았다.\n\n\n");
                element.appendChild(content);
                windowinteract = true; //동일한 내용이 계속 추가되는 것을 방지한다.
                interactCount(interactcount);
            }
        }
        if (interactive.name.search("Window") != -1) { //눈 앞에 창문이 있는가?
            audio = 'sounds/Window.mp3';
            if (innerwindowinteract == false) {
                interactcount++;
                const content = document.createTextNode("곧내, 지훈은 좁은 창 안을 들여다보았다. 허나 반투명한 유리창 너머로 그가 볼 수 있는 것은 없었다.\n\n\n");
                element.appendChild(content);
                innerwindowinteract = true; //동일한 내용이 계속 추가되는 것을 방지한다.
                interactCount(interactcount);
            }
        }
        if (interactive.name == "block_1") { //눈 앞에 책상과 의자들이 있는가?
            audio = 'sounds/null.mp3';
            if (barricateinteract == false) {
                interactcount++;
                const content = document.createTextNode("복도의 안 쪽 끝자락은 의자와 책상들로 막혀있었다. 지훈의 몸으로 그 장애물들을 치우는 것은 불가능했다.\n\n\n");
                element.appendChild(content);
                barricateinteract = true; //동일한 내용이 계속 추가되는 것을 방지한다.
                interactCount(interactcount);
            }
        }
        if (interactive.name == "Poster") { //눈 앞에 책상과 의자들이 있는가?
            audio = 'sounds/null.mp3';
            if (poster == false) {
                interactcount++;
                const content = document.createTextNode("지훈은 \"공고문\"이라 써져있는 인쇄물을 발견했다. 인쇄물에는 건물 내 시설의 보수공사와 관련한 장문의 글이 써져있었다.\n\n\n");
                element.appendChild(content);
                poster = true; //동일한 내용이 계속 추가되는 것을 방지한다.
                interactCount(interactcount);
            }
        }
        if (interactive.name.search("door_male") != -1) { //눈 앞에 화장실 문이 있는가?
            if (toilet == true) {
                audio = 'sounds/dooropen.mp3';
                interactcount++;
                interactCount(interactcount);
                toilet = false; //동일한 내용이 계속 추가되는 것을 방지한다.
                setCookie("2stage", "clear", 7); //2스테이지를 클리어했음을 쿠키에 7일간 저장한다.
                playAudio(audio);
                container.remove();
                clear.style.zIndex = "80";
                clear.style.opacity = "100%"; //게임창을 가리고 문서에 클리어 메시지를 출력한다.
                clear.style.position = "relative";
                opened++;
            }
        }
        playAudio(audio);
    }
}


function interactCount(count) {
    if (count == 1) {
        const content = document.createTextNode("지훈의 머리는 전보다 더욱 그에게 일어난 일에 대한 의문과 혼돈으로 가득찼다. 그가 아무리 이전의 기억을 되새기려 힘써도, 기억은 도중에 잘린 비디오 테이프처럼 끊기고 사라지기를 반복했다.");
        element.appendChild(content);
    }
    if (count == 2) {
        const content = document.createTextNode("복도 안을 돌아다니던 지훈은, 낯익은 구조와 가구들을 통해 그가 있는 장소가 학교임을 유추할 수 있었다.");
        element.appendChild(content);
    }
    if (count == 3) {
        const content = document.createTextNode("그가 복도 안을 서성거리던 무렵, 그는 어깨의 반쯤 아문 상처가 트더져 흐른 피가 어깨를 적시는 것을 느꼈다. 지훈은 무의식적으로 굳은 피를 닦을 수 있는 장소를 찾아 헤메였다.");
        element.appendChild(content);
        toilet = true;
        items.push('Door_male', 'Door_male_1', 'Door_male_2', 'door_male_1');
        var hint = document.getElementById("hint");
        hint.innerText = "복도 깊숙히 화장실을 찾아 들어가자.";
        hint.style.color = "#016090";
    }
    if (count == 4) {
        return false;
    }
    element.appendChild(document.createElement("BR"));
    element.appendChild(document.createElement("BR"));
    document.querySelector('#page').scrollTo(0, document.querySelector('#page').scrollHeight);
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