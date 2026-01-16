const { createWriteStream, createReadStream } = require('fs');
const _log = require('../../global-utils/log');
const { Readable } = require('stream');

class FileCompiler {

    #items;

    static UploadData (items) {

        const {type , id , name , targetId , body} = bundle ;
        _log({type , id , name , targetId , body});
    }

    async uploadCompiledItems () {

        const files = await this.compileFiles();

        const mimes = {
            'video/x-matroska':() => {
                
                return ;
            } ,
            'audio/mpeg':() => {
                
                return ;
            } ,
            'text/plain':() => {
                
                return ;
            } ,
        }

        for (const [id , bundle] of Object.entries(files)) {

            let newFileName = '' ;

            let ext = null ;

            const originalFileName = bundle.originalFileName ;
            if(originalFileName !== undefined) {
                const match = originalFileName.match(/\.[\w\d]+$/);
                if(match !== null) {
                    
                    ext = match[0] ;
                } 
            }

            const title = bundle.title || null ;

            if(title && ext) {
                const readStream = Readable.from(bundle.body);
                const writeStream = createWriteStream('./upload/' + title + '.' + Date.now() + ext);
                readStream.pipe(writeStream);
            }

            console.log({ext});

        }

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

    async compileFiles () {
        
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

        return files ;
    
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