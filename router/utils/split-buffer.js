const _findIndex = require("./find-index");

async function _splitBuffer (buffer , separator) {
    
    const parts = [];
    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {
        
        const partBuffer = buffer.subarray(start , index);
        parts.push(partBuffer);
        start = index + separator.length ;
        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(buffer.subarray(start));

    return parts ;
}

module.exports = _splitBuffer;