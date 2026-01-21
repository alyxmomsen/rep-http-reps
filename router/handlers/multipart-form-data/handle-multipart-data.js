
async function handleMultipartData (req , res , dataBuffer) {

    const { url , method , params , queryParams , headers } = req ;
    console.log({url , method  ,params , queryParams , dataBuffer });

    const contentTypeHEaderString = headers['content-type'];
    if(contentTypeHEaderString === undefined) {
        
        res.end('no cont')
        return ;
    }
    
    const [contentType , attr] = contentTypeHEaderString.split('; ');
    
    
    if(contentType === undefined) {
        res.end('check')
        return ;
    }
    
    const boundarymatch = attr.match(/boundary=(----[^;$\s]+)/);
    
    if(boundarymatch === null) {
        console.log('no boundary');
        return ;
    }
    
    const parts  = await _splitBufferBy(dataBuffer , Buffer.from(`--${boundarymatch[1]}`));

    console.log({parts});

    res.end();
    return ;
}

module.exports = handleMultipartData ;

async function _splitBufferBy(dataBuffer , separator) {

    const parts = [] ;

    let start = 0 ;
    let index = 0 ;

    while ((index = await finBufferIndex(dataBuffer , separator , start)) !== -1) {

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

async function finBufferIndex(buffer , separator , start = 0) {
    
    for (let index = start ; index < buffer.length - separator.length ; index++) {
        let found = true ;
        for (let j = 0 ; j < separator.length ; j++) {
            
            if(buffer[index + j] !== separator[j]) {
                found = false ;
                break;
            }
        }

        if(found === true) return index ;
    }

    return -1 ;

}