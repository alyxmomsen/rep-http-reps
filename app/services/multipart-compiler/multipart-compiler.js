require('fs');
const _findIndex = require('../../utils/find-index');
const semanticParser = require('./services/semantic-parser/semantic-parser.js');
const metaTypeHandler = require('./services/semantic-parser/utils/handlers/meta-type-handler.js');
const subjectTypeHandler = require('./services/semantic-parser/utils/handlers/subject-type-handler.js');
class MultipartCompiler {

    async gulpOnePiece (rawPieceBuffer) {

        const {headerspart , bodypart} = await this.#splitRawPiece(rawPieceBuffer);

        const { contentDisposition: contentDispositionRawString , contentType } = await this.#parseHeadersPart(headerspart.toString('utf-8'));

        const { name: contentDispName , filename: contentDispFilename } = await this.#parseContentDisposition(contentDispositionRawString);

        const semantic = await semanticParser(contentDispName);

        console.log({semantic , filename: contentDispFilename , contentType , bodypart});

        const matcherFactory = await initSemanticTypeMatcherFactory({files:this.#files , queue:this.#queue});

        const matchers = [
            await matcherFactory('subj' , subjectTypeHandler) ,
            await matcherFactory('meta' , metaTypeHandler) ,
        ];
        
        const payload = {
            filename:contentDispFilename ,
            semantic , 
            contentType , 
            body:bodypart ,
        }

        for (const matcher of matchers) {

            const handler = await matcher(semantic.type);
            if(handler === null) continue ;
            await handler(payload);
        }

        console.log({files:this.#files , queue:this.#queue});
    }

    async #aply () {

    }

    async #parseContentDisposition (contentDispositionString) {

        const namematch = contentDispositionString.match(/name="([^"]+)"/);
        const filenamematch = contentDispositionString.match(/filename="([^"]+)"/);

        return {
            name:namematch ? namematch[1] : null ,
            filename:filenamematch ? filenamematch[1] : null ,
        }
    }

    async #parseHeadersPart (rawHeaderString) {

        const headers = {} ;

        const headersSeparator = '\r\n' ;

        const rawHeadersRows = rawHeaderString.split(headersSeparator);

        rawHeadersRows.forEach(row => {
            
            const [ key , value ] = row.split(": ");
            if(key && value) {
                headers[key.toLowerCase()] = value ;
            }
        });

        return {
            contentType:headers['content-type'] || null ,
            contentDisposition:headers['content-disposition'] || null ,
        }

    }

    async #splitRawPiece (rawPieceBuffer) {

        const separatorBuffer =  Buffer.from('\r\n\r\n') ;

        const separatorIndex = await _findIndex(rawPieceBuffer , separatorBuffer);

        
        if(separatorIndex === -1) {
            throw new Error('incorrect piece'.toUpperCase()) ;
        }

        console.log({separatorIndex});
        
        const headerspart = rawPieceBuffer.subarray(0 , separatorIndex);
        let bodyBufferEndIndex = rawPieceBuffer.length ;

        if(rawPieceBuffer[bodyBufferEndIndex - 2] === 0x0d && rawPieceBuffer[bodyBufferEndIndex - 1] === 0x0a) {
            bodyBufferEndIndex -= 2 ;
        }

        const bodypart = rawPieceBuffer.subarray(separatorIndex + separatorBuffer.length , bodyBufferEndIndex) ;

        return {
            headerspart , 
            bodypart ,
        }
    }

    #files;
    #queue ;

    constructor () {
        this.#files = new Map();
        this.#queue = [] ;
    }
}

module.exports  = MultipartCompiler ;


async function initSemanticTypeMatcherFactory (context) {
    
    return async (typeMatcherString , handler) => {

        return async (testTypeString) => {

            if(testTypeString === typeMatcherString) {

                return async (payload) => {

                    await handler(context , payload) ;
                }
            }

            return null ;
          
        }

    }

}

