
class HTMLInputsDataCompiler {

    #parseInputName (inputname) {

        const [type , subjId] = inputname.split('.');

        return {
            type , 
            subjId ,
        }

    }

    gulpOne(inputname , filename , contentType , body) {
        console.log({inputname , filename , contentType ,body});


        const resolver = {
            data:(id , body) => {
                const file = this.#files[id] ;

                if(file === undefined) {
                    this.#files[id] = {};
                }

                this.file[id].body = body ;
                
            } ,
            attr:(id , body , attrname) => {

                const file = this.#files[id] ;
    
                if(file === undefined) {
                    this.#files[id] = {};
                }

                file[attrname] = body ;
    
            } ,
        }

        const {type , subjId} = this.#parseInputName(inputname);

        resolver[type](subjId , body);

    }

    #files ;

    constructor () {

        this.#files = new Map();
    }
}

module.exports = HTMLInputsDataCompiler ;

async function _fileCompiler (params) {
    
}