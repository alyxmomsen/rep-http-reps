const { createWriteStream } = require('fs');
async function handleForm(req ,res , storeAdapter) {
    
    const { headers } = req ;

    const contentTypeHeaderString = headers['content-type'];

    const fallbackmessage = (value) => `${value} is not given` ;
    if(contentTypeHeaderString === undefined) {

        res.writeHead(400 , 'bad request' , {
            'content-type':'text/plain' ,
        });
        res.end(fallbackmessage('content-type header'));
        return ;
    }

    const [contentType , boundaryStringLike] = contentTypeHeaderString.split('; ');

    console.log({contentType , boundaryStringLike});

    const allBufferParts = [];
    req.on('data' , async (chunk) => {
        allBufferParts.push(chunk);
    });

    req.on('end' , async () => {

        // const dataBuffer = getherWholeBuffer(allBufferParts);
        // return ;

        const boundaryStr = await extractBoundaryString(contentTypeHeaderString);
    
        if(boundaryStr === null) {
            
            res.writeHead(400 , 'bad request' , {
                'content-type':'text/plain' ,
            });
            res.end(fallbackmessage('boundary string'));
            return ;
        }

        console.log({contentTypeHeaderString});

        const wholeBuffer = await getherWholeBuffer(allBufferParts);

        const parts = await _splitBuffer(wholeBuffer , Buffer.from(`--${boundaryStr}`));

        for (let part of parts) {
            await handlePartAsMultipartFormData(part , storeAdapter);
        }

        const files = await storeAdapter.getAllFiles();

        console.log({files});

        for (const file of files) {

            console.log({file});

            createWriteStream('./upload/' + Date.now() + '.' + (file.title ? file.title : file.originalFilename));

        }

        res.end('foo bar');
        return ;

    });


    console.log('handle form');
}

async function getherWholeBuffer(bufferParts) {
    const wholeBuffer = Buffer.concat(bufferParts);
    return wholeBuffer ;
}

async function handlePartAsMultipartFormData (partBuffer, storeAdapter) {

    const separatorString = '\r\n\r\n' ;
    const separatorBuffer = Buffer.from(separatorString);

    const separatorBufferIndex = await _findIndex(partBuffer , separatorBuffer);

    if(separatorBufferIndex === -1) {
        const fallbackmessage = 'skip incorrect part'.toUpperCase();
        console.log(fallbackmessage);
        return fallbackmessage ;
    }

    const headersPartBuffer = partBuffer.subarray(0 , separatorBufferIndex);
    let bodyPartEndBufferIndex = partBuffer.length ;

    if(partBuffer[partBuffer.length - 2] === 0x0d && partBuffer[partBuffer.length - 1] === 0x0a) {
        bodyPartEndBufferIndex -= 2 ;
    }

    const bodyPartBuffer = partBuffer.subarray(separatorBufferIndex + separatorBuffer.length , bodyPartEndBufferIndex);

    const dataHeaderPartRows = await splitHeadersPartToRows_local_util(headersPartBuffer.toString('utf-8'));

    const dataHeadersObject = await extractDataHeaders_localUtil(dataHeaderPartRows);

    const contentDispositionDataHeader = dataHeadersObject['content-disposition'] ;
    const contentTypeDataHeader = dataHeadersObject['content-type'] ;

    // start ----------------------------------


    if(contentDispositionDataHeader === undefined) {
        console.log('no content-disposition'.toUpperCase());

        return ;
    }
    
    // const contentType = contentTypeDataHeader ;

    const {filename: originalFilename , other:{type , id , name , targetid}} = await parseInputsAttributes_local_util(contentDispositionDataHeader , (inputname) => {

        const [subject , target] = inputname.split('--');
        const [type , id , name] =  subject.split('.');

        return {type , id , name , targetid:target || null};
    });

    const payload = {
        id , name , targetid , body:bodyPartBuffer , originalFilename ,
    } ;

    await storeAdapter.gulp(type , payload);


    // end ----------------------------------

    // start local utils

    async function parseInputsAttributes_local_util(contentDispositionDataHeader , behavior) {
        
            const filenamematch = contentDispositionDataHeader.match(/filename="([^"]+)"/);
            const namematch = contentDispositionDataHeader.match(/name="([^"]+)"/);

            const name = namematch === null ? null : namematch[1] ;
            const filename = filenamematch === null ? null : filenamematch[1] ;

            const other = behavior?.(name);

            return {
                name  ,
                filename  ,
                other: other || null ,
            }
    }

    async function splitHeadersPartToRows_local_util(headersPartString) {
        
        const rows = headersPartString.split('\r\n');
        return rows ;
    }

    async function extractDataHeaders_localUtil(dataHeadersPartRows) {
        
        const _headers = {} ;

        console.log('extractDataHeaders_localUtil: ' /* , dataHeaderPartRows */);

        dataHeadersPartRows.forEach((row , i) => {
            const [key ,value] = row.split(': ');
            if(key !== undefined && value !== undefined) {
                _headers[key.toLowerCase()] = value ;
            }
        });

        return _headers ;

    }

    // end local utils

}

async function _splitBuffer(buffer , separator) {
    
    const parts = [] ;
    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {
        
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

async function _findIndex(buf , sep , start = 0) {

    for (let ind = start; ind < buf.length - sep.length ; ind++) {

        let found = true; 
        for (let j = 0; j < sep.length ; j++) {
            
            if(buf[ind + j] !== sep[j]) {
                found = false ;
                break ;
            }

        }

        if(found === true) {
            return ind ;
        }
    }
    
    return -1 ;
}

async function extractBoundaryString(contentTypeHeaderString) {
    
    const match = /boundary=(----[^$\s;]+)/.exec(contentTypeHeaderString) ;
    if(match === null) {
        return null ;
    }

    return match[1];
}

module.exports = handleForm ;