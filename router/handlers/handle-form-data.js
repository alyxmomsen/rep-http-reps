const {} = require("fs");
const { readFile } = require("fs/promises");
const { join } = require("path");

const fallbackresponse = (res ,message) => {
    
    console.log(message);
}

async function handleFormData(req , res) {
    
    const { headers } = req; 

    const contenTypeHeader = headers['content-type'];

    console.log({contenTypeHeader});

    if(contenTypeHeader === undefined) {
        fallbackresponse(res , 'no content-type header');
        return ;
    }

    const boundaryMatch = contenTypeHeader.match(/boundary=(----[^$;\s]+)/);

    if(boundaryMatch === null) {
        fallbackresponse(res , 'no boundary');
        return ;
    }

    const boundaryString = boundaryMatch[1] ;


    let totalSize = 0 ;
    let dataBufferChunks = [] ;
    req.on('data' , async (chunk) => {
        totalSize += chunk.length; 
        dataBufferChunks.push (chunk);
    });

    req.on('end' , async () => {

        const wholeBufferData = Buffer.concat(dataBufferChunks);

        const dataBufferParts = await _splitBuffer(wholeBufferData , Buffer.from(`--${boundaryString}`));

        for (const dataBufferPart of dataBufferParts) {

            await handleFormInputDataPart(dataBufferPart , () => {console.log(`input data handler`)});
        }

        try {
            const file = await readFile(join('.' , 'view' , 'form.html'));
            res.end(file);
            return ;
        }
        catch (e) {
            console.log('handle form error' , {e});
            res.end('handle form error');
            return ;
        }
    });
}

module.exports = handleFormData ;

async function handleFormInputDataPart(dataBufferPart , behavior) {
    
    console.log(dataBufferPart);

    behavior();

}

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

async function _findIndex (buf , sep , start = 0) {
    
    for (let index = start ; index < buf.length - sep.length; index++) {
        let found = true ;
        for (let j = 0 ; j < sep.length; j++) {
            
            if(buf[index + j] !== sep[j]) {
                found = false;
                break ;
            }
        }
        if(found === true ) return index ;
    }

    return -1 ;
}