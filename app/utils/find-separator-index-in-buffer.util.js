
/**
 * 
 * @param {Buffer<ArrayBuffer>} dataBuffer 
 * @param {Buffer<ArrayBuffer>} separatorBuffer 
 * @param {number} startIndex 
 */
function findSeparatorIndexInBuffer (dataBuffer , separatorBuffer , startIndex = 0) {

    for (let index = startIndex ; index <= dataBuffer.length - separatorBuffer.length ; index++) {
        let found = true ;
        for (let j = 0 ; j < separatorBuffer.length ; j++) {
            if(dataBuffer[index + j] !== separatorBuffer[j]) {
                found = false ;
                break ;
            }
        }
        if(found === true) return index ;
    }

    return -1 ;
}

module.exports = { findSeparatorIndexInBuffer }