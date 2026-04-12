class RequestManager {
    /**
     *
     * @param {Object} body
     */
    async execute(body = {}) {
        await this.#executeMiddleware(
            this.#beforeRequestMiddleware,
            this.#beforeRequestFinalHandler
        );

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

    /**
     *
     * @param {(ctx:Object, next?:() => Promise<any>) => Promise<any>} handler
     */
    beforeRequest(...middleware) {
        middleware.forEach((mw) => {
            this.#beforeRequestMiddleware.push(mw);
        });
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

    /**
     * @type {(ctx:Object, next:() => Promise<any>) => Promise<any>}
     */
    #beforeRequestMiddleware;

    /**
     * @type {(ctx) => Promise<any>}
     */
    #beforeRequestFinalHandler;

    constructor(url, method, finalHandler, beforeRequestFinalHandler) {
        if (!url || !method || !finalHandler || !beforeRequestFinalHandler) {
            throw new Error(`required all`);
        }

        this.#url = url;
        this.#method = method;

        this.#middleware = [];
        this.#finalHandler = finalHandler;

        this.#beforeRequestMiddleware = [];

        this.#beforeRequestFinalHandler = beforeRequestFinalHandler;
    }
}
