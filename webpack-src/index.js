
const _Game = require('./module');

window.addEventListener("DOMContentLoaded" , () => {

    const keys = {} ;

    window.addEventListener('keydown' , (e) => {
        const keyname = e.key ;
        if(keys[keyname] === true) {
        
            return ;
        }
        
        console.log('key down' , keys[keyname] , keyname);

        keys[keyname] = true ;
    })
    
    window.addEventListener('keyup' , (e) => {
        console.log('key up');
        keys[e.key] = false ;
    })

    const canvasHTML = document.getElementById('canvas');

    console.log('hello world');
    
    if(canvasHTML instanceof HTMLCanvasElement === false) {
        return ;
    }

    console.log('foo');
    
    const aspectratio = {
        width:16 ,
        height:9,
    }
    
    canvasWidht = 800 ;
    
    canvasHTML.width = canvasWidht ;
    canvasHTML.height = canvasWidht * (aspectratio.height / aspectratio.width) ;
    
    const ctx2d = canvasHTML.getContext("2d") ;
    
    if(ctx2d instanceof CanvasRenderingContext2D === false) {
        return ;
    }

    const game = new _Game(ctx2d , canvasHTML , keys);

    const update = () => {

        game.update(keys);
        game.render(ctx2d);
    
        requestAnimationFrame(update);
    }

    update();
});
