const { ServerResponse, IncomingMessage } = require('http');

const LocalConstants = {
    MethodsKeys:{
        GET:'GET',
        PUT:'PUT',
        DELETE:'DELETE',
        POST:'POST',
    }
}

/**
 * @typedef {Object} RouteBundle
 * @property {RegExp} regex
 * @property {string} originalTemplate
 * @property {string[]} keys
 * @property {Function} middleware
 * @property {Function} handler
 * 
 * @typedef {(nextPayload:any) => Promise<any>} MiddlewareNext
 * 
 * @typedef {(req:IncomingMessage, res:ServerResponse, next?:MiddlewareNext) => Promise<any>} HTTPRouterMiddleware
 */


class Router_Dev {

    /**
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest (req, res) {

        const { method, headers, url:rawURL } = req;

        const methodRoutes = this.#routes.get(method);

        if(!methodRoutes) {
            throw new Error(`Router: incorrect method`);
        }

        const { url, queryString } = this.#splitURL(rawURL);

        for (const [_, routeBundle] of methodRoutes.entries()) {

            const urlMatch = routeBundle.regex.exec(url)
            console.log(`Router/handle request/iteration: `, {routeBundle, url, queryString});
            if(!urlMatch) continue;

            await routeBundle.handler(req, res);

            return;
        }

        if(!res.headersSent) {
            res.writeHead(404, {
                "content-type":"application/json",
            });
            res.end(JSON.stringify({message:'not found'}));
        }

    }

    /**
     * 
     * @param {string} template 
     * @param {HTTPRouterMiddleware} middleware 
     */
    get (template, ...middleware) {
        const Method = LocalConstants.MethodsKeys;
        this.#addRoute(template, Method.GET , middleware);
    }
    
    post (template, ...middleware) {
        const Method = LocalConstants.MethodsKeys;
        this.#addRoute(template, Method.POST , middleware);
    }

    /**
     * 
     * @param {string} rawURL 
     * @returns {{url:string; queryString:string|null}}
     */
    #splitURL (rawURL) {
        const [url, queryString] = rawURL.split('?');
        return {
            url:/.+\/+$/.test(url) ? url.replace(/\/+$/, '') : url,
            queryString,
        }
    }

    /**
     * 
     * @param {string} template 
     * @param {string} method 
     * @param  {HTTPRouterMiddleware[]} middleware 
     */
    #addRoute (template, method, middleware) {

        if(Object.keys(LocalConstants.MethodsKeys).includes(method) === false) {
            throw new Error(`Router: internal error`);
        }

        console.log(`Router: incoming method: `, method);

        const methodRoutes = this.#routes.get(method);

        if(!methodRoutes) throw new Error(`Router: method is forbidden`);

        const routeBundle = this.#makeRouteBundle(template, middleware);

        methodRoutes.set(routeBundle.originalTemplate, routeBundle);

        console.log(`successfully registrated new route: ${method} ${template}`);

    }

    /**
     * 
     * @param {string} template 
     * @param {HTTPRouterMiddleware[]} middleware 
     * @returns {RouteBundle}
     */
    #makeRouteBundle (template, middleware) {

        if(middleware.length < 1) {
            throw new Error(`middleware.length must be > 0`);
        }

        const keys = [];

        /**
         * @description wildcard
         * 
         * @type {string}
         */
        let regexTemplate = template.replace(/\*/g, '.*');

        /**
         * @type {string}
         */
        regexTemplate = regexTemplate.replace(/:([^\/]+)/g, (_, key) => {
            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys,
            regex:new RegExp(`^${regexTemplate}$`),
            handler:middleware[middleware.length - 1],
            middleware:middleware.length > 1 ? middleware.slice(0, -1) : [] ,
            originalTemplate:template,
        }
    }

    /**
     * @type {Map<string,Map<string,RouteBundle>>}
     */
    #routes;

    /**
     * @type {HTTPRouterMiddleware[]}
     */
    #middleware;

    constructor (deps= {}) {

        this.#routes = new Map();

        for (const [_, METHOD] of Object.entries(LocalConstants.MethodsKeys)) {
            this.#routes.set(METHOD, new Map());
        }
    }
}

module.exports = { Router_Dev }