const findBufferIndex = require("./find-buffer-index");

async function _splitBufferBy(dataBuffer , separator) {

    const parts = [] ;

    // if(separator.length < dataBuffer.length) return parts ;

    let start = 0 ;
    let index = 0 ;

    while ((index = await findBufferIndex(dataBuffer , separator , start)) !== -1) {

        const part = dataBuffer.subarray(start , index);
        parts.push(part);
        start = index + separator.length ;
        if(dataBuffer[start] === 0x0d && dataBuffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(dataBuffer.subarray(start));

    return parts ;
}

module.exports = _splitBufferBy ;