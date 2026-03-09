const { FormContentTypeRouter , CONTENT_TYPES } = require("../../../form-handler/model/content-type.router.model");
const { multipartHandler } = require("../model/content-type-handlers/multipart-handler");
// const { FormContentTypeRouter , CONTENT_TYPES } = require("../model/content-type.router.model");

const { MULTIPART_FORMDATA } = CONTENT_TYPES ;

const contentTypeRouter = new FormContentTypeRouter();

contentTypeRouter.addRoute(MULTIPART_FORMDATA , multipartHandler);

// module.exports = { contentTypeRouter , CONTENT_TYPES }

function factory () {
    
}