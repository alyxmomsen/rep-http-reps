
const { Readable } = require('stream');
const _Registry = require("../../services/registry");
const { createWriteStream } = require('fs');

async function _handleUpload (req , res , registry) {
    
    const conentTypeHeader = req.headers['content-type'] ;

    if(conentTypeHeader === undefined) {

        await _fallback(res , 'no content type header');
        return ;
    }

    const boundaryString = await _extractBoundaryString(conentTypeHeader);

    if(boundaryString === null) {
        await _fallback(res , 'no boundary string');
        return ;
    }

    const bufferChuncks = [];

    req.on('data' , async (chunk) => {
        bufferChuncks.push(chunk);
    });

    req.on('error' , async (e) => {

        console.log('req data error: ' , e);
    });

    req.on('end' , async () => {

        const boundaryBuffer = Buffer.from(boundaryString); ;

        const wholeBuffer = Buffer.concat(bufferChuncks);

        const parsedBuffer = await _splitBuffer(wholeBuffer , boundaryBuffer) ;

        for (let contentPartBuffer of parsedBuffer) {

            const _partExtractedData = await _parseContentPartBuffer(contentPartBuffer);

            if(_partExtractedData === undefined) continue ;

            // gether file data hard-code ; warning it is absolutely hardcode 
            
            const { body , contentType , filename , inputname } = _partExtractedData ;

            if(filename) {

                console.log('creating write stream');

                const readStream = Readable.from(body);
                
                const writeStream = createWriteStream('./upload-data/' + filename);

                readStream.pipe(writeStream);
            }
        }
    });
}

module.exports = _handleUpload ;

async function _parseContentPartBuffer(part) {
    
    // const partString = part.toString('utf-8');

    const dataSeparatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = await _findIndex(part ,dataSeparatorBuffer);

    if(separatorIndex === -1) {
        console.log(`incorrect part`.toUpperCase());
        return ;
    }

    let bodyPartEndIndex = part.length ;

    if(part[bodyPartEndIndex - 2] === 0x0d && part[bodyPartEndIndex - 1] === 0x0a) {
        bodyPartEndIndex -= 2 ;
    }

    const headersPart = part.subarray(0 , separatorIndex);
    const bodyPart = part.subarray(separatorIndex + dataSeparatorBuffer.length , bodyPartEndIndex);

    const headersPartString = headersPart.toString('utf-8');

    // handle headers part
    
    const headersPartRows = headersPartString.split(/\r\n/);
    const headers = {} ;
    for (const headersPartRow of headersPartRows) {

        const [key , value] = headersPartRow.split(': ');

        if(key === undefined || value === undefined) continue ;

        headers[key.toLowerCase()] = value ;
    }
    
    // end handle headers part

    const inputname =  await _util(headers['content-disposition'] , 'name') ;
    const filename = await _util(headers['content-disposition'] , 'filename');
    const contentType = headers['content-type'] || null ;
    const body = bodyPart ;

    return {
        inputname ,
        filename ,
        contentType ,
        body ,
    }

    async function _util(headerValueString , atrName) {
        
        const rgx = new RegExp(`${atrName}="([^"]+)"`);

        const match = headerValueString.match(rgx);

        if(match === null) {
            return null ;
        }

        return match[1] ;
    }
}

async function _extractBoundaryString (contentTypeHeaderString) {
    
    const match = contentTypeHeaderString.match(/boundary=(----[^;\s$]+)/);

    if(match === null) return null ;

    return `--${match[1]}` ;

}

async function _splitBuffer (buffer , separator) {
    
    const parts = []; 

    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {

        parts.push(buffer.subarray(start , index));
        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            console.log('handle tail..');
            start += 2 ;
        }

    }

    parts.push(buffer.subarray(start));

    return parts ;
}


async function _findIndex (buffer , separator , start = 0) {

    for (let index = start ; index < buffer.length - separator.length ; index++) {
        
        let found  = true ;
        for (let j = 0 ; j < separator.length ; j++) {
            
            if(buffer[index + j] !== separator[j]) {

                found = false ;
                break;
            }
        }

        if(found === true) {
            return index ;
        }
    }
    
    return -1 ;
}

async function _fallback (res , message) {

    const _message = message.toUpperCase();

    console.log('fallback: ' , _message);
}