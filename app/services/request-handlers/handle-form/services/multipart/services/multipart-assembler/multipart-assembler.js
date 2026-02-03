const findIndexInBuffer = require("../../../../../../../../utils/find-index-in-buffer");

class MultipartAssembler {

    gulpOnePiece (piece) {  
        
        const {headers:headersPart , body} = splitPiece(piece);

        const headers = this.#parseHeaders(headersPart.toString('utf-8'));

        const contentDisposition = headers['content-disposition'] || null ;
        const contentType = headers['content-Type'] || null ;

        if(!contentDisposition) {
            throw new Error(`no content disoposition`);
        }

        const { name: nameAttr , filename } = this.#parseContentDisposition(contentDisposition) ;

        const { type:semanticType , id , name , target } = this.#parseNameAttribute(nameAttr);

        // assemble

        const matcherContext = {
            files:this.#files , 
            queue:this.#queue , 
            payload:{
                type:semanticType, filename, 
                contentType, 
                id, body, 
                name, target, 
            },
        }

        const factory = createMatcerFactory(matcherContext);

        const matchers = [
            factory('subject' , (context) => {
                const {  } = context ;
                console.log('subject' ,{context});
            }) ,
            factory('meta' , (context) => {console.log('meta type')}) ,
        ] ;

        for (const matcher of matchers) {

            const handler = matcher(semanticType) ;
            if(!handler) continue ;
            handler();
        }
    }

    #parseNameAttribute (nameAttr) {

        const [subj , target] = nameAttr.split('--') ;

        const [type , id , name] = subj.split('.') ;

        return {
            type  , id ,
            name , target,
        }
    }

    #parseContentDisposition (contentDisposition) {

        const namematch = contentDisposition.match(/name="([^"]+)"/);
        const filenamematch = contentDisposition.match(/filename="([^"]+)"/);

        return {
            name: namematch ? namematch[1] : null ,
            filename: filenamematch ? filenamematch[1] : null ,
        }
    }

    #parseHeaders (headersString) {

        const headers = {} ;

        const headersRows = headersString.split('\r\n');

        headersRows.forEach(row => {
            const [key , value] = row.split(': ');
            if(key && value) {
                headers[key.toLowerCase()] = value ;
            }
        });

        return headers ;

    } 

    #files;
    #queue;

    constructor () {
        this.#files = new Map();
        this.#queue = [] ;
    }
}

module.exports = MultipartAssembler ;

// utils

function splitPiece (piece) {

    const separator = Buffer.from('\r\n\r\n') ;

    const index = findIndexInBuffer(piece  ,separator);

    if(index === -1) {
        throw new Error('incorrect data part');
    }

    const headers = piece.subarray(0 , index);
    let bodyEndBufferIndex = piece.length ;
    if(piece[bodyEndBufferIndex - 2] === 0x0d && piece[bodyEndBufferIndex - 1] === 0x0a) {
        bodyEndBufferIndex -= 2 ;
    }
    const body = piece.subarray(index + separator.length , bodyEndBufferIndex);
    
    return {
        headers ,
        body ,
    }
}

function createMatcerFactory (context) {
    
    return (typeMatcher , handler) => {
        return semanticTypeMatcherFactory(typeMatcher, context , handler);
    }
}

function semanticTypeMatcherFactory (typeMatcher , context , handler) {
    
    return (testTypeString) => {

        console.log({testTypeString , typeMatcher});

        if(testTypeString === typeMatcher ) {



            return () => {

                handler(context);
            }
        }

        return null ;

    }
}