const { multipartHandler , CONSTANTS:MULTIPART_HANDLER_CONSTANTS} = require("../model/multipart.handler");
const { ContentTypeHandlersRouter } = require("./content-type.router.model");

const contentTypeHandlersRouter = new ContentTypeHandlersRouter ;

contentTypeHandlersRouter.registrateContentTypeHandler(
    MULTIPART_HANDLER_CONSTANTS.HTML_FORM_CONTENT_TYPE, multipartHandler ,
);

module.exports = { contentTypeHandlersRouter } ;