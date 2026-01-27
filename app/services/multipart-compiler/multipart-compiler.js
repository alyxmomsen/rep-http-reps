require('fs');

class MultipartCompiler {


    
    gulpOnePart(data) {
        
        console.log({data});
        
    }
    
    #files;

    constructor () {

        const types = [
            'subj' , 'meta'
        ];

        this.#files = Map();

        types.forEach(type => {
            this.#files.set(type , new Map()) ;
        });
    }
}