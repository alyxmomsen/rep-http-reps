const { IncomingMessage, ServerResponse, Server } = require("http");

/**
 *
 * @typedef {{
 *  keys:string;
 *  finalHandler:Middleware;
 *  middleware:Middleware[];
 *  regex:RegExp;
 *  originalTemplate:string;
 * }} HTTPRouteBundle
 *
 * @typedef {{req:IncomingMessage;res:ServerResponse;params:Object.<strng,string>;query:Object.<string,string>;next?:() => Promise<any>}} MiddlewareArgumentContext
 *
 * @typedef {(ctx:MiddlewareArgumentContext) => Promise<any>} Middleware
 */
/**
 *
 */
class HTTPRouter {
    /**
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    async handleRequest(req, res) {
        const { method, url: rawURL } = req;

        const methodRoutes = this.#routes.get(method);

        if (!methodRoutes) {
            res.end(
                JSON.stringify({
                    message: `method <${method}> is not allowed`,
                    allowed: Array.from(this.#routes.keys()).join(","),
                }),
            );
            return;
        }

        const { url, query: rawQuery } = this.#splitURL(rawURL);

        for (const RouteBundle of methodRoutes.values()) {
            const routeRegExpMaptch = RouteBundle.regex.exec(url);

            if (!routeRegExpMaptch) {
                continue;
            }

            console.log({ RouteBundle });

            const params = [];
            RouteBundle.keys.forEach((key, i) => {
                params[key] = routeRegExpMaptch[i + 1];
            });

            const query = this.#extractQuery(rawQuery);

            this.#executeMiddleware(
                req,
                res,
                params,
                query,
                [...this.#globalMiddleware, ...RouteBundle.middleware],
                RouteBundle.finalHandler,
            );

            return;
        }

        res.writeHead(404, {
            "content-type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "not found",
            }),
        );
    }

    /**
     *
     * @param {string} tepmplate
     * @param  {...Middleware} middleware
     */
    get(tepmplate, ...middleware) {
        this.#addRoute(tepmplate, "GET", middleware);
    }

    /**
     *
     * @param {string} tepmplate
     * @param  {...Middleware} middleware
     */
    post(tepmplate, ...middleware) {
        this.#addRoute(tepmplate, "POST", middleware);
    }

    /**
     *
     * @param {string | null} rawQuery
     * @returns
     */
    #extractQuery(rawQuery) {
        /**
         * @type {string[]}
         */
        const params = [];

        if (rawQuery === undefined) {
            console.warn(`rawQuery is undefined`);
            return params;
        }

        if (rawQuery === null) {
            return params;
        }

        rawQuery.split("&").forEach((couple) => {
            const [key, value] = couple.split("=");
            const normalizedKey = value.toLowerCase();
            params[key] = normalizedKey;
        });

        return params;
    }

    /**
     *
     * @param {string} template
     * @param {string} method
     * @param {Middleware[]} middleware
     */
    #addRoute(template, method, middleware) {
        const methodRoutes = this.#routes.get(method);

        if (!methodRoutes) {
            console.warn(`\x1b[31mallowed methods: `, Array.from(this.#routes.keys()).join(",") + "\x1b[0m");

            throw new Error(`method is not allowed`);
        }

        if (methodRoutes.has(template)) {
            console.warn(`\x1b[31m` + `template ${template} already exist. Overriding...` + "\x1b[0m");
        }

        const routeBundle = this.#compileRouteBundle(template, middleware);

        methodRoutes.set(routeBundle.originalTemplate, routeBundle);
    }

    /**
     *
     * @param {string} template
     * @param {Middleware[]} middleware
     */
    #compileRouteBundle(template, middleware) {
        if (middleware.length < 1) {
            throw new Error(`middleware.length must be >= 1`);
        }

        // wild card

        // escapes

        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g, (_, key) => {
            keys.push(key);
            return "([^\/]+)";
        });

        return {
            keys,
            originalTemplate: template,
            regex: new RegExp(`^${regexTemplate}$`),
            middleware: middleware.length > 1 ? middleware.slice(0, -1) : [],
            finalHandler: middleware[middleware.length - 1],
        };
    }

    /**
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     * @param {Middleware[]} middleware
     * @param {Middleware} finalHandler
     */
    async #executeMiddleware(req, res, params, query, middleware, finalHandler) {
        if (middleware === undefined) {
            if (finalHandler === undefined) {
                throw new Error(`finalHandler required`);
            }

            await finalHandler({ params: params, query: query, req: req, res: res, next: next });
            return;
        }

        if (finalHandler === undefined) {
            throw new Error(`finalHandler required`);
        }

        let index = 0;

        const next = async () => {
            if (index < middleware.length) {
                const currentIndex = index++;
                const handler = middleware[currentIndex];
                if (handler) {
                    await handler({ params: params, query: query, req: req, res: res, next: next });
                }
            } else {
                if (finalHandler) {
                    await finalHandler({ params: params, query: query, req: req, res: res, next: next });
                }
            }
        };

        await next();
    }

    /**
     *
     * @param {string} rawURL
     */
    #splitURL(rawURL) {
        if (rawURL === undefined) {
            throw new Error(`rawURL required`);
        }

        const [url, query] = rawURL.split("?");

        return {
            url: url.endsWith("/") && url !== "/" ? url.slice(0, -1) : url || "/",
            query: query || null,
        };
    }

    /**
     * @type {Map<string,Map<string,HTTPRouteBundle>>}
     */
    #routes;

    /**
     * @type {Middleware[]}
     */
    #globalMiddleware;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.middlewareExecutor
     */
    constructor(deps = {}) {
        const allowedMethods = ["get", "post", "put", "delete"].map((item) => item.toUpperCase());

        this.#routes = new Map();

        allowedMethods.forEach((methodName) => {
            this.#routes.set(methodName, new Map());
        });

        this.#globalMiddleware = [];
    }
}

module.exports = { HTTPRouter };

class MiddlewareExecutor {
    /**
     * @param {any} params
     * @param {((params:any, next:() => Promise<any>) => Promise<any>)[]} middleware
     * @param {(params:any, next:() => Promise<any>) => Promise<any>} finalHandler
     */
    async execute(params, middleware, finalHandler) {
        if (middleware === undefined || finalHandler === undefined) {
            console.warn(`all off middleware and finalHandler are required`);
            return;
        }

        let index = 0;

        const next = async () => {
            if (index < middleware.length) {
                const currentIndex = index++;

                const handler = middleware[currentIndex];

                if (handler) {
                    await handler({ params }, next);
                }
            }
        };

        await next();
    }

    constructor() {}
}
