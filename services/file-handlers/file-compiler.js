const {} = require('fs');

class FileCompiler {

    #items;

    async getFiles () {
        
        for (const [type , subject] of this.#items) {

            console.log({type ,subject});

        }
    }

    async compileByType (type) {

        const typeBundles = this.#items.get(type);

        if(typeBundles === undefined) {
            console.log('no bundles'.toUpperCase());
            return;
        }

        for (const [_type , bundle] of this.#items) {

            if(type === _type) {
                continue ;
            }

            for (const [subj_id , subjectBundle] of typeBundles ) {

                if(bundle.targetId !== subj_id) {
                    continue ;
                }

                subjectBundle[bundle.name] = bundle.body                
            } 

        }

    }

    async gulp (payload) {

        const {type ,id , targetId , inputDataName , body} = payload ;

        if(this.#items.has(type) === false) {
            this.#items.set(type , new Map());
        }
        
        const typeData = this.#items.get(type);

        typeData.set(id , {
            inputDataName ,
            body ,
            targetId ,
        });
    }

    constructor () {
        this.#items = new Map();
    }
}

module.exports = FileCompiler ;