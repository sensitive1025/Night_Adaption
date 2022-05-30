page = document.getElementById('gamepage'); //문서에서 gamepage ID를 지닌 객체 container가 들어가는 영역
container = document.getElementById('game'); //문서에서 game ID를 지닌 객체, 게임이 들어가는 영역

const frustumSize = 1000;
let windowHalfX = container.offsetWidth / 2;
let windowHalfY = container.offsetHeight / 2;
let mouseX = 0;
let mouseY = 0;
const aspect = container.offsetWidth / container.offsetHeight;

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

var cubeGeometry = new THREE.BoxGeometry(100, 100, 100); //주인공! 화면에 보일 정육면체의 구조를 생성
var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee }); //화면에 보일 정육면체의 질감을 생성
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial); //정육면체 생성
cube
    .position
    .set(0, 0);

var spotLight = new THREE.SpotLight(0xFFFFFF); //조명! 한 부분을 동그랗게 비춰주는 스포트라이트
spotLight.position.set(100, 200, 300);

scene.add(cube);
scene.add(spotLight);

const effect = new THREE.AsciiEffect(renderer, '.|VNM', { invert: true }); //렌더링한 화면에 아스키아트 효과를 씌워주자!
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

function onPointerMove(event) { //마우스 커서의 위치를 받아오자!

    if (event.isPrimary === false)
        return;

    mouseX = (event.clientX - windowHalfX) / 8;
    mouseY = (event.clientY - windowHalfY) / 8;
}

function animate() {
    camera.position.x += (mouseX - camera.position.x) * 0.05 + 4;
    camera.position.y += (-mouseY - camera.position.y) * 0.05 + 4; //마우스 커서의 위치에 따라 카메라를 움직이자!
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    camera.position.z = 100;
    camera.lookAt(scene.position); //카메라는 계속 무대를 보고 있도록!
    requestAnimationFrame(animate);
    effect.render(scene, camera);
}
animate(); //프레임마다 렌더러, 조명, 큐브, 카메라를 꾸준히 로딩하면 애니메이션이 만들어진다!