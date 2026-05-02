const { IncomingMessage, ServerResponse } = require('http');

class MiddlewareExecutor {
    /**
     * @param {{req:IncomingMessage;res:ServerResponse}} ctx
     * @param {import("../../../services/router/model/router.model").RouteMiddleware[]} middleware
     * @param {import("../../../services/router/model/router.model").RouteFinalHandler} finalHandler
     */
    async exec(ctx, middleware, finalHandler) {
        const Args = {
            middleware,
        };

        let index = 0;

        const next = async function () {
            if (index < Args.middleware.length) {
                const currentIndex = index++;

                const handler = Args.middleware[currentIndex];

                if (handler) {
                    await handler(ctx, next);
                }
            } else {
                if (finalHandler) {
                    await finalHandler(ctx);
                }
            }
        };

        await next();
    }

    constructor() {}
}

module.exports = { MiddlewareExecutor };
