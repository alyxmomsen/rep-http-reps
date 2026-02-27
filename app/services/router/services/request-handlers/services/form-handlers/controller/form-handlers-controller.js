const { handleMultipart } = require("../multipart-handler/handle-multipart");

const CONSTANTS = {
    FORM_CONTENT_TYPE:{
        MULTIPART_FORMDATA:'multipart/form-data' ,
        APPLICATION_X_WWW_FORM_URLENCODED:'application/x-www-form-urlencoded' ,
        TEXT_PLAIN:'text/plain' ,
    } ,
}

// retistry handlers
const fomrHandlers = new Map();
fomrHandlers.set(CONSTANTS.FORM_CONTENT_TYPE.MULTIPART_FORMDATA , handleMultipart);
// fomrHandlers.set(CONSTANTS.FORM_CONTENT_TYPE.APPLICATION_X_WWW_FORM_URLENCODED , handleMultipart);
// fomrHandlers.set(CONSTANTS.FORM_CONTENT_TYPE.TEXT_PLAIN , handleMultipart);

module.exports = { fomrHandlers , CONSTANTS } ;