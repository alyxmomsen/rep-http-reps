const { sendFallBack } = require("../../../../utils/error-factory");

const MULTIPART_HANDLER_CONSTANTS = {
    PAYLOAD_ARGUMENT_DATA_KEYS: {
        PAYLOAD_DATA_KEY:'contentTypeAttribute' , // #hardcode
    }
}

async function multipartHandler(req , res , payload) {
    
    const { PAYLOAD_DATA_KEY } = MULTIPART_HANDLER_CONSTANTS.PAYLOAD_ARGUMENT_DATA_KEYS ;

    const contentTypePayload = payload[PAYLOAD_DATA_KEY] || null ;

    const boundary = (contentTypePayload?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

    console.log({boundary , contentTypePayload});

    if(!boundary) {
        sendFallBack(res ,400 , 'multipartHandler' , 'no boundary given' , {boundary , payload , contentTypePayload});
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

module.exports = { multipartHandler , MULTIPART_HANDLER_CONSTANTS }

function splitFormData () {
    return [] ;
}
