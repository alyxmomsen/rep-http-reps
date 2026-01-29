const _findIndex = require('../../../../../../../../utils/find-index');

async function splitBufferByBoundary(buffer , boundaryBuffer) {
    
    const parts = [] ;
    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer  ,boundaryBuffer , start)) !== -1) {

        parts.push(buffer.subarray(start , index));
        start = index + boundaryBuffer.length ;

        if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2;
        } 
    }

    parts.push(buffer.subarray(start));

    return parts ;
    
}

module.exports = splitBufferByBoundary ;