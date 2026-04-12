const { GLOBAL_CONSTANTS } = require('../../../constants/global.constants');
const {
    multipartFormHandler,
} = require('../../_multipart-parser/controller/controller');
const { ContentTypeHandlersRouter } = require('../models/content-type.router');

const contentTypeHandlersRouter = new ContentTypeHandlersRouter();

contentTypeHandlersRouter.registrateContentTypeHandler(
    GLOBAL_CONSTANTS.FORM_DATA_CONTENT_TYPES.MULTIPART_FORM_DATA,
    multipartFormHandler.handle.bind(multipartFormHandler)
);

module.exports = { contentTypeHandlersRouter };
