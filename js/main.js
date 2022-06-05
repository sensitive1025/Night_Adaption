import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { Octree } from '../node_modules/three/examples/jsm/math/Octree.js';
import { Capsule } from '../node_modules/three/examples/jsm/math/Capsule.js';
import { FBXLoader } from "../node_modules/three/examples/jsm/loaders/FBXLoader.js";
//쿠키를 이용하면 일정 시간 동안 클라이언트의 디렉토리에 특정 정보를 문자열로 기록할 수 있다.
function setCookie(key, value, expiredays) { //웹사이트에 쿠키를 저장한다.
    var todayDate = new Date(); //오늘 날짜!
    todayDate.setDate(todayDate.getDate() + expiredays); //"오늘부터 설정한 날짜까지"
    document.cookie = key + "=" + value + "; path=/; HttpOnly expires=" + todayDate.toGMTString() + ";" //쿠키에 "key = value, "오늘부터 설정한 날짜까지"" 를 추가한다.
}

function getCookie(key) { //웹사이트에 저장된 쿠키를 불러오고 파싱한다.
    var result = null;
    var cookie = document.cookie.split(';');
    cookie.some(function(item) { // 공백을 제거
        item = item.replace(' ', '');

        var dic = item.split('=');

        if (key === dic[0]) {
            result = dic[1];
            return true; // 멈춰!
        }
    });
    return result;
}

let mixer;
const mixers = [];
const clock = new THREE.Clock(); //시계를 생성한다.
const scene = new THREE.Scene(); //장면을 생성한다.
scene.background = new THREE.Color(0x011220); //장면의 배경색을 설정한다.
scene.fog = new THREE.Fog(0x000203, 1, 20); //장면에 안개를 생성한다.
var page = document.getElementById('gamepage'); //문서에서 gamepage ID를 지닌 객체 container가 들어가는 영역
var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역
var info = document.getElementById('interact'); //문서에서 상호작용 가능을 알릴 객체
let interacted = false; //상호작용할 수 있는 거리에 있는지 판별할 변수
var audio = new Audio; //효과음

var effectVolume = document.getElementById('effectvolume'); //게임의 설정창에서 효과음 볼륨을 조정할 수 있는 슬라이더바
if (getCookie("effectvolume") != "Undefined") { //만약 유저가 볼륨을 설정한 기록이 쿠키에 저장되어있다면?
    effectVolume.value = getCookie("effectvolume"); //슬라이더바의 값을 쿠키의 값으로 저장한다.(페이지가 열리면 슬라이더바는 50으로 초기화된다.)
    audio.volume = effectVolume.value / 100; //효과음의 볼륨을 슬라이더 값의 백분율로 설정한다.
}

const camera = new THREE.PerspectiveCamera( //장면을 촬영할 카메라
    60, //PoV 값
    page.offsetWidth / page.offsetHeight, //화면의 종횡비
    0.1, //촬영할 가장 가까운 거리
    1000 //촬영할 가장 먼 거리
);
camera.rotation.order = 'YXZ'; // 카메라의 각도계를 YXZ로 설정한다.
const fillLight1 = new THREE.HemisphereLight(0x000000, 0x111111, 0.1); //하늘과 땅, 장면 전체를 밝히는 광원을 생성한다.
fillLight1.position.set(0, -1, 1);
scene.add(fillLight1); //장면에 조명 추가!

const rectLight = new THREE.RectAreaLight(0x002233, 0.1, 10, 10); //직접적인 조명
rectLight.position.set(-10, 8, -10);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight); //장면에 조명 추가!

const flashLight = new THREE.SpotLight(0x223344, 0.6, 30, Math.PI * 0.15, 1, 1); //손전등을 생성한다.
flashLight.position.set(0, 1, 0);
flashLight.rotation.order = 'YXZ'; //손전등의 각도계를 YXZ로 설정한다.
scene.add(flashLight);
scene.add(flashLight.target);
flashLight.castShadow = true;
const renderer = new THREE.WebGLRenderer({ antialias: true }); //장면을 촬영한 모습을 렌더링할 렌더러. 실질적으로 HTML 문서에 포함된다.
flashLight.shadow.mapSize.width = 512; // default
flashLight.shadow.mapSize.height = 512; // default
flashLight.shadow.camera.near = 0.5; // default
flashLight.shadow.camera.far = 500; // default
flashLight.shadow.focus = 1; // default

