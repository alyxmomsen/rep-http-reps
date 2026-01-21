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
        await handleFormPart(part);
    }
    
    res.end();
    return ;
}

module.exports = handleMultipartData ;

// handle form data piece
async function handleFormPart(formDataItemBuffer) {
    
    const separatorBuffer = Buffer.from(`\r\n\r\n`);

    const separatorIndex = _splitBufferBy(formDataItemBuffer , separatorBuffer);

    if(separatorIndex === -1) return console.log(`incorrect part`.toUpperCase());

    const headersPartBuffer = formDataItemBuffer.subarray(0 , separatorIndex);
    let bodyBufferEndIndex = formDataItemBuffer.length ;
    if(formDataItemBuffer[bodyBufferEndIndex - 2] === 0x0d && formDataItemBuffer[bodyBufferEndIndex - 1] === 0x0a) {
        bodyBufferEndIndex -= 2 ;
    }

    const bodyPartBuffer = formDataItemBuffer.subarray(separatorIndex + separatorBuffer.length , bodyBufferEndIndex);
    
    console.log({header:headersPartBuffer.toString('utf-8') , bodyPartBuffer});
}