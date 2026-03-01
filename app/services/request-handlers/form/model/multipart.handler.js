const { sendFallBack } = require("../../../../utils/error-factory");

const CONSTANTS = {
    /* 
    тот самый ключ который сопровождает bundle 
    возвращаемый фабрикой contentTypeHandlerFactory
    он же используется здесь ниже для взятия значения из объекта payload
     */
    PAYLOAD_DATA_KEY:'boundaryRawData' ,
}

async function multipartHandler(req , res , payload) {

    console.log('multipart handler...' , {payload});
    
    const { PAYLOAD_DATA_KEY } = CONSTANTS ;

    const boundaryRawString = payload[PAYLOAD_DATA_KEY] || null ;

    const boundary = (boundaryRawString?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

    console.log({boundary , contentTypePayload: boundaryRawString});

    if(!boundary) {
        sendFallBack(res ,400 , 'multipartHandler' , 'no boundary given' , {boundary , payload , contentTypePayload: boundaryRawString});
        return ;
    }

    const formDataChunks = [] ;
    req.on('data' , (chunk) => {
        formDataChunks.push(chunk);
    }); 

    req.on('end' , () => {

        console.log('form processing end');
        
        const wholeFormDataBuffer = Buffer.concat(formDataChunks);
        const parts = splitFormData(wholeFormDataBuffer , Buffer.from(`--${boundary}`));

        res.end('hello world');
    });

}

module.exports = { multipartHandler , CONSTANTS }

function splitFormData () {

    while (false) {

    }

    return [] ;
}
