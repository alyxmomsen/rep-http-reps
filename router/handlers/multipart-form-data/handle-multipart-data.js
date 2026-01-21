const getFilesFromStorage = require("../../../services/custom-store-manager/controller/get-files");
const uploadFilesIntoStorage = require("../../../services/custom-store-manager/controller/upload-files-command");
const _splitBufferBy = require("./utils/split-buffer-by-separator");

async function handleMultipartData (req , res , dataBuffer , boundaryStr = null) {

    const { url , method , params , queryParams , headers } = req ;
    console.log({url , method  ,params , queryParams , dataBuffer });

    if(boundaryStr === null) {
        console.log('no boundary');
        res.en();
        return;
    }
    
    const parts  = await _splitBufferBy(dataBuffer , Buffer.from(boundaryStr));

    uploadFilesIntoStorage();
    getFilesFromStorage();

    console.log({parts});

    res.end();
    return ;
}

module.exports = handleMultipartData ;

