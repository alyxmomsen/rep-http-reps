const { kMaxLength } = require("buffer");
const FileManager = require("../../services/file-handlers/file-compiler");

const filemanager = new FileManager();

async function handleForm(req , res) {
    
    const { headers } = req; 

    const contentTypeHeader = headers['content-type'];

    try {

        const boundaryString = await extractBoundaryString(contentTypeHeader);
    
        const dataBufferChunks = [];
        req.on('data', (chunk) => {
            dataBufferChunks.push(chunk);
        });
    
        req.on('end', async () => {
            
            const wholeBuffer = Buffer.concat(dataBufferChunks);
    
            const parts = await splitBuffer(wholeBuffer, Buffer.from(`--${boundaryString}`));
            
            console.log({ parts });
            
            for (const part of parts) {

                await handlePart(part);
            }

            filemanager.upload();

        });
    }
    catch (error) {

        console.log('handle form error: ' , {error});
    }

    res.end('form not handled');
}

module.exports = handleForm;

async function handlePart(partBuffer) {
    
    

    const dataPartSeparatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = await _findIndex(partBuffer, dataPartSeparatorBuffer);
    
    if (separatorIndex === -1) {
        console.log('incorrect part'.toUpperCase());
        return null;
    }

    const headersPart = partBuffer.subarray(0, separatorIndex);
    let bodyEndBufferIndex = partBuffer.length;
    if (partBuffer[partBuffer.length - 2] === 0x0d && partBuffer[partBuffer.length - 1] === 0x0a) {
        bodyEndBufferIndex -= 2;
    }
    const bodyPartBuffer = partBuffer.subarray(separatorIndex + dataPartSeparatorBuffer.length , bodyEndBufferIndex);
    
    filemanager.gulp(headersPart , bodyPartBuffer);

}

async function splitBuffer(buffer, separator) {
    
    console.log({separator:separator.toString('utf-8')});

    const parts = [];

    let start = 0;
    let index = 0;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {



        const part = buffer.subarray(start , index);
        parts.push(part)
        start = index + separator.length;

        if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2;
        }
    }

    parts.push(buffer.subarray(start));

    return parts;
}

async function _findIndex(buf , sep , start = 0) {
    
    for (let index = start; index < buf.length - sep.length; index++) {
        let found = true;

        for (let j = 0; j < sep.length; j++) {
            if (buf[index + j] !== sep[j]) {
                found = false;
                break;
            }
        }

        if (found === true) {
            return index;
        }
    }

    return -1;
}

async function extractBoundaryString(contentTypeHeader) {
    
    if (contentTypeHeader === undefined) throw Error('no content type');

    const match = contentTypeHeader.match(/boundary=([^;\s$]+)/);

    if (match === null) throw new Error('no boundary');

    return match[1];

}