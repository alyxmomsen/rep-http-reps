const { createWriteStream, createReadStream } = require('fs');
const { join } = require('path');
const { Readable } = require('stream');
const { buffer } = require('stream/consumers');

async function handleMultipart (contentTypeHeaderData , formDataBuffer) {
    
    const boundary = contentTypeHeaderData.match(/boundary=(----[^;\s]+)/);
    
    if(boundary === null) {
        return null
    }

    const parts = await _getDataBufferParts(formDataBuffer , Buffer.from('--' + boundary[1]));

    for (const part of parts) {

        await _handleDataPart(part);
    }

}

module.exports = handleMultipart ;

async function _handleDataPart (part) {

    const dataseparator = Buffer.from(`\r\n\r\n`);

    const index = await _findIndex(part , dataseparator) ;

    if(index === -1) {

        return null;
    }

    const headershalfBuffer  = part.subarray(0 , index)
    const datahalfBuffer = part.subarray(index + dataseparator.length);

    const filenamematch = headershalfBuffer.toString('utf-8').match(/filename="([^"]+)"/) ;

    if(filenamematch) {
       
        // handle file data

        const filename = filenamematch[1] ;

        _handleFileData(datahalfBuffer , filename);

        return ;
    }

    // other data handling

    return ;

}

async function _handleFileData (dataBuffer , filenamestring) {

    const readStream = Readable.from(dataBuffer) ;

    readStream.on("data" , (chunk) => {
        console.log({chunk});
    });

    const writeStream = createWriteStream(`./upload-data/${Date.now()}.${filenamestring.replace(' ' , '')}`);

    readStream.pipe(writeStream);

}

async function _getDataBufferParts (dataBuffer , boundaryBuffer) {

    const parts = [] ;

    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(dataBuffer , boundaryBuffer , start)) !== -1) {
        
        const part = dataBuffer.subarray(start , index);

        parts.push(part);

        // console.log(start , index);
        start = index + boundaryBuffer.length ;

    }

    parts.push(dataBuffer.subarray(start));

    return parts ;
}

async function _findIndex (buffer , separator , start = 0) {

    console.log('finding index');

    for (let i=start ; i<= buffer.length - separator.length ; i++) {

        let found = true ;

        for (let j=0 ; j<separator.length ; j++) {

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
