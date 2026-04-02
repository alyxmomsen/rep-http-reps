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


class HTTPRouter {

    /**
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest (req, res) {

        const { method, headers, url:rawURL } = req;

        const methodRoutes = this.#routes.get(method);

        try {

            if(!methodRoutes) {
                res.writeHead(500, {
                    "content-type":"application/json",
                });
                res.end(JSON.stringify({message:'internal server error'}));
                throw new Error(`Router: incorrect method`);
            }

            const { url, queryString } = this.#splitURL(rawURL);

            for (const [_, routeBundle] of methodRoutes.entries()) {

                const urlMatch = routeBundle.regex.exec(url)

                if(!urlMatch) continue;

                // bundle params

                const params = {};
                routeBundle.keys.forEach((key, i) => {
                    params[key] = urlMatch[i + 1];
                });
                
                let queryParams = {};
                try {

                    queryParams = this.#extractQueryParams(queryString);
                }
                catch (err) {
                    
                    this.#errors.push(err.message);
                    throw err;
                }
                
                req.queryParams = queryParams ;
                req.params = params;

                // -------------

                await this.#executeMiddleware(req, res, [...this.#middleware, ...routeBundle.middleware]);
                
                await routeBundle.handler(req, res);
                // return;
                break; // 👈🏽⚠️
            }

            // ⚠️👇🏽 сразу отправляет 404 😱
            if(!res.headersSent) {
                console.log(`router.handlerequest/send_404`);
                res.writeHead(404, {
                    "content-type":"application/json",
                });
                res.end(JSON.stringify({message:'not found'}));
            }
        }
        catch (err) {
            
            console.log(`\x1b[31m`,{err}, `\x1b[0m`);
            
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
     * @param {IncomingMessage} req
     * @param {ServerResponse} res  
     * @param {HTTPRouterMiddleware[]} middleware 
     * @returns {Promise<any>}
     * @throws {Error} - Router.executeMiddleware: no handler received
     * @throws {Error} - Router.executeMiddleware: middleware.lenght must be > 0
     */
    async #executeMiddleware (req, res, middleware) {
        let index = 0;
        /**
         * @type {MiddlewareNext}
         */
        const next = async () => {

            if(index < middleware.length) {
                const currentIndex = index++;

                const handler = middleware[currentIndex];

                if(handler) {
                    try {
                        await handler(req, res, next);
                        return;
                    }
                    catch (err) {
                        /**
                         * pass throw this error toward the error handler
                         */
                        throw err;
                    }
                }

                throw new Error(`Router.executeMiddleware: no handler received`);
            }

            return; 

        }

        if(middleware.length > 0) {
            return await next();
        }

        return
        throw new Error(`router.executemiddleware: middleware.lenght must be > 0`);
    }

    /**
     * 
     * @param {string|null} queryString 
     * @throws {Error} - Router/#extractQueryParams: incorrect the arg value type
     * 
     */
    #extractQueryParams (queryString) {
        const params = {};

        if((typeof queryString === "string" || queryString === null) === false) {
            throw new Error(`Router/#extractQueryParams: incorrect the arg value type`);
        }

        if(queryString === null) {
            return params ;
        }

        queryString.split('&').forEach(part => {
            const [key, value] = part.split('=');
            if(key && value) {

                const normalizedKey = key.toLowerCase();
                params[normalizedKey] = value;
            }
        });

        return params;

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
            queryString: queryString || null,
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

    #handleErrors () {
        this.#errors.forEach(err => {
            console.log('Router.handleErrors: ', {err});
        });
    }

    /**
     * @type {Map<string,Map<string,RouteBundle>>}
     */
    #routes;

    /**
     * @type {HTTPRouterMiddleware[]}
     */
    #middleware;

    /**
     * @type {Array}
     */
    #errors;

    constructor (deps= {}) {

        this.#routes = new Map();

        for (const [_, METHOD] of Object.entries(LocalConstants.MethodsKeys)) {
            this.#routes.set(METHOD, new Map());
        }

        this.#middleware = [];
        this.#errors = [];
    }
}

module.exports = { HTTPRouter }