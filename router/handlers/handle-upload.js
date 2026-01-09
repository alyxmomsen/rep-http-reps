
const { Readable } = require('stream');
const _Registry = require("../../services/registry");
const { createWriteStream } = require('fs');

async function _handleUpload (req , res , registry) {
    
    console.log('handle upload...');

    const contentType = req.headers['content-type'];

    if(contentType === undefined) {
        console.log('content type is undefined');
        return 
    }


    const boundaryStringMatch = contentType.match(/boundary=(----[^;$\s]+)/) ;

    if(boundaryStringMatch === null) {
        console.log('no boundary in content type header');
        return ;
    }



    const bufferParts = [] ;
    req.on('data' , async  (bufferChunk) => {

        bufferParts.push(bufferChunk);
    });

    req.on('end' , async () => {

        const wholeBufferData = Buffer.concat(bufferParts);
        const boundaryBuffer = Buffer.from(`--${boundaryStringMatch[1]}`);

        const boundaryParts = await _splitBuffer(wholeBufferData , boundaryBuffer);

        console.log('boundary parts: ' , {boundaryParts});

        for (const part of boundaryParts) {

            await _handlePart(part , registry);
            
        }

    });


    return ;
}

module.exports = _handleUpload ;

async function _handlePart (part , registry) {
    
    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = await _findIndex(part , separatorBuffer);

    if(separatorIndex === -1) {
        console.log('incorrect part'.toUpperCase());
        return 
    }

    let bodyEndBufferIndex = part.length ;

    if(part[part.length - 2] === 0x0d && part[part.length - 1] === 0x0a) {

        bodyEndBufferIndex -= 2
    }

    const headersPart = part.subarray(0 , separatorIndex);
    const bodyPart = part.subarray(separatorIndex + separatorBuffer.length , bodyEndBufferIndex);

    const headersRows = await _splitHeaders(headersPart.toString('utf-8'));

    const contentDispositionRow = headersRows['content-disposition'] ;
    
    if(contentDispositionRow === undefined) {
        console.log('no content-disposition row');
        return ;
    }

    const _filename = await _headerParse('filename' , contentDispositionRow)
    const _inputname = await _headerParse('name' , contentDispositionRow)
    const _contentType = headersRows['content-type'] || null ;

    console.log({bodyPart , headersRows , _filename , _inputname , _contentType})


    if(_filename !== null) {

        // handle file data

        if(registry instanceof _Registry === false) {

            return;
        }

        try {

            const newFilename = _filename.replace(' ' , '') ;

            const readStream = Readable.from(bodyPart);

            const _newExtendedFileName = `${Date.now()}.${newFilename}` ;

            const writeStream = createWriteStream(`./upload-data/${_newExtendedFileName}`);
            readStream.on("error" , (e) => {

                console.log('read stream error: ' , e);
            });

            readStream.on('end' , async () => {
                console.log('file uploaded'.toUpperCase());
                await registry.push(_newExtendedFileName , 'upload-data' ) ;
            })

            readStream.pipe(writeStream);

        }
        catch (e) {
            console.log('file upload error: ' , e);
        }


        return ;
    }

    // handle just input data
}

async function _headerParse (headername , row) {
    console.log({headername , row});

    const regex = new RegExp(`${headername}="([^"]+)"`);

    const match = row.match(regex)

    if(match === null) return null ;

    console.log(match[1]);

    return match[1];
}

async function _splitHeaders(headersPartString) {

    const rows = headersPartString.split('\r\n') ;

    const headers = {} ;
    rows.forEach((elem) => {

        const [key , value] = elem.split(': ');

        if(key !== undefined && value !== undefined) {
            headers[key.toLowerCase()] = value ;
        }
    });

    return headers ;
}

async function _splitBuffer (buffer , separator) {

    const parts = [] ;

    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {

        parts.push(buffer.subarray(start , index));

        start = index + separator.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }   

    parts.push(buffer.subarray(start));
    
    return parts ;

}

async function _findIndex (buf , sep , start = 0) {

    for (let index = start ; index < buf.length - sep.length ; index++) {

        let found = true ;

        for (let j = 0 ; j < sep.length ; j++) {
            
            if(buf[index + j] !== sep[j]) {
                found = false ;
                break;
            }
        }

        if(found === true) return index ;
    }
    
    return -1 ;
}