function init() {
    renderer.setPixelRatio(window.devicePixelRatio); //픽셀의 종횡비 설정
    renderer.setSize(page.offsetWidth, page.offsetHeight);
    renderer.shadowMap.enabled = true; //그림자 켜기 
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    page.appendChild(container); //ID가 gamepage인 div에 ID가 game인 div를 상속시켜라!
    container.appendChild(renderer.domElement); //ID가 game인 div에 게임 화면을 상속시켜라!   
}

const GRAVITY = 30; //플레이어에게 적용될 중력

const STEPS_PER_FRAME = 1.8;

const worldOctree = new Octree(); //모델의 물리적인 구조를 담당하는 변수
const zombieCollider = new Capsule(new THREE.Vector3(9, 0.35, 25), new THREE.Vector3(9, 1, 25), 0.1); //플레이어의 물리적인 형태, 세로로 긴 캡슐 모양
const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 2, 0), 0.35); //플레이어의 물리적인 형태, 세로로 긴 캡슐 모양
const playerVelocity = new THREE.Vector3(); //플레이어의 속도
const playerDirection = new THREE.Vector3(); //플레이어의 방향
const zombieVelocity = new THREE.Vector3(); //플레이어의 속도
const zombieDirection = new THREE.Vector3(); //플레이어의 방향

let playerOnFloor = false; //플레이어의 아래에 바닥이 있는지 확인하는 변수
let zombieOnFloor = false; //좀비의 아래에 바닥이 있는지 확인하는 변수
let interactive;
let damping;

const keyStates = {}; //입력한 키의 코드

class PickHelper {
    constructor(itemList) {
        this.raycaster = new THREE.Raycaster(); //시야에 있는 물체를 감지하기 위한 레이 정의
        this.pickedObject = null; //피킹된 물체
        this.itemList = itemList;
    }
    interactedOut() {
        return interacted;
    }
    interactiveOut() {
        return interactive;
    }
    pick(scene, camera) {
        //이미 다른 물체를 피킹했다면 피킹한 물체를 저장하는 변수를 초기화한다.
        if (this.pickedObject) {
            this.pickedObject = undefined;
        }

        this.raycaster.setFromCamera(new THREE.Vector2(-0.2, 0.2), camera); //카메라로부터 카메라가 바라보는 방향으로 레이저빔!
        //광선과 교차하는 물체들을 배열로 만듬
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            //첫 번째 물체가 제일 가까우므로 해당 물체를 고름
            this.pickedObject = intersectedObjects[0].object;
            interactive = this.pickedObject; //클래스 외부에서 쓰이지 않는 this.pickedObject의 값을 옮겨적자!
            flashLight.target.position.y = intersectedObjects[0].point.y;
            flashLight.target.position.x = intersectedObjects[0].point.x;
            flashLight.target.position.z = intersectedObjects[0].point.z;
            if (intersectedObjects[0].distance < 1.5) { //만약 물체와의 거리가 가깝다면?
                interacted = true; //상호작용 가능!
                if (this.itemList.includes(interactive.name)) { //가까운 물체가 상호작용이 가능한 물체라면?
                    info.style.opacity = "100%"; //상호작용이 가능함을 표시
                } else {
                    info.style.opacity = "0%";
                }
            } else { //아님 말고
                info.style.opacity = "0%";
                interacted = false;
            }
        }
    }
}
init();

