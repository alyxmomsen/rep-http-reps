const { createWriteStream, createReadStream } = require('fs');
const { join } = require('path');
const { Readable } = require('stream');
const { buffer } = require('stream/consumers');

async function handleMultipart (contentTypeHeaderData , formDataBuffer) {

    const boundary = await _extractBoundaryString(contentTypeHeaderData);

    const parts = await _splitDataBuffer(formDataBuffer , Buffer.from(`--${boundary}`));

    await _handleParts(parts);

    console.log({boundary , parts}) ;
}

module.exports = handleMultipart ;

async function _handleParts (parts) {

    const dataSeparatorRegexBuffer = Buffer.from('\r\n\r\n') ;

    for (const part of parts) {

        const index = await _findIndex(part , dataSeparatorRegexBuffer);
 
        if(index === -1) {
            console.log('incorrect part: ' , part.toString('utf-8'));
            continue ;
        }

        const headersPart = part.subarray(0 , index);
        const datapPart = part.subarray(index + dataSeparatorRegexBuffer.length);

        const filename = (match = /filename="([^"]+)"/.exec(headersPart.toString('utf-8')))?.[1] ;

        if(filename !== undefined) {

            await _handleFileData(datapPart , headersPart ,  filename);
            continue ;
        }

        console.log('headers part: ' , headersPart.toString('utf-8') , datapPart.toString('utf-8'));

        // console.log(part.subarray(0 , index).toString());

    }

}

async function _handleFileData (fileDataBuffer , headersPart , filenameString) {

    console.log('filedata: ' ,fileDataBuffer , headersPart.toString('utf-8') , filenameString);

}

async function _extractBoundaryString (contentTypeHeaderData) {

    const match = /boundary=(----[^;$\s]+)/.exec(contentTypeHeaderData);

    return match ? match[1] : match ;

}

async function _splitDataBuffer (dataBuffer , boundaryBuffer) {

    const parts = [] ;

    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(dataBuffer , boundaryBuffer , start)) !== -1) {

        parts.push(dataBuffer.subarray(start , index));
        start = index + boundaryBuffer.length;
    }

    parts.push(dataBuffer.subarray(start));

    return parts ;

}

async function _findIndex (dataBuffer , separatorBuffer , start = 0) {

    for (let index=start ; index<dataBuffer.length - separatorBuffer.length ;index++) {

        let found = true ;
        for (let j=0 ; j<separatorBuffer.length ; j++) {

            if(dataBuffer[index + j] !== separatorBuffer[j]) {
                found = false ;
                break ;
            }
        }

        if(found === true) {
            return index ;
        }
    }

    return -1 ;
}