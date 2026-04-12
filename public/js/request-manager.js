class RequestManager {
    /**
     *
     * @param {Object} body
     */
    async execute(body = {}) {
        const response = await fetch(this.#url, {
            method: this.#method,
            ...(this.#method === 'get' ? {} : { body }),
        });

        await this.#executeMiddleware(
            [...this.#middleware],
            this.#finalHandler,
            { response }
        );
    }

    addMiddleware(...middleware) {
        middleware.forEach((mw) => {
            this.#middleware.push(mw);
        });
    }

    /**
     *
     * @param {} middleware
     */
    async #executeMiddleware(middleware, finalHandler, ctx) {
        let index = 0;

        const next = async () => {
            if (index < middleware.length) {
                const currentIndex = index++;

                const handler = middleware[currentIndex];

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

    /**
     * @type {string}
     */
    #method;
    /**
     * @type {string}
     */
    #url;

    /**
     * @type {((ctx:{}, next:() => Promise<any>) => Promise<any>)[]}
     */
    #middleware;

    /**
     * @type {() => Promise<any>}
     */
    #finalHandler;

    constructor(url, method, finalHandler) {
        this.#url = url;
        this.#method = method;

        this.#middleware = [];
        this.#finalHandler = finalHandler;
    }
}
