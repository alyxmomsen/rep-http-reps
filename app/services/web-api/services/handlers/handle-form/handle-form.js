const contentTypeMatcherFactory = require("./utils/facrories/content-type-matcher-factory");
const multipartDataHandler = require("./utils/multipart-data-handler/multipart-data-handler");

async function handleForm (req , res) {

    console.log('call "handle form handler"...');

    const { headers } = req ;

    const contentTypeHeader = headers['content-type'];

    if(!contentTypeHeader) {
        throw new Error('no content-type header');
    }
    
    const [contentType , contentTypeHeaderMetaData] = contentTypeHeader.split('; ');

    const matchers = [
        await contentTypeMatcherFactory('multipart/form-data' , { contentTypeHeaderMetaData , res} , multipartDataHandler ) , 
        await contentTypeMatcherFactory('text/plain' , {} , async () => {
            console.log(`text/plain handler`);
        }) , 
        await contentTypeMatcherFactory('application/x-www-form-urlencoded' , {} , async () => {
            console.log(`application/x-www-form-urlencoded handler`);
        }) , 
    ] ;


    const formdatachuncks = [] ;
    req.on('data' , (chunk) => {
        formdatachuncks.push(chunk)
    });

    req.on("end" , async () => {

        const formdataWholeBuffer = Buffer.concat(formdatachuncks);

        for (const matcher of matchers) {
            const handler = await matcher(contentType);
            if(!handler) continue ;
            handler(formdataWholeBuffer);
        }
    });

    
}

module.exports = handleForm ;