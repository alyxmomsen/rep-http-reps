const { randomBytes } = require("node:crypto");
const _splitBuffer = require("../../../utils/split-buffer");

async function handleMultipartData(dataBuffer , payload) {

    const {contenTypeHeader , customStoreManager}  = payload ;

    const boundaryMatch = contenTypeHeader.match(/boundary=(----[^$;\s]+)/);
    if(boundaryMatch === null) {
        console.log('no boundary');
        return ;
    }
    const boundaryString = `--${boundaryMatch[1]}` ;
    const boundaryBuffer = Buffer.from(boundaryString);
    
    console.log(`multipart handler`);

    console.log(`call multipart handler ${randomBytes(32).toString('hex')}`);
    const dataBufferParts = await _splitBuffer(dataBuffer , boundaryBuffer);
        
    for (const dataBufferPart of dataBufferParts) {

        await customStoreManager.gulp(dataBufferPart);

    }
}

module.exports = handleMultipartData;

