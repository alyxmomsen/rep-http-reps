const _findIndex = require('../../utils/find-index');

require('fs');

class MultipartCompiler {

    async reset () {
        
        this.#files = new Map();
        for (const type of this.#types) {
            this.#files.set(type);
        }
    }

    async gulpOnePart(partBuffer) {

        const {body , headers} = await splitPart(partBuffer);

        const {contentDisposition , contentType} = await this.#parseHeaders(headers.toString('utf-8'));

        if(!contentDisposition) throw new Error("x1b[31mno content-disposition in form data headerx1b[0m".toUpperCase());

        const { name , filename } = await this.#parseContentDisposition(contentDisposition);

        
        
        console.log({body , name , filename , contentType});
        
    }
    
    async compile () {

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
    #types;

    constructor () {

        const types = [
            'subj' , 'meta'
        ];

        this.#types = types ;

        this.#files = new Map();

        types.forEach(type => {
            this.#files.set(type , new Map()) ;
        });
    }
}

module.exports  = MultipartCompiler ;

async function partTypeMatcher(params) {
    
}

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