function loadScene(scenename, Y, X, Z) {
    const loader = new GLTFLoader(); //3D 모델 파일을 불러올 로더
    camera.rotation.set(Y, X, Z);
    loader.load('model/' + scenename + '.glb', (gltf) => { //glb 파일을 불러온다.
        scene.add(gltf.scene); //불러온 모델을 장면에 추가한다!
        worldOctree.fromGraphNode(gltf.scene); //불러온 모델의 물리적인 구조를 만든다.
        gltf.scene.traverse(child => { //모델의 하위 모델(벽, 바닥, 문, 책상 등)에 그림자를 설정한다.
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;
                if (child.material.map) {
                    child.material.map.anisotropy = 10;
                }
            }
        });
        animate();
    });
}

let mesh;

function zombieIdleLoad() {
    let fbxURL = "../model/Zombie Idle.fbx"; //가만히 있는 좀비
    const loader = new FBXLoader();
    loader.load(fbxURL,
        function(object) {
            mixer = new THREE.AnimationMixer(object);
            mixers.push(mixer); //재생할 애니메이션 목록에 숨쉬는 모션 추가
            console.log(mixer);
            const action = mixer.clipAction(object.animations[1]);
            action.play(); //숨쉬는 애니메이션 재생!
            mesh = object;
            object.traverse(function(child) {

                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            });
            animate();
            object.scale.set(0.02, 0.02, 0.02); //좀비 모델 크기 조정!
            object.position.set(9, -0.35, 25); //좀비의 위치를 복도 끝으로!
            object.rotation.set(0, Math.PI, 0); //좀비가 반대편을 보게!
            scene.add(object); //장면에 좀비 소환!
            console.log(zombieCollider.start);
        }
    );
}

let zombie;

function zombieLoad() {
    let fbxURL = "../model/Zombie Running.fbx"; //달리는 좀비
    const loader = new FBXLoader();
    loader.load(fbxURL,
        function(object) {
            mixer = new THREE.AnimationMixer(object);
            mixers.push(mixer);
            console.log(mixer);
            const action = mixer.clipAction(object.animations[0]);
            action.play();
            zombie = object;
            object.traverse(function(child) {

                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            });
            animate();
            object.scale.set(0.02, 0.02, 0.02);
            object.rotation.set(0, Math.PI, 0);
            scene.add(object);
            console.log(object);
        }
    );
    setTimeout(() => { scene.remove(mesh) }, 1000);

}

document.addEventListener('keydown', (event) => { //키가 눌려져있는가?
    keyStates[event.code] = true;
});

document.addEventListener('keyup', (event) => { //키가 눌려있다 떨어졌는가?
    keyStates[event.code] = false;
});

container.addEventListener('mousedown', () => { //마우스가 눌려져있는가?
    document.body.requestPointerLock();
});

document.body.addEventListener('mousemove', (event) => { //마우스가 움직이는가?
    if (document.pointerLockElement === document.body) {

        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
        flashLight.rotation.y -= event.movementX / 500;
        flashLight.rotation.x -= event.movementY / 500;
        if (camera.rotation.x < -1.5) {
            camera.rotation.x = -1.5;
        } else if (camera.rotation.x > 1.5) {
            camera.rotation.x = 1.5;
        }
    }
});
window.addEventListener('resize', onWindowResize); //창의 크기가 조절되었는가?

function onWindowResize() { //창의 크기가 조절되었을 때 게임 화면의 크기, 비율 조정

    camera.aspect = page.offsetWidth / page.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(page.offsetWidth, page.offsetHeight); //렌더링할 게임 화면의 크기를 재조정하라

}

function playAudio(audioName) {
    audio = new Audio(audioName);
    audio.play();
}

function playerCollisions() { //플레이어가 물리적으로 접촉하고 있을 때, 충돌 구현
    const result = worldOctree.capsuleIntersect(playerCollider); //플레이어가 다른 모델에 닿아있는가?
    playerOnFloor = false; //플레이어가 바닥에 있지 않을 땐 거짓으로 설정.
    if (result) { //만약 플레이어가 다른 모델(벽, 바닥)과 닿아있으면

        playerOnFloor = result.normal.y > 0; //다른 모델과 플레이어가 y축과 방향으로 만나는가?

        if (!playerOnFloor) { //y축과 수직하는 방향으로 만나지 않으면 플레이어에게 원래 속도를 부여한다.
            playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
        }

        playerCollider.translate(result.normal.multiplyScalar(result.depth));

    }
}

