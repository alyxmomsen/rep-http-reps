

class _Game {

    #units;
    #user;
    #ctx;
    #canvas;
    #keys;
    #atmosphere;

    timer = {
        _random:0 ,
        _n: 90 ,
        _last:Infinity ,
        _update() {
            const random = Math.floor(Math.random() * 1_000_000_000) ;
            this._random = random ;
        } ,
        isTrue(n = 0) {
            const _n = (n > 1_000_000_000) ? 1_000_000_000 : (n < 0) ? 0 : n ;
            this._update();
            console.log(this._random);
            if(this._random > _n) {
                return 1 ;
            }
            return 0;
        } ,
    } ;

    update(){

        if(this.timer.isTrue(999_000_000)) {

            this.#units.push(new _Unit());
        }

        this.#units.forEach(unit => {
            unit.update(null , this.#atmosphere);
        });

        this.#user.update(this.#keys , this.#atmosphere);
    }
    
    render() {
        this.#ctx.fillStyle = 'white' ;
        this.#ctx.fillRect(0 , 0 , 800 , 600);
        this.#user.render(this.#ctx);

        // console.log(this.#units.length);

        this.#units.forEach(unit => {
            unit.render(this.#ctx);
        });
    }

    constructor (ctx , canvas , keys) {

        this.#units = [] ;

        this.#atmosphere = {
            x:0 ,
            y:0.4 ,
        }

        this.#keys = keys ;

        if(ctx instanceof CanvasRenderingContext2D === false || canvas instanceof HTMLCanvasElement === false) {
            throw new Error('ctx is not ctx or canvas is not canvas') ;
        }

        this.#canvas = canvas ;

        this.#ctx = ctx ;

        this.#user = new _Unit();
    }
}

class _Unit {

    position;
    delta;    

    update(keys , atmosphere) {
        
        const deltadelta = 0.2 ;
        
        const max = 6 ;

        if(keys !== null) {

            if(keys['w'] === true && keys['s'] !== true) {
    
                const deltay = this.delta.y ;
                this.delta.y = this.#jump(deltay , max);
    
    
                // if(deltay - deltadelta > -max) {
    
                //     this.delta.y -= deltadelta ;
                // }
                // else if (deltay - deltadelta <= -max) {
                //     this.delta.y = -max ;
                // }
            }
            
            if(keys['s'] === true && keys['w'] !== true) {
    
                
                const deltay = this.delta.y ;
                
                if(deltay + deltadelta < max){
    
                    this.delta.y += deltadelta ;
                }
                else if (deltay + deltadelta >= max) {
                    this.delta.y = max ;
                }
            }
    
            if(keys['a'] === true && keys['d'] !== true) {
    
                const deltax = this.delta.x ;
    
                if(deltax - deltadelta > -max) {
    
                    this.delta.x -= deltadelta ;
                }
                else if (deltax - deltadelta <= -max) {
                    this.delta.x = -max ;
                }
            }
            
            if(keys['d'] === true && keys['a'] !== true) {
    
                
                const deltax = this.delta.x ;
                
                if(deltax + deltadelta < max){
    
                    this.delta.x += deltadelta ;
                }
                else if (deltax + deltadelta >= max) {
                    this.delta.x = max ;
                }
            }
        }

        this.delta.x += /* this.delta.x */ atmosphere.x ;
        this.delta.y = this.delta.y + atmosphere.y > max ? max : this.delta.y + atmosphere.y ;

        this.position.x += this.delta.x/*  + atmosphere.x */ ;

        if(this.position.y + this.delta.y >= 200) {
            this.delta.y = 0;
            this.position.y = 200 ;
        }
        else {
            this.position.y = this.position.y + this.delta.y;
        }

        // this.position.y = this.position.y + this.delta.y > 400 ? 400 : this.position.y +  this.delta.y/*  + atmosphere.y */ ; 
    }

    #jump (deltaY , max) {

        console.log({max});
        const _max = max ;
        const calculatedDelta = -_max; 

        return calculatedDelta * 1.5 ;
    }

    render(ctx) {
        
        if(ctx instanceof CanvasRenderingContext2D === false) {
            throw new Error('ctx is not ctx');
        }
        ctx.fillStyle = 'blue' ;
        ctx.fillRect(this.position.x , this.position.y , this.dimensions.w , this.dimensions.h);
    }

    constructor () {
        this.delta = {
            x:0,
            y:0 ,
        }
        this.position = new _Position(0 , 0);
        this.dimensions = new _Dimensions(100 , 100);
    }
}

class _Dimensions {
    
    constructor (w , h) {
        this.w = w ;
        this.h = h ;
    }
}

class _Position {


    constructor (x , y) {
        this.x = x ; 
        this.y = y
    }
}

module.exports = _Game ;