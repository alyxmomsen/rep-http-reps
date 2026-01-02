const { createWriteStream } = require('fs');
const { join } = require('path');
const { Readable } = require('stream');

async function handleMultipart (contentTypeHeaderData , formDataBuffer) {
    
    
    const match = /boundary=(?<boundary>----[^$\s;]+)/.exec(contentTypeHeaderData);

    
    if(match === null) {
        
        return 
    }

    const boundaryBuffer = Buffer.from(`--${match.groups.boundary}`);
    const boundaryEndBuffer = Buffer.from(`--${match.groups.boundary}--`);
    
    const parts = await splitFormData(Buffer.from(match.groups.boundary) , formDataBuffer)

    parts.pop();
    parts.shift();

    for (const part of parts) {

        // if(part.equals(boundaryBuffer))

        const bodySeparator = Buffer.from('\r\n\r\n');

        const separatorIndex = _findIndex(part , bodySeparator);

        if(separatorIndex === -1) {
            continue ;
        }
        
    }



    console.log(result);

}

module.exports = handleMultipart ;


async function saveFile (filename , data , fallback = f => f) {

    try {
        
        const savingDir = join('.' , `${Date.now()}.${filename}`);
        
        const writeStriem = createWriteStream(savingDir , 'utf-8')
        const readStream = Readable.from(data);

        readStream.on('end' , () => {
            console.log('file uploaded');
        });

        readStream.pipe(writeStriem)

    }
    catch (e) {

        fallback(e)
    }
}

async function splitFormData (separator  , buffer) {

    // console.log({boundary: separator , formdata: buffer});

    const parts = [] ;
    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {

        const part = buffer.subarray(start , index) ;

        parts.push(part);

        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }

        // console.log('part: ' , part.toString('utf-8'));
    }

    parts.push(buffer.subarray(start));

    // console.log('result' , parts);

    return parts ;
} 

async function _findIndex (buffer , separator , start = 0) {

    for (let i = start ; i <= buffer.length - separator.length ; i++) {
        let found = true ;
        for (let j = 0 ; j < separator.length ; j++) {

            if(buffer[i + j] !== separator[j]) {
                found = false ;
                break ;
            }

        }

        if(found === true) {
            return i ;
        }
    }

    return -1 ;

}

function parseDispHEader (headerd) {

    if(headerd === undefined) return null ;

    const inputname = /name="(?<inputname>[^"]+)/.exec(headerd)?.groups.inputname ;
    const filename = /filename="(?<filename>[^"]+)/.exec(headerd)?.groups.filename ;

    return {
        filename:filename === undefined ? null : filename ,
        inputname: inputname === undefined ? null : inputname ,
    }
}

function parseContentTypeHeaderData (headerd) {

    if(headerd === undefined) return null ;

    const contentTYpe = /(?<inputname>[^\/]+\/[^;$\s]+)/.exec(headerd)?.groups.inputname ;
    return contentTYpe;
}


