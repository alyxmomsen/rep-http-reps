const { createWriteStream } = require('fs');
const { join } = require('path');
const { ids } = require('webpack');
const multipartdatahandler = require('./form-handlers/multiparthanlder');
const _log = require('../../global-utils/log');
async function handleForm(req ,res , storeAdapter) {
    
    const { headers } = req ;
    const contentTypeHeader = headers['content-type'];

    if(contentTypeHeader === undefined) {
        console.log('no content type header');
        res.end('no content type header');
        return;
    }

    const [contentType , boundaryPartLike] = contentTypeHeader.split('; '); 


    const bufferParts = [] ;
    req.on('data' , async (chunk) => {
        bufferParts.push(chunk);
    });

    const contentTypeResolver = {
        'multipart/form-data': {
            handler: async () => {

                if(boundaryPartLike === undefined) {
                    _log('no boundary part');
                    return ;
                }

                const boundaryMatch = boundaryPartLike.match(/boundary=(----[^;\s$]+)/);

                if(boundaryMatch === null) {
                    _log('no boundary');
                    return;
                }

                const boundaryBuffer = Buffer.from(`--${boundaryMatch[1]}`);
                _log({boundaryBuffer:boundaryBuffer.toString('utf-8')});
                const wholeBuffer = Buffer.concat(bufferParts);

                await multipartdatahandler(res ,wholeBuffer , boundaryBuffer);
                
            } ,
        } ,
        'other': {
            
        } ,
    }
    
    req.on('end' , async () => {

        console.log({contentTypeHeader});
    

        const contentTypeResolveLike = contentTypeResolver[contentType] ;

        if(contentTypeResolveLike === undefined) {
            console.log('sorry no resolver');
            res.end('no resolver');
            return;
        }

        await contentTypeResolveLike.handler(); 
        
        return ;
    });
}

module.exports = handleForm ;

