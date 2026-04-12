const http = require('http');

/**
 * Контекст запроса, доступный в middleware и handler
 * @typedef {Object} Context
 * @property {http.IncomingMessage} req - Объект запроса Node.js
 * @property {http.ServerResponse} res - Объект ответа Node.js
 * @property {Object.<string, string>} params - Параметры маршрута (из :param)
 * @property {Object.<string, string>} query - Query параметры (из ?key=value)
 */

/**
 * Middleware функция
 * @typedef {Function} Middleware
 * @param {Context} ctx - Контекст запроса
 * @param {Function} next - Функция для вызова следующего middleware
 * @returns {Promise<any>}
 */

/**
 * Финальный обработчик маршрута
 * @typedef {Function} Handler
 * @param {Context} ctx - Контекст запроса
 * @returns {Promise<any>}
 */

/**
 * Собранный маршрут
 * @typedef {Object} RouteBundle
 * @property {string[]} keys - Имена параметров маршрута
 * @property {RegExp} regex - Регулярное выражение для проверки URL
 * @property {Handler} handler - Финальный обработчик
 * @property {Middleware[]} middleware - Массив middleware для этого маршрута
 * @property {string} originalTemplate - Оригинальный шаблон маршрута
 */

/**
 * Внутренний контекст для выполнения middleware
 * @typedef {Object} ExecutionContext
 * @property {http.IncomingMessage} req
 * @property {http.ServerResponse} res
 * @property {Object.<string, string>} params
 * @property {Object.<string, string>} queryParams
 * @property {Middleware[]} middleware
 * @property {Handler} finalHandler
 */

class HTTPRouter {
    /**
     * @type {Map<string, Map<string, RouteBundle>>}
     */
    #routes;

    /**
     * @type {Middleware[]}
     */
    #globalMiddleware;

    constructor() {
        this.#routes = new Map();
        this.#globalMiddleware = [];

        const HTTPMethods = {
            GET: "GET",
            POST: "POST",
            PUT: "PUT",
            DELETE: "DELETE",
        };

        for (const method of Object.values(HTTPMethods)) {
            this.#routes.set(method, new Map());
        }
    }

    /**
     * Обработка входящего запроса
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    async handleRequest(req, res) {
        const method = req.method;
        const rawURL = req.url;
        const methodRoutes = this.#routes.get(method);

        if (!methodRoutes || methodRoutes.size === 0) {
            const allowedMethods = Array.from(this.#routes.entries())
                .filter(([_, routes]) => routes.size > 0)
                .map(([method]) => method);

            res.writeHead(405, {
                'Content-Type': 'application/json',
                'Allow': allowedMethods.join(', ')
            });

            res.end(JSON.stringify({
                message: 'Method Not Allowed',
                allow: allowedMethods
            }));
            return;
        }

        const { url, queryString } = this.#splitURL(rawURL);

        for (const bundle of methodRoutes.values()) {
            const urlMatch = bundle.regex.exec(url);
            if (!urlMatch) continue;

            const params = {};
            bundle.keys.forEach((key, i) => {
                params[key] = decodeURIComponent(urlMatch[i + 1]);
            });

            const query = this.#extractQueryParams(queryString);

            // Добавляем params и query в req для обратной совместимости
            req.params = params;
            req.query = query;

            /** @type {ExecutionContext} */
            const ctx = {
                req,
                res,
                params,
                queryParams: query,
                middleware: [...this.#globalMiddleware, ...bundle.middleware],
                finalHandler: bundle.handler,
            };

            try {
                await this.#executeMiddleware(ctx);
            } catch (error) {
                console.error('Router error:', error);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        message: 'Internal Server Error',
                        error: process.env.NODE_ENV === 'development' ? error.message : undefined
                    }));
                }
            }
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }

    /**
     * @param {string | null} queryString
     * @returns {Object.<string, string>}
     */
    #extractQueryParams(queryString) {
        const params = {};
        if (!queryString) return params;

        queryString.split('&').forEach((couple) => {
            const [k, v] = couple.split('=');
            if (k && v) {
                params[decodeURIComponent(k)] = decodeURIComponent(v);
            }
        });

        return params;
    }

    /**
     * @param {ExecutionContext} ctx
     */
    async #executeMiddleware(ctx) {
        let index = 0;

        const next = async () => {
            if (index < ctx.middleware.length) {
                const handler = ctx.middleware[index++];
                await handler(ctx, next);
            } else if (ctx.finalHandler) {
                await ctx.finalHandler(ctx);
            }
        };

        await next();
    }

    /**
     * @param {string} rawURL
     * @returns {{ url: string, queryString: string | null }}
     */
    #splitURL(rawURL) {
        const [url, queryString] = rawURL.split('?');
        const cleanUrl = url && url.endsWith('/') && url !== '/' 
            ? url.slice(0, -1) 
            : (url || '/');
        
        return {
            url: cleanUrl,
            queryString: queryString || null,
        };
    }

    /**
     * @param {string} template
     * @param {...Middleware} middleware
     */
    get(template, ...middleware) {
        this.#addRoute(template, 'GET', middleware);
    }

    /**
     * @param {string} template
     * @param {...Middleware} middleware
     */
    post(template, ...middleware) {
        this.#addRoute(template, 'POST', middleware);
    }

    /**
     * @param {string} template
     * @param {string} method
     * @param {Middleware[]} middleware
     */
    #addRoute(template, method, middleware) {
        const methodRoutes = this.#routes.get(method);
        
        if (!methodRoutes) {
            throw new Error(`HTTPRouter::addRoute: incorrect method ${method}`);
        }

        if (methodRoutes.has(template)) {
            console.warn(`Route ${method} ${template} already exists, overwriting...`);
        }

        const routeBundle = this.#compileRouteBundle(template, middleware);
        methodRoutes.set(routeBundle.originalTemplate, routeBundle);
        console.log(`Added route ${method} ${routeBundle.originalTemplate}`);
    }

    /**
     * @param {...Middleware} middleware
     */
    addGlobalMiddleware(...middleware) {
        this.#globalMiddleware.push(...middleware);
    }

    /**
     * @param {string} template
     * @param {Middleware[]} middleware
     * @returns {RouteBundle}
     */
    #compileRouteBundle(template, middleware) {
        if (middleware.length < 1) {
            throw new Error('Route must have at least one handler');
        }

        const keys = [];
        
        // Экранируем спецсимволы regex
        let regexTemplate = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Заменяем wildcard (\* после экранирования)
        regexTemplate = regexTemplate.replace(/\\\*/g, '.*');
        
        // Заменяем параметры :param
        regexTemplate = regexTemplate.replace(/:([^\/]+)/g, (_, key) => {
            keys.push(key);
            return '([^\\/]+)';
        });

        return {
            keys,
            regex: new RegExp(`^${regexTemplate}$`),
            handler: middleware[middleware.length - 1],
            middleware: middleware.slice(0, -1),
            originalTemplate: template,
        };
    }
}

module.exports = { HTTPRouter };