const MultipartCompiler = require("../../../../../../multipart-compiler/multipart-compiler");
const registry = require("../../../../../../../../services/registry/registry");
const uploadService = require("../../../../../../../../services/upload-service/upload-service");
const splitBufferByBoundary = require("./utils/split-buffer");

async function handleMultipartFormData(dataBuffer , payload) {
    
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