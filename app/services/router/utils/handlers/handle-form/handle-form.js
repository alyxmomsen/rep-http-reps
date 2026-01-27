const handleMultipartFormData = require("./utils/handle-multipart/handle-multipart");

async function handleForm(req , res) {

    const colorsEscapes = {
        'red':'\x1b[31m' ,
        'green':'\x1b[32m' ,
        'default':'\x1b[0m' ,
    }

    console.log('handle form...');
    
    const { headers } = req ;
    const contentTypeHeader = headers['content-type'];

    if(contentTypeHeader === undefined) {
        res.end('no content-type header');
        return ;
    }

    const [contentTypeString , contentTypeMetaLike] = contentTypeHeader.split('; ');
    
    const contentTypeMatchers = [

        await typeMatcherFactory('multipart/form-data' , {rawBoundaryStringLike:contentTypeMetaLike , res} , handleMultipartFormData ) ,
        await typeMatcherFactory('text/plain' , {} , () => {} ) ,
        await typeMatcherFactory('application/x-www-form-urlencoded' , {} , () => {} ) ,
    ] ;

    const bufferParts = [];
    req.on('data' , async (formdatachunk) => {
        bufferParts.push(formdatachunk);
    });

    

    req.on('end' , async () => {

        const wholeDataBuffer  = Buffer.concat(bufferParts);

        for (const matcher of contentTypeMatchers) {

            const handlerLike = await matcher(contentTypeString);
            if(handlerLike === null) continue ;
            await handlerLike(wholeDataBuffer);
            return ;
        }

        res.end('x1b[31mno matcher'.toString);
        return;

    });

}

module.exports = handleForm ;

// async function parseContentTypeHeader (contentTypeHeaderString) {
    
//     console.log({contentTypeHeaderString});

//     const match = contentTypeHeaderString.match(/content-type=/);


// }

async function  typeMatcherFactory (matcherString , payload , handler ) {
    
    return async (testString) => {

        if(testString === matcherString) {

            return async (dataBuffer) => {
    
                await handler(dataBuffer , payload);
            }
        }

        return null ;

    }
}