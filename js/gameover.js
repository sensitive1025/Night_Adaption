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
page = document.getElementById('gamepage'); //문서에서 gamepage ID를 지닌 객체 container가 들어가는 영역
container = document.getElementById('game'); //문서에서 game ID를 지닌 객체, 게임이 들어가는 영역
let mixer;
const mixers = [];
const frustumSize = 1000;
let windowHalfX = container.offsetWidth / 2;
let windowHalfY = container.offsetHeight / 2;
let mouseX = 0;
let mouseY = 0;
const aspect = container.offsetWidth / container.offsetHeight;
const keyStates = [];
const clock = new THREE.Clock(); //시계를 생성한다.
var scene = new THREE.Scene(); //요소들이 있을 무대를 만들자!

var camera = new THREE.PerspectiveCamera( //무대를 촬영해줄 카메라!
    45, //FoV 값
    page.offsetWidth / page.offsetHeight, //카메라로 담는 화면의 비율
    0.1,
    1000
);
camera.updateProjectionMatrix();
camera.position.set(0, 0, 30);

var renderer = new THREE.WebGLRenderer({ antialias: true }); //3d로 그린 그림을 화면에 표현할 "렌더러"
renderer.setClearColor(new THREE.Color(0x000000));
renderer.setSize(container.offsetWidth, container.offsetHeight); //렌더러의 크기를 컨테이너의 크기로 정의함

var spotLight = new THREE.SpotLight(0xFFFFFF); //조명! 한 부분을 동그랗게 비춰주는 스포트라이트
spotLight.position.set(100, 200, 300);

scene.add(spotLight);

const effect = new THREE.AsciiEffect(renderer, '.NM', { invert: true }); //렌더링한 화면에 아스키아트 효과를 씌워주자!
effect.setSize(page.offsetWidth, page.offsetHeight);
effect.domElement.style.color = 'gray';
effect.domElement.style.backgroundColor = 'black';
effect.render(scene, camera);

document.body.addEventListener('pointermove', onPointerMove); //문서 위에서 마우스 포인터가 움직였는지 감지해라!

page.appendChild(container); //ID가 gamepage인 div에 ID가 game인 div를 상속시켜라!
container.appendChild(effect.domElement); //ID가 game인 div에 게임 화면을 상속시켜라!

effect.setSize(container.offsetWidth, container.offsetHeight); //렌더링한 화면의 크기를 상속되어있는 div의 크기에 맞춰라!
effect.render(scene, camera); //이제 렌더링 함 해라!

window.onresize = function() { //창의 크기가 조절될 때 게임 화면을 재조정한다
    const aspect = page.offsetWidth / page.offsetHeight;
    camera.aspect = aspect; //창의 크기에 맞게 카메라의 비율을 재조정
    camera.updateProjectionMatrix();

    effect.setSize(container.offsetWidth, container.offsetHeight); //창의 크기에 맞게 렌더링 화면의 크기를 재조정
}

var effectVolume = document.getElementById('effectvolume'); //책날개의 효과음 설정 슬라이드바
if (getCookie("effectvolume") != "Undefined") { //미리 사용자가 설정해놓은 데이터가 쿠키에 저장되어있다면?
    effectVolume.value = getCookie("effectvolume"); //효과음의 볼륨을 저장된 데이터대로!
    audio.volume = effectVolume.value / 100; //백분율 적용
}

var playMain = document.getElementById("gamepage");
var playVoice = document.getElementById("voice"); // AUDIO파일

window.onload = function() {
    playVoice.play();
}

document.addEventListener('keydown', (event) => { //키가 눌려져있는가?
    keyStates[event.code] = true;
    history.back();
});

let fbxURL = "../model/Zombie Scream.fbx"; //소리지르는 좀비
const loader = new THREE.FBXLoader();
let mesh;


loader.load(fbxURL,
    function(object) {
        mixer = new THREE.AnimationMixer(object);
        mixers.push(mixer); //재생할 애니메이션 목록에 숨쉬는 모션 추가
        console.log(mixer);
        const action = mixer.clipAction(object.animations[0]);
        action.play();
        mesh = object;
        object.traverse(function(child) {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        });
        animate();
        scene.add(object);
        object.position.y = -110;

    }
);

window.onresize = function() { //창의 크기가 조절될 때 게임 화면을 재조정한다
    const aspect = page.offsetWidth / page.offsetHeight;
    camera.aspect = aspect; //창의 크기에 맞게 카메라의 비율을 재조정
    camera.updateProjectionMatrix();

    effect.setSize(container.offsetWidth, container.offsetHeight); //창의 크기에 맞게 렌더링 화면의 크기를 재조정
}

effect.render(scene, camera);

var audio = new Audio;

function playaudio() {

    audio = new Audio("sounds/Zombie_Scream.mp3");
    audio.volume = effectVolume.value / 100;
    audio.play();
}
playaudio();

function onPointerMove(event) { //마우스 커서의 위치를 받아오자!

    if (event.isPrimary === false)
        return;

    mouseX = 0;
    mouseY = (event.clientY - windowHalfY) / 32;
}

function animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / 2;
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05; //마우스 커서의 위치에 따라 카메라를 움직이자!
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    camera.position.z = 100;
    camera.lookAt(scene.position); //카메라는 계속 무대를 보고 있도록!
    requestAnimationFrame(animate);
    effect.render(scene, camera);
    for (const mixer of mixers) {
        mixer.update(deltaTime); //리스트에 저장된 애니메이션을 실행시켜러!
    }
}
animate();
setTimeout(() => { scene.remove(mesh) }, 6500);
setTimeout(() => {
    let fbxURL = "../model/Thriller Part 4.fbx"; //이스터에그...
    loader.load(fbxURL,
        function(object) {
            mixer = new THREE.AnimationMixer(object);
            mixers.push(mixer); //재생할 애니메이션 목록에 숨쉬는 모션 추가
            console.log(mixer);
            const action = mixer.clipAction(object.animations[0]);
            action.play();
            mesh = object;
            object.traverse(function(child) {

                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            });
            animate();
            scene.add(object);
            object.position.y = -110;

        }
    );
}, 80000); //게임 오버 페이지에서 오래 기다리면 춤추는 좀비가 나와요...ㅋㅋㅋ