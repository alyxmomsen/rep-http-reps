const { IncomingMessage, ServerResponse } = require('http');
const {
    MiddlewareExecutor,
} = require('../../../utils/middleware-executor/model/mw-executor.model');

/**
 * @typedef {(ctx:{req:IncomingMessage;res:ServerResponse}) => Promise<any>} RouteFinalHandler
 * @typedef {(ctx:{req:IncomingMessage;res:ServerResponse;next?:() => Promise<any>}) => Promise<any>} RouteMiddleware
 *
 * @typedef {Object} RouteBundle
 * @property {string[]} RouteBundle.keys
 * @property {RouteFinalHandler} RouteBundle.finalHandler
 * @property {RouteMiddleware[]} RouteBundle.middleware
 * @property {RegExp} RouteBundle.regex
 * @property {string} RouteBundle.originalTemplate
 *
 * @typedef {Object} RouteBundle
 * @property {string[]} keys
 * @property {RegExp} regex
 * @property {RouteMiddleware[]} middleware
 * @property {RouteMiddleware} finalHandler
 * @property {string} originalTemplate
 *
 * @typedef {Object} RouteHandlerContext
 * @property {IncomingMessage} req
 * @property {ServerResponse} res
 *
 * @typedef {() => Promise<any>} MiddlewareNext
 *
 */

/**
 *
 */
class Router {
    /**
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    async handleRequest(req, res) {
        const { method, url: rawURL } = req;

        const methodRoutes = this.#routes.get(method);

        if (!methodRoutes) {
            const allowed = Array.from(this.#routes.keys()).join(', ');
            res.writeHead(405, {
                'content-type': 'application/json',
                Allow: allowed,
            });
            res.end(
                JSON.stringify({
                    message: 'Method Not Allowed',
                    allow: allowed,
                })
            );
            return;
        }

        const { url, queryString } = this.#splitURL(rawURL);
        const query = this.#extractQueryParams(queryString);

        for (const RouteBundle of methodRoutes.values()) {
            const urlMatch = RouteBundle.regex.exec(url);

            if (!urlMatch) continue;

            // Извлекаем params
            const params = {};
            RouteBundle.keys.forEach((key, i) => {
                params[key] = decodeURIComponent(urlMatch[i + 1]);
            });

            const Ctx = { req, res, params, queryParams: query };

            await this.#middlewareExecutor.exec(
                Ctx,
                [...this.#globalMiddleware, ...RouteBundle.middleware],
                RouteBundle.finalHandler
            );

            return;
        }

        res.writeHead(404, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }

    addGlobalMiddleware(...handlers) {
        this.#globalMiddleware.push(...handlers);
    }

    /**
     *
     * @param {string} template
     * @param  {...RouteMiddleware} handlers
     */
    get(template, ...handlers) {
        this.#addRoute(template, 'GET', handlers);
    }

    /**
     *
     * @param {string} template
     * @param  {...RouteMiddleware} handlers
     */
    post(template, ...handlers) {
        this.#addRoute(template, 'POST', handlers);
    }

    /**
     *
     * @param {string} template
     * @param  {...RouteMiddleware} handlers
     */
    put(template, ...handlers) {
        this.#addRoute(template, 'PUT', handlers);
    }

    /**
     *
     * @param {string} template
     * @param  {...RouteMiddleware} handlers
     */
    delete(template, ...handlers) {
        this.#addRoute(template, 'DELETE', handlers);
    }

    #extractQueryParams(queryString) {
        const params = {};
        if (!queryString) return params;

        queryString.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');
            if (key && value !== undefined) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        });

        return params;
    }

    /**
     *
     * @param {string} rawURL
     */
    #splitURL(rawURL) {
        const [url, queryString] = rawURL.split('?');

        return {
            url: url.endsWith('/')
                ? url !== '/'
                    ? url.replace(/\/$/, '')
                    : url
                : url,
            queryString: queryString || null,
        };
    }

    /**
     *
     * @param {string} template
     * @param {string} method
     * @param {RouteMiddleware[]} handlers
     */
    #addRoute(template, method, handlers) {
        const Args = {
            template,
            method,
            handlers,
        };

        const methodRoutes = this.#routes.get(method);

        if (!methodRoutes) {
            throw new Error(`Router::addRoute: method is not accepted`);
        }

        if (methodRoutes.has(template)) {
            console.log(
                `\x1b[33mRouter::addRoute: this route key < ${template} > already exist. Overwrite.\x1b[0m`
            );
        }

        const RouteBundle = this.#compileRouteBundle(
            Args.template,
            Args.handlers
        );

        methodRoutes.set(RouteBundle.originalTemplate, RouteBundle);

        console.log(
            `\x1b[32m✅ just added new route ${Args.method} ${RouteBundle.originalTemplate}\x1b[0m`
        );
    }

    /**
     *
     * @param {string} template
     * @param {RouteMiddleware[]} handlers
     *
     */
    #compileRouteBundle(template, handlers) {
        const bundle = this.#behaviors.compileRouteBundle(template, handlers);
        return bundle;
    }

    /**
     * @type {Map<string,Map<string,RouteBundle>>}
     */
    #routes;

    /**
     * @type {MiddlewareExecutor}
     */
    #middlewareExecutor;

    /**
     * @type {RouteMiddleware[]}
     */
    #globalMiddleware;

    /**
     * @type {{
     *  compileRouteBundle:(template:string,handlers:RouteMiddleware[])=> RouteBundle}}
     */
    #behaviors;

    /**
     *
     * @param {Object} deps
     * @param {MiddlewareExecutor} deps.middlewareExecutor
     * @param {Object} behaviors
     * @param {(template:string,handlers:RouteMiddleware[])=> RouteBundle} behaviors.compileRouteBundleBehavior
     */
    constructor(deps = {}, behaviors = {}) {
        if (!deps.middlewareExecutor) {
            throw new Error(
                `\x1b[31m - ❌ Router::constructor: deps.middlewareExecutor required\x1b[0m`
            );
        }

        this.#middlewareExecutor = deps.middlewareExecutor;

        this.#globalMiddleware = [];

        if (!behaviors.compileRouteBundleBehavior) {
            console.warn(
                `\x1b[33m- ⚠️  Router::constructor: deps.compileRouteBundleBehavior isn\`t provided\x1b[0m`
            );
        }

        this.#behaviors = {
            compileRouteBundle: behaviors.compileRouteBundleBehavior,
        };

        const acceptedRoutes = {
            GET: 'GET',
            POST: 'POST',
            PUT: 'PUT',
            DELETE: 'DELETE',
        };

        this.#routes = new Map();

        for (const [_, method] of Object.entries(acceptedRoutes)) {
            this.#routes.set(method, new Map());
        }
    }
}

module.exports = { Router };