function zombieCollisions() { //좀비가 물리적으로 접촉하고 있을 때, 충돌 구현
    const zresult = worldOctree.capsuleIntersect(zombieCollider); //좀비가 다른 모델에 닿아있는가?
    zombieOnFloor = false; //좀비가 바닥에 있지 않을 땐 거짓으로 설정.
    if (Math.abs(zombieCollider.start.x - playerCollider.start.x) < 4 && Math.abs(zombieCollider.start.z - playerCollider.start.z) < 4 && Math.abs(zombieCollider.start.y - playerCollider.start.y) < 2) { //좀비와 플레이어가 맞닿아있다면?
        playerCollider.start.y = 100;
        playerCollider.end.y = 100;
        container.remove();
        audio = new Audio('sounds/Zombie_Scream.mp3'); //좀비 비명 소리
        audio.volume = effectVolume.value / 100;
        audio.play(); //재생
        setTimeout(() => {
            location.href = "GAMEOVER"; //게임 오버 페이지로 이동
        }, 1800);
    }
    if (zresult) { //만약 플레이어가 다른 모델(벽, 바닥)과 닿아있으면

        zombieOnFloor = zresult.normal.y > 0; //다른 모델과 플레이어가 y축과 방향으로 만나는가?

        if (!zombieOnFloor) { //y축과 수직하는 방향으로 만나지 않으면 좀비에게 원래 속도를 부여한다.
            zombieVelocity.addScaledVector(zresult.normal, -zresult.normal.dot(zombieVelocity));
        }

        zombieCollider.translate(zresult.normal.multiplyScalar(zresult.depth));

    }
}

function updatePlayer(deltaTime) { //플레이어의 위치 상태를 업데이트
    damping = Math.exp(-6 * deltaTime) - 1; //공기저항을 구현하기 위한 변수

    if (!playerOnFloor) {

        playerVelocity.y -= GRAVITY * deltaTime; //바닥에 닿아있지 않다면 중력가속도를 부여한다.

        //작은 양의 가속도
        damping *= 0.0005;

    }

    playerVelocity.addScaledVector(playerVelocity, damping); //플레이어를 가속시킨다.

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime); //플레이어의 속도만큼 플레이어의 변위를 만든다.
    playerCollider.translate(deltaPosition); //변위만큼 플레이어를 움직인다.

    playerCollisions();

    camera.position.copy(playerCollider.end);
    flashLight.position.copy(playerCollider.end);
}

function updateZombie(deltaTime) { //좀비의 위치 상태를 업데이트
    damping = Math.exp(-6 * deltaTime) - 1;

    if (!zombieOnFloor) {

        zombieVelocity.y -= 0.01 * deltaTime;

        damping *= 0.0005;

    }

    zombieVelocity.addScaledVector(zombieVelocity, damping); //좀비를 가속시킨다.

    const deltaPosition = zombieVelocity.clone().multiplyScalar(deltaTime); //좀비의 속도만큼 좀비의 변위를 만든다.
    zombieCollider.translate(deltaPosition); //변위만큼 좀비를 움직인다.

    zombieCollisions();

    if (zombie != undefined) {
        zombie.position.x = zombieCollider.start.x;
        zombie.position.y = zombieCollider.start.y - 0.2;
        zombie.position.z = zombieCollider.start.z;
    }
}

function zombieMove(deltaTime) { //좀비가 앞으로 향하는 벡터를 형성한다.
    zombieDirection.y = 0; //좀비의 이동 방향의 y축 성분 제거
    zombieDirection.normalize(); //좀비가 대각선으로 향한다면 벡터합에 의해 더 멀리 이동하므로 벡터의 크기를 정상화한다.
    zombieVelocity.add(zombieDirection.multiplyScalar(deltaTime * (zombieOnFloor ? 40 : 8)));
}

