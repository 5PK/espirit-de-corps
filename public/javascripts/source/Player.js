import * as THREE from './libs/three.module.js';
import Keyboard from './Keyboard.js';

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
        this.keyboard = new Keyboard();
        this.direction = 'none';
        this.dt = 

        this.playerControl = (forward, strafe, keyCode) => {

            if (forward == 0 && strafe == 0) {
                this.direction = 'none';
                this.fadeCurAnimTo('idle');
                delete this.moveData;
            }
            else {
                this.moveData = { forward, strafe, speed: (forward < 0) ? 2 : 5 };

                if(this.keyboard.isKeyPressed('16') && forward > 0){
                    this.moveData.speed = 13;
                }
                
                //if its not the first press, exit
                if (this.keyboard.keydict[keyCode].firstpress == false) return;

                //forwards
                if (forward > 0 && strafe == 0) { 
                    if(this.direction == 'none'){
                        this.fadeCurAnimTo('walk'); 
                    }

                    if(this.direction == 'forward'){
                        console.log('fade to sprint');
                        this.fadeAnimFromTo('walk', 'forward_run');
                        this.direction = 'forward_sprint';
                        return; 
                    }

                    if(this.direction == 'forward_sprint'){
                        console.log('fade from sprint');
                        this.fadeAnimFromTo('forward_run', 'walk');
                    }

                    if(this.direction == 'fRight'){
                        console.log('blend from fRight to forwards');
                        //blend right to forward
                        //this.fadeAnimFromTo('right_walk','walk');
                        this.fadeAnimFromTo('right_walk', 'walk');
                    }
                    
                    if(this.direction == 'fLeft'){
                        //blend left to forward
                        console.log('blend from fLight to forwards');
                        //this.fadeAnimFromTo('left_walk', 'walk');
                        this.fadeAnimFromTo('left_walk', 'walk');
                    }
                    this.direction = 'forward';
                    return; 
                }

                //backwards
                if (forward < 0 && strafe == 0) { 
                    this.fadeCurAnimTo('backward'); 
                    this.direction = 'backward';
                    return; 
                }

                //right
                if (strafe < 0 && forward == 0) { 
                    console.log('move right');
                    this.fadeCurAnimTo('right_walk'); 
                    this.direction = 'right';
                    return; 
                }

                //left
                if (strafe > 0 && forward == 0) { 
                    console.log('move left');
                    //this.fadeCurAnimTo('left_walk'); 
                    this.fadeCurAnimTo('left_walk');
                    this.direction = 'left';
                    return; 
                }

                //forward left
                if (forward > 0 && strafe > 0) { 
                    console.log('go f left')

                    if(this.direction = 'none' || this.direction == 'forward'){
                        this.blendActions('walk', 'left_walk')
                    }

                    this.direction = 'fLeft';
                    
                }

                //forward right
                if (forward > 0 && strafe < 0) {
                    console.log('go f right')
                    
                    console.log(this.direction);
                    if(this.direction = 'none' || this.direction == 'forward'){
                        this.blendActions('walk', 'right_walk')
                    }

                    if(this.direction = 'forward_sprint'){
                        console.log('f-sprint to fr-sprint');
                        //this.blendActions('walk', 'right_walk')
                        //this.blendActions('forward_run', 'right_run')
                        this.fadeCurAnimWith('right_run');
                        
                        
                    }
                    
                    this.direction = 'fRight';
                }

                //backward left
                if (forward < 0 && strafe > 0) { 
                    console.log('go back l')
                    if(this.direction == 'left'){
                        //TODO blend from left to idle, then to a blend of left and back
                        this.fadeAnimFromTo('left_walk', 'idle'); 
                        this.blendActions('right_walk', 'backward')
                    }
                    
                    if(this.direction == 'backward'){
                        this.blendActions('right_walk', 'backward')
                    }
                    this.direction == 'bLeft' 
                    return; 
                }

                //backward right
                if (forward < 0 && strafe < 0) {
                    console.log('go back r')
                    if(this.direction == 'right'){
                        //TODO blend from right to idle, then to a blend of right and back
                        this.fadeAnimFromTo('right_walk', 'idle'); 
                        this.blendActions('left_walk', 'backward')
                    }
                    
                    if(this.direction == 'backward'){
                        this.blendActions('left_walk', 'backward')
                    }
                    this.direction == 'bRight' 
                    return; 
                }


            }
        };

        this.move = (dt) => {
            this.translateZ(this.moveData.forward * dt * this.moveData.speed);
            this.translateX(this.moveData.strafe * dt * this.moveData.speed);
        }

        this.fadeCurAnimWith = (action) => {
            console.log('blend together', this.curAnim, action);
            var newAnim = this.mixer.clipAction(this.anims[action]); 
            var curAnim = this.mixer.clipAction(this.anims[this.curAnim]) 
            this.mixer.stopAllAction();
            this.curAnim = action;
            

            newAnim.play();
            curAnim.play();
        }


        this.fadeAnimFromTo = (from, to) => {
            console.log('blend from to', from, to);
            var a = this.mixer.clipAction(this.anims[from]); 
            var b = this.mixer.clipAction(this.anims[to]) 
            this.mixer.stopAllAction();
            this.curAnim = to;
            a.play();
            a.crossFadeTo(b, .5);
            b.play();
        }


        this.fadeCurAnimTo = (action) => {

            var a = this.mixer.clipAction(this.anims[action]); // get request animation clip
            var b = this.mixer.clipAction(this.anims[this.curAnim]) // get cur anim clip
            this.mixer.stopAllAction();
            this.curAnim = action;
            b.play();
            b.crossFadeTo(a, .75);
            a.play();
        }

        this.blendActions = (action1, action2) => {
            console.log('blend actions:', action1, action2)
            var a = this.mixer.clipAction(this.anims[action1]); // get request animation clip
            var b = this.mixer.clipAction(this.anims[action2]) // get cur anim clip
            this.mixer.stopAllAction();
            //a.fadeIn(.5);
            b.fadeIn(.2);
            a.play();
            b.play();
            //a.fadeOut(0.5)
            this.curAnim = action1;
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
                this.fadeCurAnimTo('punch2');
                //this.playerControl(0,0);
            },
            onMouseMove = (event) => {
                const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0,
                    movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                mesh.rotateCamera(movementY * mouseSpeed);
                this.rotateY(-movementX * mouseSpeed);
            },
            onKeyDown = ({ keyCode }) => {

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

                this.playerControl(forward, strafe, keyCode.toString());
            },
            onKeyUp = ({ keyCode }) => {
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
                console.log(forward, strafe)
                this.playerControl(forward, strafe, keyCode.toString());

            };


        //document.addEventListener('click', onMouseClick, false);    
        //document.addEventListener('dblclick', onDblMouseClick, false);    
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        this.dispose = () => {
            //document.addEventListener('dblclick', onDblMouseClick, false);    
            document.addEventListener('click', onMouseClick, false);
            document.removeEventListener('keydown', onKeyDown, false);
            document.removeEventListener('keyup', onKeyUp, false);
            document.removeEventListener('mousemove', onMouseMove, false);
        };
    }
}


