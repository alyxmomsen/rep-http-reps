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

    req.on('end' , () => {

        const wholebuffer = Buffer.concat(bufferparts);

        const formDataParts = splitBuffer(wholebuffer , Buffer.from(boundary));

        for (const part of formDataParts) {

            try {
                multipartAssembler.gulpOnePiece(part);
            }
            catch (e) {
                console.log({e});
            }

            
        }
    });
}

module.exports = multipartHanldler ;

// utils

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