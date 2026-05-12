const http = require('http');

/**
 *
 * @param {Object} deps
 * @param {Map<string,Function>} deps.ContentTypeRoutes
 * @returns {import("../../router/model/router.model").RouteFinalHandler}
 */
function HandleFormFinalHandler(deps = {}) {
    if (!deps.ContentTypeRoutes) {
        throw new Error(
            `HandleFormFinalHandler factory: deps.contentTypeRoutes required`
        );
    }

    /**
     *
     * @type {import("../../router/model/router.model").RouteFinalHandler}
     */
    const fn = async function (ctx) {
        if (!ctx.req || !ctx.res) {
            throw new Error(
                `HandleFormFinalHandler: ctx.req && ctx.res required`
            );
        }

        const contentTypeHeader = ctx.req.headers['content-type'];

        const [contentType, contentTypePayload] =
            contentTypeHeader.split(/;\s*/);

        const ContentType = {
            contentType,
            payload: contentTypePayload,
        };

        const contentTypeHandler =
            deps.ContentTypeRoutes.get(contentType) ||
            (() => {
                console.log('alternate handler');
                return;
            });

        const ContentTypeHandlerResult = await contentTypeHandler(
            ctx.req,
            ContentType.payload
        );

        ctx.res.writeHead(200, {
            'content-type': 'application/json',
        });
        ctx.res.end(JSON.stringify(ContentTypeHandlerResult));
    };

    return fn;
}

module.exports = { HandleFormFinalHandler };
