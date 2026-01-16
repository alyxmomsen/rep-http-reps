const {} = require('fs');
const _log = require('../../global-utils/log');

class FileCompiler {

    #items;

    static UploadData (items) {

        const {type , id , name , targetId , body} = bundle ;
        _log({type , id , name , targetId , body});
    }

    uploadCompiledItems () {



    }

    static ParseNameInput (nameDataString) {

        const [subject , target] = nameDataString.split('--');

        const [_type , _id , _name] = subject.split('.') ;

        const type = _type || null
        const id = _id || null
        const name = _name || null
        const targetId = target || null ;

        return {
            type ,
            id ,
            name ,
            targetId ,
        }
    }

    async getFiles () {
        
        const files = {} ;

        const resolvers = {
            'file':{
                handler:(typeEntries) => {
                    
                    for (const [name , bunldle] of Object.entries(typeEntries)) {
                        
                        files[name] = bunldle ;
                    }
                } ,
            } ,
            'caption':{
                handler:(typeEntries) => {

                    for (const [keyname , bundle] of Object.entries(typeEntries)) {

                        const file = files[bundle.targetId] ;

                        if(file === undefined) {
                            continue ;
                        }

                        file[bundle.inputDataName] = bundle ? bundle.body.toString() : null ;
                    }
                } ,
            } ,
            'option':{
                handler:(typeEntries) => {
                    
                    for (const [keyname , bundle] of Object.entries(typeEntries)) {
        
                        const file = files[bundle.targetId] ;

                        if(file === undefined) {
                            continue ;
                        }
        
                        file[bundle.inputDataName] = bundle ? bundle.body.toString() : null ;
                    }
                } ,
            } ,
        }


        for (const [type , typeEntryies] of Object.entries(this.#items)) {

            const resolverlike = resolvers[type] ;

            if(resolverlike === undefined) continue;

            resolverlike.handler(typeEntryies);
 
        }

        _log({files});
    
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

        const {type ,id , targetId , inputDataName , body , originalFileName , fileContentType} = payload ;
        
        if(this.#items[type] === undefined) {
            this.#items[type] = {}
        }
        
        const typeItems = this.#items[type] ;
        
        typeItems[id] = {
            inputDataName ,
            body ,
            targetId ,
            originalFileName ,
            fileContentType ,
        }
    }

    constructor () {
        // this.#items = new Map();
        this.#items = {};

    }
}

module.exports = FileCompiler ;