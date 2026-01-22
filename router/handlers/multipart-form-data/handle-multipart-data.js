const getFilesFromStorage = require("../../../services/custom-store-manager/controller/get-files");
const uploadFilesIntoStorage = require("../../../services/custom-store-manager/controller/upload-files-command");
const FormDataCompiler = require("./services/form-data-compiler");
const findBufferIndex = require("./utils/find-buffer-index");
const _splitBufferBy = require("./utils/split-buffer-by-separator");

const formDataCompiler = new FormDataCompiler();

async function handleMultipartData (req , res , dataBuffer , boundaryStr = null) {

    const { url , method , params , queryParams , headers } = req ;
    console.log({url , method  ,params , queryParams , dataBuffer });

    if(boundaryStr === null) {
        console.log('no boundary');
        res.en();
        return;
    }
    
    const parts  = await _splitBufferBy(dataBuffer , Buffer.from(boundaryStr));

    for (const part of parts) {

        try {

            const handledPart = await handleFormPart(part);
            formDataCompiler.gulpOne(handledPart);
        }
        catch(e) {

            console.log({e});
        }
    }
    
    formDataCompiler.complete();

    res.end();
    return ;
}

module.exports = handleMultipartData ;

// combine handling of the data
async function handleFormPart (dataBuffer) {
    
    try {
        const [headersPart , bodyPart] = await splitBuffer(dataBuffer , Buffer.from(`\r\n\r\n`));

        if(bodyPart === undefined) {
            throw new Error('incorrect data part'.toUpperCase());
        }

        // console.log({headersPart:headersPart.toString('utf-8') , bodyPart});

        const rows = await splitBuffer(headersPart , Buffer.from(`\r\n`));

        const headers  = {};
        rows.forEach(row => {
            const [key , value] = row.toString('utf-8').split(': ');
            if(key && value) {
                
                headers[key.toLowerCase()] = value;
            }
        });

        const contentDispositionHeader = headers['content-disposition'] || null ;
        const contentTypeHeader = headers['content-type'] || null ;

        
        const {name:nameInputAttr , filename} = await parseContentDispositionHeader(contentDispositionHeader);
        
        console.log({contentTypeHeader , nameInputAttr , filename});
    }
    catch (e) {
        
        console.log({e});
    }
    
}

async function parseNameInputAttrData (params) {
    
}

async function parseContentDispositionHeader(contentDispositionHeader) {

    const namematch  = contentDispositionHeader.match(/name="([^"]+)"/);
    const filenamematch = contentDispositionHeader.match(/filename="([^"]+)"/);

    return {
        name:namematch === null ? null : namematch[1] ,
        filename:filenamematch === null ? null : filenamematch[1] ,
    }
}

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