const registry = require("../../../../../../../../services/registry/registry");
const findIndexInBuffer = require("../../../../../../../../utils/find-index-in-buffer");
const MultipartDataCompiler = require("./multipart-data-compiler/compiler");

async function multipartDataHandler (formdatabuffer , payload) {

    const { contentTypeHeaderMetaData , res } = payload ;

    const boundary = extractBoundary(contentTypeHeaderMetaData);

    if(!boundary) {
        throw new Error('no boundary data'.toUpperCase());
    } 

    const formdataparts = splitBuffer(formdatabuffer , Buffer.from(boundary));

    console.log(`multipart/form-data handler` , {formdatabuffer , contentTypeHeaderMetaData});

    const multipartCompiler = new MultipartDataCompiler();

    for (const formdataPart of formdataparts) {

        try {
            const { body , headers:rawHeadersPart } = splitFormDataPart(formdataPart);
            
            const formdataHeaders = parseHeaders(rawHeadersPart.toString('utf-8'));

            const contentDisposition = formdataHeaders['content-disposition'] || null ;
            const contentType = formdataHeaders['content-type'] || null ;

            const contentDispositionName = parseContentDispositionByPropetyKey(contentDisposition , 'name');
            const contentDispositionFileName = parseContentDispositionByPropetyKey(contentDisposition , 'filename');

            const { id  , name , target , type } = parseContentDispositionNamePropertyValue(contentDispositionName);

            const bundle = {
                contentType ,
                filename:contentDispositionFileName ,
                body ,
                semantic:{
                    id , name ,
                    target , type ,
                }
            }
            
            multipartCompiler.gulpOnePiece(bundle);
        }
        catch (e) {

            console.log({e});
        }
    }

    const files = multipartCompiler.getAssembledDataArray();

    const uploadedFiles = [];
    const notUploaded = [] ;
    for (const file of files) {


        const { filename } = file ;
        const uploadStatus = await registry.add(file);
        if(uploadStatus) {
            notUploaded.push(filename);
            continue ;
        }

        uploadedFiles.push(filename);
    }

    res.end(JSON.stringify({payload:{
        uploaded:uploadedFiles ,
        notUploaded ,
    }}));
}

module.exports = multipartDataHandler ;

// utils 

function parseContentDispositionNamePropertyValue (value) {

    const [ subj , target ] = value.split('--');

    const [type , id , name ] = subj.split('.') ;

    return {
        type , id ,
        name , target ,
    }

}


function parseContentDispositionByPropetyKey (contentDispositionData , propertyKey) {

    const regex = new RegExp(`${propertyKey}="([^"]+)"`);

    const match = contentDispositionData.match(regex);

    return match ? match[1] : null ;

}

function parseHeaders (headersPartString) {

    const headers = {} ;
    const headersrows = headersPartString.split('\r\n');

    headersrows.forEach(row => {
        const [key , value] = row.split(": ");
        if(key , value) {
            headers[key.toLowerCase()] = value ;
        }
    });

    return headers ;
}

function splitFormDataPart (formdataPartBuffer) {
    
    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = findIndexInBuffer(formdataPartBuffer , separatorBuffer);

    if(separatorIndex === -1) throw new Error(`incorrect part`.toUpperCase());
    
    const headers = formdataPartBuffer.subarray(0 , separatorIndex);
    let bodyEndBufferIndex = formdataPartBuffer.length ;
    if(formdataPartBuffer[bodyEndBufferIndex - 2] === 0x0d && formdataPartBuffer[bodyEndBufferIndex - 1] === 0x0a) {
        bodyEndBufferIndex -= 2 ;
    }

    const body = formdataPartBuffer.subarray(separatorIndex + separatorBuffer.length , bodyEndBufferIndex);

    return {
        body , 
        headers ,
    }

}

function splitBuffer (buffer , separator) {

    console.log({buffer , separator:separator.toString('utf-8')});


    const  parts = [] ;    
    let start = 0 ;
    let index = 0 ;
    while ((index = findIndexInBuffer(buffer , separator , start)) !== -1) {
        console.log({index});
        parts.push(buffer.subarray(start , index));
        start = index + separator.length ;

        if(buffer[start] === 0x0d || buffer[start + 1] === 0x0a) {
            start += 2 ;
        } 
    }

    parts.push(buffer.subarray(start));

    return parts ;
}

function extractBoundary (boundaryContainedString) {

    const boundarymatch = boundaryContainedString.match(/boundary=(----[^$;+-\s]+)/);

    return boundarymatch ? `--${boundarymatch[1]}` : null ; 

}