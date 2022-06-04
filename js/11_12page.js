import { loadScene, PickHelper, playAudio, camera, scene, setCookie, getCookie, zombieIdleLoad, zombieLoad, zombieDirect, zombieMove, updateZombie } from "./main.js";
import * as THREE from 'three';

camera.rotation.set();
loadScene('scene4', -0.138, 3.5, 0);

var noYouCant = document.getElementById('accessfail');
var container = document.getElementById('game'); //문서에서 game ID를 지닌 객체,게임이 들어가는 영역
var info = document.getElementById('interact'); //문서에서 상호작용 가능을 알릴 객체
let scream = 0;
const pickCamera = camera;
const pickScene = scene;
const items = ['null'];
const pickHelper = new PickHelper(items); //상호작용 가능한 물체가 많아 items 배열에 저장하지 않고 본 스크립트에서 관할...
const keyStates = {};
const clock = new THREE.Clock(); //시계를 생성한다.

zombieIdleLoad();

if (getCookie('4stage') != 'clear') {
    noYouCant.style.display = 'block';
}