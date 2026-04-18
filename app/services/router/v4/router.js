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

class Router {
    /**
     * Обработка входящего запроса
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    async handleRoute(req, res) {
        const { method, url: rawURL } = req;

        const methodRoutes = this.#routes.get(method);

        if (!methodRoutes) {
            const allowedMethods = Array.from(this.#routes.entries())
                .filter(([_, routes]) => routes.size > 0)
                .map(([method]) => method);

            res.writeHead(405, {
                'content-type': 'application/json',
                Allow: allowedMethods.join(', '),
            });

            res.end(
                JSON.stringify({
                    message: 'method not allowed',
                    allow: allowedMethods,
                })
            );

            return;
        }

        const { queryString, url } = this.#Utils.splitURL(rawURL);

        for (const routeBundle of methodRoutes.values()) {
            const urlMatch = routeBundle.regex.exec(url);

            if (!urlMatch) continue;

            const params = {};
            routeBundle.keys.forEach((key, i) => {});
        }
    }

    /**
     *
     * @param {string} template
     * @param  {...Function} handlers
     */
    get(template, ...handlers) {
        this.#addRoute(template, 'GET', handlers);
    }

    /**
     *
     * @param {string} template
     * @param  {...Function} handlers
     */
    post(template, ...handlers) {
        this.#addRoute(template, 'POST', handlers);
    }

    #addRoute(template, method, handlers) {
        const Args = {
            template,
            method,
            handlers,
        };

        const methodRoutes = this.#routes.get(Args.template);

        if (!methodRoutes) {
            throw new Error(`HTTPRouter::addRoute: incorrect method ${method}`);
        }

        if (methodRoutes.has(template)) {
            console.warn(
                `Route ${method} ${template} already exists, overwriting...`
            );
        }

        const RouteBundle = this.#compileRouteBundle(template, handlers);

        methodRoutes.set(RouteBundle.originalTemplate, RouteBundle);

        console.log(`Added route ${method} ${routeBundle.originalTemplate}`);
    }

    /**
     *
     * @param {string} template
     * @param {Function[]} handlers
     * @returns
     */
    #compileRouteBundle(template, handlers) {
        if (handlers.length < 1) {
            throw new Error(`handlers.length must be >= 1`);
        }

        const Args = {
            Template: template,
            Handlers: handlers,
        };

        const LocalBuffer = {
            RegexTemplate: '',
            Keys: [],
        };

        // Экранируем спецсимволы regex
        LocalBuffer.RegexTemplate = Args.Template.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );
        // Заменяем wildcard (\* после экранирования)
        LocalBuffer.RegexTemplate = LocalBuffer.RegexTemplate.replace(
            /\\\*/g,
            '.*'
        );
        // Заменяем параметры :param
        LocalBuffer.RegexTemplate = LocalBuffer.RegexTemplate.replace(
            /:([^\/]+)/,
            (_, key) => {
                LocalBuffer.Keys.push(key);
            }
        );

        const RouteBundle = {
            keys: LocalBuffer.Keys,
            regex: LocalBuffer.RegexTemplate,
            finalHandler: Args.Handlers[Args.Handlers.length - 1],
            middleware:
                Args.Handlers.length > 1 ? Args.Handlers.slice(0, -1) : [],
            originalTemplate: Args.Template,
        };

        return RouteBundle;
    }

    addGlobalMiddleware(...handlers) {
        this.#globalMiddleware.push(...handlers);
    }

    /**
     *
     * @param {string} rawURL
     */
    #splitURL(rawURL) {
        const Args = {
            rawURL,
        };

        const [url, queryString] = Args.rawURL.split('?');

        const cleanURL =
            url && url.endsWith('/') && url !== '/'
                ? url.slice(0, -1)
                : url || '/';

        return {
            url: cleanURL,
            queryString: queryString || null,
        };
    }

    /**
     * @type {Map<string,Map<string,Object>>}
     */
    #routes;
    #globalMiddleware;

    // utils
    #Utils;

    /**
     *
     * @param {Object} config
     * @param {Object.<string,string>} config.allowedMethods
     */
    constructor(config = {}) {
        // if (!config.allowedMethods) {
        //     throw new Error(`config.allowedMethods required`);
        // }

        this.#routes = new Map();
        this.#globalMiddleware = [];

        const AllowedMethods = {
            GET: 'GET',
            POST: 'POST',
            PUT: 'PUT',
            DELETE: 'DELETE',
        };

        for (const [k, methodName] of Object.entries(AllowedMethods)) {
            this.#routes.set(methodName, new Map());
        }

        this.#Utils = {
            splitURL: this.#splitURL,
        };
    }
}

const router = new Router();