function zombieDirect() {
    if (zombie != undefined) {
        if (playerCollider.end.x - zombieCollider.end.x > 0) {
            zombie.rotation.y = Math.asin((zombieCollider.end.z - playerCollider.end.z) / Math.sqrt(Math.pow(playerCollider.end.x - zombieCollider.end.x, 2) + Math.pow(playerCollider.end.z - zombieCollider.end.z, 2)));
        } //플레이어와 좀비의 x, z 위치 차이를 이용해 arcsin을 구하여 좀비 모델의 각도에 저장한다.
        else {
            zombie.rotation.y = Math.PI - Math.asin((zombieCollider.end.z - playerCollider.end.z) / Math.sqrt(Math.pow(playerCollider.end.x - zombieCollider.end.x, 2) + Math.pow(playerCollider.end.z - zombieCollider.end.z, 2)));
        } //만약 x 위치 차가 0보다 작아진다면 구하고자 하는 값이 arcsin의 엇각이 되므로 PI에서 구한 값을 빼준다.
        zombie.rotation.y += Math.PI / 2; //좀비 3D 모델이 바라보는 각도와 계산한 각도의 차이 보정
        zombie.getWorldDirection(zombieDirection); //좀비 3D 모델이 바라보는 각도로 좀비의 이동 방향 설정
        zombieDirection.y = 0;

    }
}

function getForwardVector() { //플레이어가 앞으로 향하는 벡터를 형성한다.
    camera.getWorldDirection(playerDirection); //플레이어의 이동 방향을 카메라의 방향으로 설정
    playerDirection.y = 0; //플레이어의 이동 방향의 y축 성분 제거 (아래를 보고 이동하면 안돼!!)
    playerDirection.normalize(); //플레이어가 대각선으로 향한다면 벡터합에 의해 더 멀리 이동하므로 벡터의 크기를 정상화한다.
    return playerDirection;
}

function getSideVector() { //플레이어가 옆으로 향하는 벡터를 형성한다.
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);
    return playerDirection;
}

function controls(deltaTime) { //키보드 조작을 다룬다.
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 4);
    if (keyStates['KeyW']) {
        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }
    if (keyStates['KeyS']) {
        playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
    }
    if (keyStates['KeyA']) {
        playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
    }
    if (keyStates['KeyD']) {
        playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    }
    if (playerOnFloor) { //플레이어가 바닥에 있다면?
        if (keyStates['Space']) { //스페이스바를 눌렀다면?
            keyStates['Space'] = false;
            playerVelocity.y = 6; //점프!
        }
    }
}

function teleportPlayerIfOob() { //혹여나 플레이어가 맵 바깥으로 떨어졌을 때, 원래 위치로 돌려보낸다.
    if (camera.position.y <= -25) {
        playerCollider.start.set(0, 0.35, 0);
        playerCollider.end.set(0, 2, 0);
        playerCollider.radius = 0.25;
        camera.position.copy(playerCollider.end);
        camera.rotation.set(0, 0, 0);
    }
}

function animate(time) {
    time *= 0.001;
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    //렌더링되는 주기보다 물리적인 충돌을 구현하는 주기를 더 빠르게 한다.
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
        controls(deltaTime);
        updatePlayer(deltaTime);
        teleportPlayerIfOob();
    }
    for (const mixer of mixers) {
        mixer.update(deltaTime); //리스트에 저장된 애니메이션을 실행시켜러!
    }
    audio.volume = effectVolume.value / 100; //효과음의 볼륨을 슬라이더 값의 백분율로 설정한다.
    renderer.render(scene, camera);
    requestAnimationFrame(animate); //animate함수를 프레임마다 끈임없이 반복적으로 실행해라!
}

export { //본 스크립트의 함수를 다른 스크립트에서 쓸 수 있도록 출력한다.
    PickHelper,
    loadScene,
    playAudio,
    scene,
    camera,
    setCookie,
    getCookie,
    zombieIdleLoad,
    zombieLoad,
    zombieMove,
    zombieDirect,
    updateZombie,
    playerCollider
};
