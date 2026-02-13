const findIndexInBuffer = require("../../../../../../../../utils/find-index-in-buffer");

function splitFormDatPart (formDataPartBuffer) {

    const separator = Buffer.from(`\r\n\r\n`);

    const separatorIndex = findIndexInBuffer(formDataPartBuffer , separator);

    if(separatorIndex === -1) {
        throw new Error('incorrect form data part'.toUpperCase());
    }

    const headers = formDataPartBuffer.subarray(0 , separatorIndex);

    let bodyEndIndex = formDataPartBuffer.length ;

    if(formDataPartBuffer[bodyEndIndex - 2] === 0x0d && formDataPartBuffer[bodyEndIndex - 1] === 0x0a) {
        bodyEndIndex -= 2 ;
    }

    const body = formDataPartBuffer.subarray(separatorIndex + separator.length , bodyEndIndex);

    return {
        headers , 
        body ,
    };
}

module.exports = splitFormDatPart ;