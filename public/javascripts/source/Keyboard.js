export default class Keyboard {
    constructor() {
        this.keydict = {};
        this.keys = {};

        for (var i = 0; i < 200; i++) {

            this.keydict[i.toString()] = {pressed: false, firstpress: true};
        }

        this.isKeyPressed = (key) => { return this.keydict[key].pressed };
        this.isFirstPress = (key) => { return this.keydict[key].firstpress };

        // Events
        const onKeyDown = ({ keyCode }) => {
                if(this.keydict[keyCode.toString()].pressed == false){
                    this.keydict[keyCode.toString()].pressed = true;
                }else{
                    this.keydict[keyCode.toString()].firstpress = false;
                }
            },
            onKeyUp = ({ keyCode }) => {
                this.keydict[keyCode.toString()].pressed = false;
                this.keydict[keyCode.toString()].firstpress = true;
            };

        // register listseners
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        
        this.dispose = () => {
            document.removeEventListener('keydown', onKeyDown, false);
            document.removeEventListener('keyup', onKeyUp, false);
        };
    }
}
