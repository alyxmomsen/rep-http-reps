require('fs');
const _findIndex = require('../../utils/find-index');
const metaTypeHandler = require('./services/utils/meta-type-handler/meta-type-handler');
const subjectTypeHandler = require('./services/utils/subject-type-handler/subject-type-handler.js');
class MultipartCompiler {

    async reset () {
        
        // this.#files = new Map();
        // for (const type of this.#types) {
        //     this.#files.set(type);
        // }

        this.#files = new Map();
    }

    async gulpOnePart(partBuffer) {

        const {body , headers} = await splitPart(partBuffer);

        const {contentDisposition , contentType} = await this.#parseHeaders(headers.toString('utf-8'));

        if(!contentDisposition) throw new Error("x1b[31mno content-disposition in form data headerx1b[0m".toUpperCase());

        const { name:nameAttr , filename } = await this.#parseContentDisposition(contentDisposition);

        const semantic = await this.#parseSemanticData(nameAttr);
        
        await this.#concatWithFiles({body , semantic , filename ,contentType});
                
    }
    
    async getCompiledItems () {
        return this.#files ;
    }

    async #concatWithFiles (data) {

        console.log('\x1b[33mstart concat\x1b[0m');

        const {body , semantic , filename , contentType} = data; 

        const { type: partSemanticType, id, name, target} = semantic ;

        const partTypeMatchers = [
            await partTypeMatcherFactory('subj' , {...{
                context:{
                    files:this.#files , queue:this.#queue ,
                } ,
                payload: {
                    body , semantic , filename , contentType
                }
            }} , 
                subjectTypeHandler
            ) , 
            await partTypeMatcherFactory('meta' , {...{
                context:{
                    files:this.#files , queue:this.#queue ,
                } ,
                payload: {
                    body , semantic , filename , contentType ,
                }
            }} , metaTypeHandler ) ,
        ] ;

        for (const matcher of partTypeMatchers) {

            const handlerLike = await matcher(partSemanticType);
            if(handlerLike === null) continue ;
            await handlerLike();

        }
    }


    async #parseSemanticData (nameAttr) {

        const [subject , target] = nameAttr.split('--');

        const [type , id , name] = subject.split('.');

        return {
            type:type || null , id:id || null ,
            name:name || null , target: target || null ,
        }
    }

    async #parseContentDisposition (contentDisposition) {

        const namematch = contentDisposition.match(/name="([^"]+)"/);
        const filenamematch = contentDisposition.match(/filename="([^"]+)"/);

        return {
            name: namematch ? namematch[1] : null , 
            filename: filenamematch ? filenamematch[1] : null , 
        }

    }

    async #parseHeaders (headersString) {

        const headers = await this.#splitHeaders(headersString);

        return {
            contentDisposition:headers['content-disposition'] || null ,
            contentType:headers['content-type'] || null ,
        }

    }

    async #splitHeaders (headersString) {

        const separator = '\r\n' ;

        const rows = headersString.split(separator);

        const headers = {} ;

        rows.forEach(row => {
            const [key , value] = row.split(': ');
            if(key && value) {
                headers[key.toLowerCase()] = value ;
            }
        });

        return headers ;
    }
    
    #files;
    #queue;
    // #types;

    constructor () {

        this.#queue = [] ;

        // const types = [
        //     'subj' , 'meta'
        // ];

        // this.#types = types ;

        this.#files = new Map();

        // types.forEach(type => {
        //     this.#files.set(type , new Map()) ;
        // });
    }
}

module.exports  = MultipartCompiler ;


async function splitPart (partBuffer) {
   
    const separatorstring = '\r\n\r\n' ;

    const separatorBuffer = Buffer.from(separatorstring);

    const separatorIndex = await _findIndex(partBuffer , separatorBuffer);

    if(separatorIndex === -1) throw new Error('incorrect part'.toUpperCase());

    const headers = partBuffer.subarray(0 , separatorIndex);
    let bodyBufferEndIndex = partBuffer.length ;
    if(partBuffer[bodyBufferEndIndex - 2] === 0x0d && partBuffer[bodyBufferEndIndex - 1] === 0x0a) {
        bodyBufferEndIndex -= 2;
    }

    const body = partBuffer.subarray(separatorIndex + separatorBuffer.length , bodyBufferEndIndex);

    return {
        headers , 
        body ,
    }
}

async function partTypeMatcherFactory (typeMatcherString  , context , handler) {
    
    return async (typeTestString) => {

        if(typeTestString === typeMatcherString) {

            return async () => {
    
                await handler(context);
            }
        }

        return null ;
    }
}