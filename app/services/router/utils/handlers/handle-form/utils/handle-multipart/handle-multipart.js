const splitBufferByBoundary = require("./utils/split-buffer");

async function handleMultipartFormData(dataBuffer , payload) {

    const multipartcompiler = new 
    
    console.log({dataBuffer , payload});

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

    console.log({parts});
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