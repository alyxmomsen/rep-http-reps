const { createWriteStream } = require('fs');
const { join } = require('path');
const { Readable } = require('stream');

async function handleMultipart (contentTypeHeaderData , formDataBuffer) {
    
    const boundary = contentTypeHeaderData.match(/boundarsy=(----[^;\s]+)/);
    
    if(boundary === null) {
        return null
    }

    const parts = await _getDataBufferParts(formDataBuffer , Buffer.from(boundary[1]));

    console.log(boundary);

}

module.exports = handleMultipart ;


async function _getDataBufferParts (dataBuffer , boundaryBuffer) {

    const parts = [] ;

    let start = 0 ;
    let index = 0 ;

    while () {

    }

    return ;
}

async function _findIndex (buffer , separator , start = 0) {


}
