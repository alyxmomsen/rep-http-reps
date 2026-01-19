const { randomBytes } = require("node:crypto");
const _splitBuffer = require("../../utils/split-buffer");

async function handleMultipartData(dataBuffer , payload) {

    const {contenTypeHeader}  = payload ;

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

        console.log({dataBufferPart});
        // await handleFormInputDataPart(dataBufferPart , async () => {console.log(`input data handler`)});
    }
}

module.exports = handleMultipartData;