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
        camera.translateY(4);
        camera.translateZ(15);
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
        this.curAnim = 'idle';
        this.getPerspectiveCamera = mesh.getPerspectiveCamera;
        this.getMesh = () => this.mesh;
        this.moveState = {
            jump: false,
            forward: false,
            strafe:false
        }

        this.playerControl = (forward, strafe) => {

            if (forward == 0 && strafe == 0) {
                if(this.curAnim !== 'idle'){
                    this.playAction('idle', THREE.LoopRepeat);
                }
                delete this.moveData;
            } else {
                if(this.curAnim !== 'run'){
                    console.log('i should try to run')
                    this.tryWalk('run', THREE.LoopRepeat);
                }
                this.moveData = { forward, strafe, speed: 20 };
                
            }
        };

        this.move = (dt) => {
            this.translateZ(this.moveData.forward * dt * this.moveData.speed);
            this.translateX(this.moveData.strafe * dt * this.moveData.speed);
        }

        this.tryWalk = (action, loop) => {
            console.log('try to walk')
            const a = this.mixer.clipAction(this.anims[action]); // get request animation clip
            const b = this.mixer.clipAction(this.anims[this.curAnim]) // get cur anim clip
            //this.mixer.stopAllAction();
            this.curAnim = action;
            //b.stop();	
            //a.loop = loop;
            //a.play();
            //b.crossFadeTo(a, .5);
            a.loop = THREE.LoopRepeat;
            a.play();
        }

        this.playAction = (action, loop) => {
            const a = this.mixer.clipAction(this.anims[action]); // get request animation clip
            const b = this.mixer.clipAction(this.anims[this.curAnim]) // get cur anim clip
            
            this.curAnim = action;
            //a.fadeIn(.5);	
            //a.loop = loop;
            //a.play();
            //this.mixer.stopAllAction();
            b.fadeOut(.5); //crossFadeTo(a, .5);
            a.fadeIn(.5);
            a.play();
        }

        this.attack = (action) => {
            const a = this.mixer.clipAction(this.anims[action]); // get request animation clip
            //const b = this.mixer.clipAction(this.anims[this.curAnim]) // get cur anim clip
            
            this.curAnim = action;
            //a.fadeIn(.5);	
            a.loop = THREE.LoopOnce;
            //a.play();
            this.mixer.stopAllAction();
            //b.fadeOut(.5); //crossFadeTo(a, .5);
            //a.fadeIn(.5);
            a.play();
        }
        

        // Events
        const onMouseClick = (event) => {
            this.attack('punch1');
            //this.playerControl(0,0);
        },
        onDblMouseClick = (event) => {
            this.playAction('punch2');
            //this.playerControl(0,0);
        },
            onMouseMove = (event) => {
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0,
                movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            mesh.rotateCamera(movementY * mouseSpeed);
            this.rotateY(-movementX * mouseSpeed);
        },
            onKeyDown = ({ keyCode }) => {
                console.log(keyCode)
                let forward = (this.moveData !== undefined) ? this.moveData.forward : 0;
                let strafe = (this.moveData !== undefined) ? this.moveData.strafe : 0;
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
                console.log('run')
                let forward = (this.moveData !== undefined) ? this.moveData.forward : 0;
                let strafe = (this.moveData !== undefined) ? this.moveData.strafe : 0;
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

        
        document.addEventListener('click', onMouseClick, false);    
        document.addEventListener('dblclick', onDblMouseClick, false);    
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        this.dispose = () => {
            document.addEventListener('dblclick', onDblMouseClick, false);    
            document.addEventListener('click', onMouseClick, false);    
            document.removeEventListener('keydown', onKeyDown, false);
            document.removeEventListener('keyup', onKeyUp, false);
            document.removeEventListener('mousemove', onMouseMove, false);
        };
    }
}


