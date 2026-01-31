const MultipartCompiler = require("../../../../../../multipart-compiler/multipart-compiler");
const registry = require("../../../../../../../../services/registry/registry");
const splitBufferByBoundary = require("./utils/split-buffer");
const filemanager = require("../../../../../../../../services/upload-service/upload-service");

async function handleMultipartFormData(dataBuffer, payload) {
    
    const { rawBoundaryStringLike , res } = payload ;

    const boundary = await extractBoundary(rawBoundaryStringLike) ;

    const parts = await splitBufferByBoundary(dataBuffer , Buffer.from(boundary));

    const multipartCompiller = new MultipartCompiler();

    for (const part of parts) {

        try {

            await multipartCompiller.gulpOnePiece(part);
        }
        catch (err) {

            console.log({err});
        }

    }


    // storing assembled files to the Registry
    // and upload them

    const assembledFilesMap = multipartCompiller.getAssembledFiles();

    for (const [_ , bundle] of assembledFilesMap.entries()) {

        try {
            
            await registry.add(bundle);
        }
        catch (e) {

            console.log('registry add error: ' , {e});
        }

        
    }

    // compile the response payload

    const allItems = await registry.getAllItems();

    // ------------- compile and response payload -------------

    const _payload = {
        audio:[] ,
        video:[] ,
        images:[],
    }

    for (const [itemId , value] of allItems.entries()) {

        const {filename , contentType} = value ;

        const payloadItem = {
            id:itemId ,
            filename ,
            contentType ,
        }

        switch (contentType) {
            case 'video/x-matroska':
                _payload.video.push(payloadItem);
                break;
            
            case 'audio/mpeg':
                _payload.audio.push(payloadItem);
                break;
            case 'image/jpeg':
                _payload.images.push(payloadItem);
                break;
            default:
                //
        }

    }

    console.log('payload bundle to frontend' , _payload);

    res.writeHead(200 , 'ok' , {
        'content-type':"application/json" ,
    });

    res.end(JSON.stringify({message:'media data bundle' , payload:{..._payload} , status:0}));
}

module.exports = handleMultipartFormData ;




async function extractBoundary (rawBoundaryString) {
    
    const match = rawBoundaryString.match(/boundary=(----[^$\s;+=-]+)/);

    if (!match) {
        return null ;
    }

    return `--${match[1]}` ;

}