const _log = require("../../../global-utils/log");


async function multipartdatahandler(res , databuffer , boundarybuffer) {
    
    const formDataParts = await _splitBuffer(databuffer , boundarybuffer);

    for (const part of formDataParts) {

        const splitedPartLike = await _splitPart(part);

        if(splitedPartLike === null) {
            const fallbackmessage = 'incorrect data part'.toUpperCase();
            _log({fallbackmessage});
            // res.end('fallbackmessage');
            continue ;
        }
  
        const {body:bodyDataPartBuffer , headers:headersRowsPartBuffer} = splitedPartLike ;

        const {body , contentType , filename , name} = await _compileDataBundleFromPart(bodyDataPartBuffer , headersRowsPartBuffer.toString('utf-8'));

        _log({body , contentType , filename , name});

        

    } 

    res.end('multipart resolver');
    return ;
}

module.exports = multipartdatahandler ;

async function _compileDataBundleFromPart (bodyDataPartBuffer , headersRowsPart) {
            
    const {
        contentType , 
        filename ,
        name
    } = await _parsePartHeaders(headersRowsPart);

    return {
        contentType ,
        filename ,
        name ,
        body:bodyDataPartBuffer ,
    }
    
}

async function _parsePartHeaders(dataHeadersString) {
    
    const rows = dataHeadersString.split('\r\n');

    const headers = {} ;

    rows.forEach(row => {

        const [key , value] = row.split(': ');

        if(key !== undefined && value !== undefined) {

            headers[key.toLowerCase()] = value ;
        }

    });

    const contentDispositionDataHeaderLike = headers['content-disposition'];
    const contentTypeDataHeader = headers['content-type'];

    const {name , filename} = await parseContentDisposition(contentDispositionDataHeaderLike) ;

    return {
        name , 
        filename ,
        contentType:contentTypeDataHeader || null ,
    }

    async function parseContentDisposition(contentDispositionStringLike) {

        let name = null ;
        let filename = null ;

        if(contentDispositionStringLike !== undefined) {
            
            const namematch = contentDispositionStringLike.match(/name="([^"]+)"/);
            const filenamematch = contentDispositionStringLike.match(/filename="([^"]+)"/);

            if(namematch !== null) {

                name = namematch[1] ;
            }

            if(filenamematch !== null) {

                filename = filenamematch[1] ;
            }
        }

        return {
            name , 
            filename ,
        }
    }
}

async function _splitPart(partBuffer) {
    
    const partSeparatorBuffer = Buffer.from('\r\n\r\n');

    const partSeparatorBufferIndex = await _findBufferIndex(partBuffer , partSeparatorBuffer);

    if(partSeparatorBufferIndex === -1) {
        _log('incorrect data part'.toUpperCase());
        return null;
    }

    const headersDataPartBuffer = partBuffer.subarray(0 , partSeparatorBufferIndex);
    let bodyEndBufferIndex = partBuffer.length ;

    if(partBuffer[partBuffer.length - 2] === 0x0d && partBuffer[partBuffer.length - 1] === 0x0a) {
        bodyEndBufferIndex -= 2 ;
    }

    const bodyDataPartBuffer = partBuffer.subarray(
        partSeparatorBufferIndex + partSeparatorBuffer.length , 
        bodyEndBufferIndex
    );

    return {
        headers:headersDataPartBuffer ,
        body:bodyDataPartBuffer ,
    }
    
}

async function _splitBuffer(buffer , separator) {
    
    const parts = []; 

    let start = 0 ;
    let index = 0;

    while ((index = await _findBufferIndex(buffer , separator , start)) !== -1) {

        const foundPartBuffer = buffer.subarray(start , index);
        parts.push(foundPartBuffer);
        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(buffer.subarray(start));

    return parts ;
}

async function _findBufferIndex(buf , sep , start = 0) {

    for (let ind = start ; ind < (buf.length - sep.length) ; ind++) {
        let found = true ;

        for (let j = 0 ; j < sep.length ; j++) {
            
            if(buf[ind + j] !== sep[j]) {
                found = false; 
                break;
            }
        }

        if(found === true) {

            return ind ;
        }
    }

    return -1 ;
}
