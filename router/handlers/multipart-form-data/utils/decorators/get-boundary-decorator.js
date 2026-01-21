
/* 
preserves the handler's content-type signature by adding the functionality 
of extracting a boundary-string from a content-type header 
*/
async function extractBoundaryDecorator(handler , contenTypeHeaderString) {
    
    return async (req , res , dataBuffer) => {

        const boundary = await extractBoundary(contenTypeHeaderString);

        await handler(req , res , dataBuffer , boundary);
    }
}

module.exports = extractBoundaryDecorator ;

/* 
additional functionality for the handler 
*/
async function extractBoundary (contentTypeHeaderString) {
    
    if(!contentTypeHeaderString) return null ;

    const match = contentTypeHeaderString.match(/boundary=(----[^;\\\/$\s]+)/);

    if(match === null) return null ;

    return `--${match[1]}` ;
}