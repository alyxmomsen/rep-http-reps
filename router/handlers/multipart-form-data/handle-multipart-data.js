const storageManager = require("../../../services/custom-store-manager/custom-storage-manager");
const FormDataCompiler = require("./services/form-data-compiler");
const parseFormItem = require("./utils/parse-form-item");
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

            const {body , contentType , filename , nameAttribute} = await parseFormItem(part);

            console.log({body , contentType  , filename, nameAttribute});

            formDataCompiler.gulpOne({body , contentType , filename  , nameAttribute});
        }
        catch(e) {

            console.log({e});
        }
    }
    
    const files = await formDataCompiler.linkPieces({storageManager});

    for (const [key  ,value] of Object.entries(files)) {

        console.log({key , value});

        storageManager.upload({
            ...value ,
        });

    }

    res.end();
    return ;
}

module.exports = handleMultipartData ;
