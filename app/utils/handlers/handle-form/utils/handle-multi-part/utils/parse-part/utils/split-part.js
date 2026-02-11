const findIndexInBuffer = require("../../../../../../../../../utils/find-index-in-buffer-for-separator");

function splitThePart(thePart) {

    const separator = '\r\n\r\n'

    const index = findIndexInBuffer(thePart , Buffer.from(separator))// thePart.indexOf(separator)

    if(index === -1) throw new Error('incorrect form data part'.toUpperCase()) ;

    const headers = thePart.subarray(0 , index )
    
    let bodyBufferEndIndex = thePart.length ;

    if(thePart[bodyBufferEndIndex - 2] === 0x0d && thePart[bodyBufferEndIndex -1] === 0x0a) {
        bodyBufferEndIndex -= 2 ;
    }

    const body = thePart.subarray(index + separator.length , bodyBufferEndIndex);

    return {
        headers , 
        body,
    }
}

module.exports = splitThePart ;

// utils
