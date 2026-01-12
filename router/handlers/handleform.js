const HTMLFormDataParser = require("../../services/html-form-data-parser");

const htmlformdataparser = new HTMLFormDataParser();

async function handleForm(req , res) {
    
    const {headers} = req;  

    const contentTypeHeaderValue = headers['content-type'];

    const boundaryString = await _extractBoundaryString(contentTypeHeaderValue);

    
    if(contentTypeHeaderValue === undefined) {
        console.log();
        res.writeHead(400 , 'bad request' , {
            'content-type':'text/plain' ,
        });
        res.end('no content type header'.toUpperCase());
        return ;
    }
    
    if(boundaryString === null) {

        console.log();
        res.writeHead(400 , 'bad request' , {
            'content-type':'text/plain' ,
        });
        res.end('no boundary string'.toUpperCase());
        return ;
    }

    const chunks = [] ;
    req.on('data' , async (reqBufferChunk) => {
        chunks.push(reqBufferChunk);
    });

    req.on('end' , async () => {

        const wholeBuffer = Buffer.concat(chunks);

        const parts = await _splitBuffer(wholeBuffer , Buffer.from(`--${boundaryString}`));


        for (const part of parts) {
            await _handleRequestDataPart(part);
        }


        const files = await htmlformdataparser.getFiles();

        console.log({files});
        res.end();
        return;

    });

    req.on('error' , (e) => {
        console.log({reqerror:e});
    });

}

module.exports = handleForm ;

async function _handleRequestDataPart(part) {
    
    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = await _findIndex(part , separatorBuffer) ;

    if(separatorIndex === -1) {
        console.log('incorrect part');
        return ;
    }

    const headersPart = part.subarray(0 , separatorIndex);

    let bodyEndIndex = part.length ;

    if(part[part.length - 2] === 0x0d && part[part.length - 1] === 0x0a) {
        bodyEndIndex -= 2 ;
    }

    const bodyPart = part.subarray(separatorIndex + separatorBuffer.length , bodyEndIndex); 

    
    const headersLikeRows = await _extractDataHeaders(headersPart);

    const { filename , contentType , inputname } = await _parseDataHeaders(headersLikeRows) ; 
    
    const partBundle = {
        filename , 
        contentType ,
        inputname ,
        body:bodyPart ,
    }

    htmlformdataparser.gulp(partBundle);

    return ;
}

async function _parseDataHeaders (dataHeadersLikeRows) {


    const contentType = dataHeadersLikeRows['content-type'] || null;
    const name = await extractContentDisProps('name'  ,dataHeadersLikeRows['content-disposition'])
    const filename = await extractContentDisProps('filename' , dataHeadersLikeRows['content-disposition'])


    console.log({contentType , name , filename})

    return {
        contentType ,
        inputname:name ,
        filename ,
    }

    async function extractContentDisProps (propName , data) {
        
        const regex = new RegExp(`${propName}="([^"]+)"`);

        const match = regex.exec(data);

        return match ? match[1] : null ;
    }
}

async function _extractDataHeaders (headersPart) {
    const headersRows = headersPart.toString('utf-8').split('\r\n')
    const headers = [] ;
    headersRows.forEach(row => {
        
        const [key , value] = row.split(': ') ;
        if(key !== undefined && value !== undefined) {
            headers[key.toLowerCase()] = value ;
        }
    });

    return headers ;
}

async function _splitBuffer(buffer , separator) {

    console.log({buffer , separator});

    const parts = [] ;
    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer  , separator , start)) !== -1) {

        parts.push(buffer.subarray(start , index));
        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(buffer.subarray(start));

    console.log({parts});

    return parts ;
}


async function _findIndex(buffer , separator , start = 0) {
    
    for (let index = start ; index < buffer.length - separator.length ; index++) {

        let found = true; ;
        for (let j = 0 ; j < separator.length ; j++) {
        
            if(buffer[index + j] !== separator[j]) {
                found = false 
                break ;
            }
        }

        if (found === true) {
            
            return index ;
        }
    }

    return -1 ;
}

async function _extractBoundaryString (contentTypteHeaderValue) {
    
    const match = contentTypteHeaderValue.match(/boundary=(----[^;$\s]+)/);
    if(match === null) return null ;
    return match[1] ;

}