const http = require('http');
const { GLOBAL_CONSTANTS } = require('../../../constants/global.constants');
const {
    multipartFormHandler,
} = require('../../_multipart-parser/controller/controller');
const { FormHandler } = require('../form-parser.router.entry-point');
const { ContentTypeHandlersRouter } = require('../models/content-type.router');

const contentTypeHandlersRouter = new ContentTypeHandlersRouter();

contentTypeHandlersRouter.registrateContentTypeHandler(
    GLOBAL_CONSTANTS.FORM_DATA_CONTENT_TYPES.MULTIPART_FORM_DATA,
    multipartFormHandler.handle.bind(multipartFormHandler)
);

module.exports = { contentTypeHandlersRouter, formDataParserFactory };

/**
 *
 * @param {Object} deps
 * @param {ContentTypeHandlersRouter} deps.contentTypeHandlersRouter
 */
function formDataParserFactory(deps) {
    if (!deps.contentTypeHandlersRouter) {
        throw new Error(`deps.contentTypeHandlersRouter required`);
    }

    if (
        deps.contentTypeHandlersRouter &&
        deps.contentTypeHandlersRouter instanceof ContentTypeHandlersRouter ===
            false
    ) {
        throw new Error(
            `deps.contentTypeHandlersRouter must be instance of ContentTypeHandlersRouter`
        );
    }

    /**
     *
     * @param {{req:http.IncomingMessage, res:http.ServerResponse}} ctx
     * @returns
     */
    const fn = async function (ctx) {
        if (!ctx) {
            throw new Error(`deps.ctx required`);
        }

        if (ctx.req instanceof http.IncomingMessage === false) {
            throw new Error(
                `deps.ctx.req must be an instance of http.IncomingMessage`
            );
        }

        if (ctx.res instanceof http.ServerResponse === false) {
            throw new Error(
                `deps.ctx.res must be an instance of http.ServerResponse`
            );
        }

        return await FormHandler.processForm(ctx.req, ctx.res, {
            contentTypeHandlersRouter: deps.contentTypeHandlersRouter,
        });
    };

    return fn;
}
