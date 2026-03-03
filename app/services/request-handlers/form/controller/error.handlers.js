
const errorCodeHandlers = new Map();

errorCodeHandlers.set(1 , errorHandler);

function errorHandler (payload) {

    const { code , subject , message } = payload ;

    console.log(
        'multipart-form-data error handler' , 
        `code: ${code} subject: ${subject} message:${message}`, { payload }
    );
}

module.exports = { errorCodeHandlers } ;