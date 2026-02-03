const registry = require("../../../../../../services/registry/registry");
const findIndexInBuffer = require("../../../../../../utils/find-index-in-buffer");
const MultipartAssembler = require("./services/multipart-assembler/multipart-assembler");

async function multipartHanldler(req, res , payload) {

    const multipartAssembler = new MultipartAssembler ;
    
    const { contentTypeAttr } = payload ;

    const boundary = extractBoundary(contentTypeAttr);

    if(!boundary) {
        res.writeHead(400);
        res.end('no boundary');
        return;
    }

    const bufferparts = [];

    req.on('data' , (chunk) => {

        bufferparts.push(chunk);

    });

    req.on('end' , async () => {

        const wholebuffer = Buffer.concat(bufferparts);

        const formDataParts = splitBuffer(wholebuffer , Buffer.from(boundary));

        for (const part of formDataParts) {

            try {
                
                const {headers:headersPart , body} = splitPart(part);

                if(body && !body.length) {
                    console.log(`no body content`);
                    continue;
                }
                
                const headers = parseHeaders(headersPart.toString('utf-8'));
                
                const contentDisposition = headers['content-disposition'] || null ;
                const contentType = headers['content-type'] || null ;
                
                if(!contentDisposition) {
                    continue ;
                }
                
                const { name: nameAttr , filename } = parseContentDisposition(contentDisposition) ;

                // console.log()
                
                const semantic = parseNameAttribute(nameAttr);
                
                multipartAssembler.gulpOnePiece({body , semantic , filename , contentType});
            }
            catch (e) {
                console.log({e});
            }
        } 

        const assembledItems =  multipartAssembler.getAssembledItemsArr();

        console.log({assembledItems});


        const uploaded = [] ;
        const notuploaded = [] ;
        for (const assembledItem of assembledItems) {

            const addItemResult = await registry.addItem(assembledItem);
            const {status , newItem} = addItemResult ;
            if(status) {
                continue ;
            }

            uploaded.push(newItem);
        }

        console.log('multipart data just handled');
        res.end(JSON.stringify({message:'form handled' , uploaded}));

    });
}

module.exports = multipartHanldler ;

// utils

function parsePart () {

}

function splitBuffer (buffer , separator) {
    const parts = [] ;
    let start = 0 ;
    let index = 0 ;
    while ((index = findIndexInBuffer(buffer , separator , start)) !== -1) {

        parts.push(buffer.subarray(start , index));
        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(buffer.subarray(start));

    return parts ;
}

function extractBoundary (contentTypeAttr) {

    if(!contentTypeAttr) return null ;

    const match = contentTypeAttr.match(/boundary=(----[^$;\s]+)/);

    return match ? `--${match[1]}` : null ;

}

function parseNameAttribute (nameAttr) {

    const [subj , target] = nameAttr.split('--') ;

    const [type , id , name] = subj.split('.') ;

    return {
        type  , id ,
        name , target,
    }
}

function parseContentDisposition (contentDisposition) {

    const namematch = contentDisposition.match(/name="([^"]+)"/);
    const filenamematch = contentDisposition.match(/filename="([^"]+)"/);

    return {
        name: namematch ? namematch[1] : null ,
        filename: filenamematch ? filenamematch[1] : null ,
    }
}

function parseHeaders (headersString) {

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

function splitPart (piece) {

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