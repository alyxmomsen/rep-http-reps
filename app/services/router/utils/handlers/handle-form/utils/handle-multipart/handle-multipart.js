const MultipartCompiler = require("../../../../../../multipart-compiler/multipart-compiler");
const registry = require("../../../../../../registry/registry");
const uploadService = require("../../../../../../upload-service/upload-service");
const splitBufferByBoundary = require("./utils/split-buffer");

async function handleMultipartFormData(dataBuffer , payload) {

    const multipartcompiler = new MultipartCompiler();
    
    const { rawBoundaryStringLike , res } = payload ;

    if(!rawBoundaryStringLike) {
        res.end('no boundary header data');
        console.log('no boundary header data');
        return ;
    }
    
    
    const boundaryLike = await extractBoundary(rawBoundaryStringLike);
    
    if(boundaryLike === null) {
        
        res.end('no boundary');
        console.log('no boundary');
        return ;
    }

    console.log({boundaryLike});

    const parts = await splitBufferByBoundary(dataBuffer , Buffer.from(boundaryLike));

    for (const part of parts) {

        try {

            await multipartcompiler.gulpOnePart(part);
        }
        catch (e) {
            // console.log({e});
            console.log('incorrect part'.toUpperCase());
        }

    }
    
    uploadService ;

    const compiledItems = await multipartcompiler.getCompiledItems();

    for (const [_ , compiledItem] of compiledItems ) {
    
        registry.add(compiledItem , uploadService);
    }

    res.end();

    return ;
}

module.exports = handleMultipartFormData ;

async function handlepart (part) {
    


}

async function extractBoundary(boudaryStringLike) {
    
    const match = boudaryStringLike.match(/boundary=(----[^;\s$-+=]+)/);

    return match ? `--${match[1]}` : null ;
}