import * as THREE from './three.module.js';

class PlayerCamera extends THREE.Object3D {
    // Third Person Camera
    constructor({
        distance,
        far,
        fov
    }, height) {
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        const PI_2 = Math.PI / 2;

        super();
        camera.translateZ(20);
        this.add(camera);
        this.rotateZ(Math.PI);
        this.getPerspectiveCamera = () => camera;
        this.rotateVertically = (radX) => {
            const min = Math.min(PI_2, this.rotation.x + radX);
            this.rotation.x = Math.max(-PI_2, min);
        };
    }
}

class PlayerSubject extends THREE.Mesh {
    constructor({
        height,
        initialY,
        ...cameraProps
    }) {
        const camera = new PlayerCamera(cameraProps, height);

        super();
        this.rotateX(Math.PI);
        this.add(camera);

        this.getPerspectiveCamera = camera.getPerspectiveCamera;
        this.rotateCamera = camera.rotateVertically;
    }
}

export default class PlayerControls extends THREE.Object3D {
    constructor({
        mixer,
        clock,
        directionVelocity,
        gravity,
        jumpVelocity,
        maxGravity,
        mouseSpeed,
        ...meshProps
    }) {
   
        var mesh = new PlayerSubject(meshProps);


        super();

        this.add(mesh);

        this.getPerspectiveCamera = mesh.getPerspectiveCamera;
        this.getMesh = () => mesh;
        this.playerControl = (forward, strafe) => {
            if (forward == 0 && strafe == 0) {
                delete this.userData.move;
            } else {
                if (this.userData.move) {
                    this.userData.move.forward = forward;
                    this.userData.move.strafe = strafe;
                } else {
                    this.userData.move = { forward, strafe, time: clock.getElapsedTime(), speed: 1 };
                }
            }
        };

        this.animate = (dt) => {
            if (this.userData.move !== undefined) {
                if (this.userData.move.forward > 0 && this.userData.move.speed < 10) this.userData.move.speed += 0.1;
                this.translateZ(this.userData.move.forward * dt * this.userData.move.speed);
                this.translateX(this.userData.move.strafe * dt * this.userData.move.speed);

                //Update actions here
               
            } else {
                // idle
            }
        };

        this.playAction = (action) => {
            const anim = this.anims[name];
            const action = this.mixer.clipAction( anim,  this.root );
            this.mixer.stopAllAction();
            this.player.action = name;
            action.fadeIn(0.5);	
            action.play();
        }

        // Events
        const onMouseMove = (event) => {
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0,
                movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            mesh.rotateCamera(movementY * mouseSpeed);
            this.rotateY(-movementX * mouseSpeed);
        },
            onKeyDown = ({ keyCode }) => {

                let forward = (this.userData.move !== undefined) ? this.userData.move.forward : 0;
                let strafe = (this.userData.move !== undefined) ? this.userData.move.strafe : 0;
                let jump = 0;

                switch (keyCode) {
                    case 32: // space
                        jump = 0;
                        break;
                    case 37: // left
                    case 65: // a
                        strafe = 1;
                        break;
                    case 38: // up
                    case 87: // w
                        forward = 1;
                        break;
                    case 39: // right
                    case 68: // d
                        strafe = -1;
                        break;
                    case 40: // down
                    case 83: // s
                        forward = -1;
                        break;
                    default:
                        break;
                }

                this.playerControl(forward, strafe);
            },
            onKeyUp = ({ keyCode }) => {

                let forward = (this.userData.move !== undefined) ? this.userData.move.forward : 0;
                let strafe = (this.userData.move !== undefined) ? this.userData.move.strafe : 0;
                let jump = 0;

                switch (keyCode) {
                    case 32: // space
                        jump = 0;
                        break;
                    case 37: // left
                    case 65: // a
                        strafe = 0;
                        break;
                    case 38: // up
                    case 87: // w
                        forward = 0;
                        break;
                    case 39: // right
                    case 68: // d
                        strafe = 0;
                        break;
                    case 40: // down
                    case 83: // s
                        forward = 0;
                        break;
                    default:
                        break;
                }

                this.playerControl(forward, strafe);

            };
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        this.dispose = () => {
            document.removeEventListener('keydown', onKeyDown, false);
            document.removeEventListener('keyup', onKeyUp, false);
            document.removeEventListener('mousemove', onMouseMove, false);
        };
    }
}


