const {} = require('fs');
const findIndexInBuffer = require('../../../../../../../utils/find-index-in-buffer-for-separator');
const prefixLog = require('../../../../../../../utils/log-prefixer');
const logPrefix = prefixLog('split form by boundary');
function splitFormDataBufferByBoundary(dataBuffer, boundaryBuffer) {
    let start = 0;
    let index = 0 ;
    const parts = [] ;
    while((index = findIndexInBuffer(dataBuffer , boundaryBuffer , start)) !== -1) {

        parts.push(dataBuffer.subarray(start , index));
        start = index + boundaryBuffer.length;
        
        if(dataBuffer[start] === 0x0d && dataBuffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(dataBuffer.subarray(start));

    return parts ;
}

module.exports = splitFormDataBufferByBoundary ;