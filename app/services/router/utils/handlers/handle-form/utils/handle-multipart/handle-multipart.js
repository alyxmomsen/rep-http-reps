const MultipartCompiler = require("../../../../../../multipart-compiler/multipart-compiler");
const registry = require("../../../../../../../../services/registry/registry");
const splitBufferByBoundary = require("./utils/split-buffer");
const filemanager = require("../../../../../../../../services/upload-service/upload-service");

async function handleMultipartFormData(dataBuffer, payload) {
    


    const assmbledFilesMIME = {
        'video/x-matroska':{
            handler:() => {
                console.log('video');
            }      
        } ,
        'audio/mpeg':{
            handler:() => {
                console.log();
            }      
        } ,
        'image/jpeg':{
            handler:() => {
                console.log();
            }      

        } ,
    }
    
    const { rawBoundaryStringLike , res } = payload ;

    const boundary = await extractBoundary(rawBoundaryStringLike) ;

    console.log({boundary});

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

    const assembledFilesMap = multipartCompiller.getAssembledFiles();

    
    for (const [_ , bundle] of assembledFilesMap.entries()) {

        await registry.add(bundle);
        
    }

    const allItems = await registry.getAllItems();

    console.log({allItems});

    // const allitems = await registry.getAllItems();

    // console.log({allitems});

    // -------------

    res.writeHead(200 , 'ok' , {
        'content-type':"application/json" ,
    });
    res.end(JSON.stringify({message:'hello from multipart-formdata handler'}));
}

module.exports = handleMultipartFormData ;

async function extractBoundary (rawBoundaryString) {
    
    const match = rawBoundaryString.match(/boundary=(----[^$\s;+=-]+)/);

    if (!match) {
        return null ;
    }

    return `--${match[1]}` ;

}