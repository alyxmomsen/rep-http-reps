class RequestManager {
    /**
     *
     * @param {Object} body
     */
    async exec(body = {}) {
        const response = await fetch(this.#url, {
            method: this.#method,
            ...(this.#method === 'get' ? {} : { body }),
        });

        this.#executeMiddleware([...this.#middleware], this.#handler, {
            response,
        });
    }

    async #executeMiddleware(middleware, finalHandler, payload) {
        let index = 0;

        const next = async (nextPayload) => {
            if (index < middleware.length) {
                const currentIndex = index++;

                const handler = middleware[currentIndex];

                if (handler) {
                    try {
                        await handler(nextPayload, next);
                    } catch (error) {
                        throw error;
                    }
                }
            } else {
                if (finalHandler) {
                    await finalHandler(nextPayload, next);
                }
            }
        };

        if (middleware.length > 0) {
            await next(payload);
        } else if (finalHandler) {
            await finalHandler(payload);
        }
    }

    /**
     * @type {string}
     */
    #url;

    /**
     * @type {string}
     */
    #method;

    /**
     * @type {((payload:Object, next:(payload:Object) => Promise<any>) => Promise<any>)[]}
     */
    #middleware;

    /**
     * @type {(payload:Object) => Promise<any>}
     */
    #handler;

    constructor(url, method, ...handlers) {
        if (!url) {
            throw new Error(`url required but not provided`);
        }

        if (!method) {
            throw new Error(`method required but not provided`);
        }

        if (!handlers.length) {
            throw new Error(`handlers.length must be > "0"`);
        }

        this.#method = method;
        this.#url = url;

        this.#middleware = handlers.length > 0 ? handlers.slice(0, -1) : [];
        this.#handler = handlers[handlers.length - 1];
    }
}
