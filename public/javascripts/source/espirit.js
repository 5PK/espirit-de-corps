//import * as THREE from './libs/three.js';
import {
  PointerLockControls

} from "./libs/PointerLock.js";

import PlayerControls from "./libs/Player.js";
import { FBXLoader } from './libs/FBXLoader.js';

var scene, camera, cameras, cameraIndex, renderer, controls, clock, player, mixer, actions, sun, plane;
var keyboard;

init();

function subclip(sourceClip, name, startFrame, endFrame, fps) {
  fps = fps || 30;

  var clip = sourceClip.clone();
  clip.name = name;

  var tracks = [];

  for (var i = 0; i < clip.tracks.length; ++i) {
    var track = clip.tracks[i];
    var valueSize = track.getValueSize();

    var times = [];
    var values = [];

    for (var j = 0; j < track.times.length; ++j) {
      var frame = track.times[j] * fps;

      if (frame < startFrame || frame >= endFrame) continue;

      times.push(track.times[j]);

      for (var k = 0; k < valueSize; ++k) {
        values.push(track.values[j * valueSize + k]);
      }
    }

    if (times.length === 0) continue;

    track.times = THREE.AnimationUtils.convertArray(times, track.times.constructor);
    track.values = THREE.AnimationUtils.convertArray(values, track.values.constructor);

    tracks.push(track);
  }

  clip.tracks = tracks;

  // find minimum .times value across all tracks in the trimmed clip
  var minStartTime = Infinity;

  for (var i = 0; i < clip.tracks.length; ++i) {
    if (minStartTime > clip.tracks[i].times[0]) {
      minStartTime = clip.tracks[i].times[0];
    }
  }

  // shift all tracks such that clip begins at t=0

  for (var i = 0; i < clip.tracks.length; ++i) {
    clip.tracks[i].shift(- 1 * minStartTime);
  }

  clip.resetDuration();

  return clip;
}

function init() {
  const assetPath = 'https://niksfiles.s3.eu-west-2.amazonaws.com/';

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

  const anims = [
    { start: 30, end: 59, name: "backpedal", loop: true },
    { start: 489, end: 548, name: "idle", loop: true },
    { start: 768, end: 791, name: "run", loop: true },
    { start: 839, end: 858, name: "shuffleLeft", loop: true },
    { start: 899, end: 918, name: "shuffleRight", loop: true },
    { start: 1264, end: 1293, name: "walk", loop: true }

  ];

  const anims2 = [
    { start: 30, end: 59, name: "standing_walk_back", loop: true },
    { start: 489, end: 548, name: "idle", loop: true },
    { start: 768, end: 791, name: "standard_run", loop: true },
    { start: 839, end: 858, name: "left_strafe_walking", loop: true },
    { start: 899, end: 918, name: "right_strafe_walking", loop: true },
    { start: 1264, end: 1293, name: "walking", loop: true }

  ];


    const loader = new THREE.GLTFLoader();
    loader.setPath(assetPath)
    loader.load('fred.glb', object => {
      mixer = new THREE.AnimationMixer(object.scene);
      mixer.addEventListener('finished', e => {
        if (e.action.next != undefined) playAction(e.action.next);
      });
      object.scene.children[0].rotation.x = 0;
      actions = {};
  
      object.scene.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
  
      anims.forEach(anim => {
        const clip = subclip(object.animations[0], anim.name, anim.start, anim.end);
        const action = mixer.clipAction(clip);
        if (!anim.loop) {
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
        }
        if (anim.next != undefined) action.next = anim.next;
        actions[anim.name] = action;
      });
  
  
      player = new PlayerControls({
        mixer: mixer,
        actions: actions,
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
      })
      sun.target = player;
      object.scene.children[0].scale.set(0.02, 0.02, 0.02);
      player.add(object.scene.children[0]);
  
  
      player.playAction('idle');
  
      camera = player.getPerspectiveCamera();
      scene.add(player);
      update();
    });


  window.addEventListener('resize', resize, false);
}




function update() {
  requestAnimationFrame(update);
  renderer.render(scene, camera);


  const dt = clock.getDelta();
  mixer.update(dt);
  //player.animate(dt, plane)

  player.animate2(dt);

  const pos = player.position.clone();
  pos.y += 3;

}

function playAction(name) {
  if (player.userData.actionName == name) return;
  const action = actions[name];
  player.userData.actionName = name;
  mixer.stopAllAction();
  action.reset();
  action.fadeIn(0.5);
  action.play();
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}