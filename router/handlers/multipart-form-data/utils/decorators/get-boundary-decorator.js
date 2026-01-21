
async function extractBoundaryDecorator(handler , contenTypeHeaderString) {
    
    return async (req , res , dataBuffer) => {

        const boundary = await extractBoundary(contenTypeHeaderString);

        await handler(req , res , dataBuffer , boundary);
    }
}

module.exports = extractBoundaryDecorator ;


async function extractBoundary (contentTypeHeaderString) {
    
    if(!contentTypeHeaderString) return null ;

    const match = contentTypeHeaderString.match(/boundary=(----[^;\\\/$\s]+)/);

    if(match === null) return null ;

    return `--${match[1]}` ;
}