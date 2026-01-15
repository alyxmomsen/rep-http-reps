
async function handleForm(req ,res) {
    
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
    
    const boundaryStr = await extractBoundaryString(contentTypeHeaderString);
    
    if(boundaryStr === null) {
        
        res.writeHead(400 , 'bad request' , {
            'content-type':'text/plain' ,
        });
        res.end(fallbackmessage('boundary string'));
        return ;
    }

    const allBufferParts = [];
    req.on('data' , async (chunk) => {
        allBufferParts.push(chunk);
    });

    req.on('end' , async () => {

        const wholeBuffer = Buffer.concat(allBufferParts);

        const parts = await _splitBuffer(wholeBuffer , Buffer.from(`--${boundaryStr}`));

        console.log({parts});

        for (let part of parts) {
            await handlePart(part);
        }

        res.end(JSON.stringify(parts.length));
        return ;

    });


    console.log('handle form');
}

async function handlePart (part) {
    console.log({part});
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