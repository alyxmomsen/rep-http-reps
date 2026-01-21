const { randomBytes } = require("crypto");
const { readFile } = require("fs/promises");
const { join } = require("path");
const handleMultipartData = require("./sub-handlers/handle-multipart-data");
const { factoryDecorator } = require("./utils/contetn-type-matcher-factory");
const CustomStoreManager = require("../../services/custom-store-manager");

const customStoreManager = new CustomStoreManager();

const fallbackresponse = (res ,message) => {
    
    console.log(message);
}

async function handleFormData(req , res) {
    
    const { headers } = req; 

    const contenTypeHeader = headers['content-type'];

    console.log({contenTypeHeader});

    if(contenTypeHeader === undefined) {
        fallbackresponse(res , 'no content-type header');
        return ;
    }

    const [contentTypeStr , ...attr] = contenTypeHeader.split('; ');

    console.log({contenTypeHeader , contentTypeStr , attr});
    
    const matcherFactory = await factoryDecorator(contentTypeStr);
    
    const matchers = [
        await matcherFactory(
            'multipart/form-data',
            handleMultipartData,
            {
                contenTypeHeader,
                customStoreManager,
            }
        ) ,
        await matcherFactory('application/x-www-form-urlencoded' , (dataBuffer , payload) => {
            console.log(`application/x-www-form-urlencoded handler`);
        } , {}) ,
        await matcherFactory('text/plain' , (dataBuffer , payload) => {
            console.log(`text/plain handler`);
        } , {}) ,
    ];

    let totalSize = 0 ;
    let dataBufferChunks = [] ;
    req.on('data' , async (chunk) => {
        totalSize += chunk.length; 
        dataBufferChunks.push (chunk);
    });

    req.on('end' , async () => {

        
        const wholeBufferData = Buffer.concat(dataBufferChunks);

        
        for (const matcher of matchers) {
            const handlerLike = await matcher();

            console.log({handlerLike});

            if(handlerLike === null) continue ;
            const handler = handlerLike ;
            handler(wholeBufferData);
        }

        try {
            const file = await readFile(join('.' , 'view' , 'form.html'));
            res.end(file);
            return ;
        }
        catch (e) {
            console.log('handle form error' , {e});
            res.end('handle form error');
            return ;
        }
    });
}

module.exports = handleFormData;


async function handleFormInputDataPart(dataBufferPart , behavior) {

    console.log(dataBufferPart);

    behavior();

}

