const findBufferIndex = require("./find-buffer-index");

async function splitBuffer(buffer , separator , depth = 0  , fn1 = f=>f , fn2 = f=>f) {
    // let level = 0 ;
    const parts = [] ;
    let index = 0 ;
    let start = 0;

    while((index = await findBufferIndex(buffer , separator , start)) !== -1) {

        // if(depth > 0 && ++level > depth) break ; 

        const part = buffer.subarray(start , index);
        parts.push(part);
        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }

    }

    parts.push(buffer.subarray(start));

    return parts ;
}

module.exports = splitBuffer ;