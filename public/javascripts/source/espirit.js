//import * as THREE from './libs/three.js';
import {
  PointerLockControls

} from "./libs/PointerLock.js";

import PlayerControls from "./libs/Player.js";
import { FBXLoader } from './libs/FBXLoader.js';

var scene, camera, renderer, controls, clock, player, plane, sun;
const _assetPath = '/assets/eng_soldier';
var _anims = ["idle", "walk", "backward", "left_walk", "right_walk"];

var _assets = [];
init();


function loadNextAnim(loader) {
  let anim = _anims.pop();
  loader.load(`${_assetPath}/${anim}.fbx`, function (object) {
    player.anims[anim] = object.animations[0];
    if (_anims.length > 0) {
      loadNextAnim(loader);
    }
  });
}

function init() {

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  let col = 0x605050;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(col);
  scene.fog = new THREE.Fog(col, 10, 100);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  camera.position.set(0, 4, -7);
  camera.lookAt(0, 1.5, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.position.set(1, 10, 6);
  light.castShadow = true;
  const shadowSize = 5;
  light.shadow.camera.top = shadowSize;
  light.shadow.camera.bottom = -shadowSize;
  light.shadow.camera.left = -shadowSize;
  light.shadow.camera.right = shadowSize;
  scene.add(light);
  sun = light;

  //mouse lock
  controls = new PointerLockControls(document.body);

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {

    controls.lock();

  }, false);

  controls.addEventListener('lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

  });

  controls.addEventListener('unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

  });


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const planeGeometry = new THREE.PlaneBufferGeometry(200, 200);
  const planeMaterial = new THREE.MeshStandardMaterial();
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  const grid = new THREE.GridHelper(200, 80);
  scene.add(grid);

  _anims.forEach( function(anim){ _assets.push(`${_assetPath}/${anim}.fbx`)});

  const loader = new FBXLoader();
  loader.load(`${_assetPath}/idle.fbx`, function (object) {
    console.log(object)
    object.mixer = new THREE.AnimationMixer(object);
    object.name = "Character";


    player = new PlayerControls({
      clock: clock,
      directionVelocity: 3,
      distance: 4,
      far: 1024,
      fov: 60,
      gravity: 9.81 / 2,
      height: .5,
      initialY: 0,
      jumpVelocity: 1,
      maxGravity: 54 / 2,
      mouseSpeed: 0.002
    });

    //player.root = object.mixer.getRoot();
    player.mixer = object.mixer;

    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    object.scale.set(0.03, 0.03, 0.03);

    player.add(object);

    scene.add(player);
    player.anims = {};
    player.anims.idle = object.animations[0];

    camera = player.getPerspectiveCamera();

    loadNextAnim(loader)

    console.log(player.anims);
    player.playAction('idle')
    update();

  });

  window.addEventListener('resize', resize, false);
}

function update() {
  requestAnimationFrame(update);

  const dt = clock.getDelta();

  if (player.moveData !== undefined) {
    player.move(dt);
  }

  if (player.mixer!=undefined){
    player.mixer.update(dt);
  }
		

    
  renderer.render(scene, camera);
  


}



function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}