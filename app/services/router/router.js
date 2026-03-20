const { IncomingMessage, ServerResponse } = require("node:http");

const LOCAL_CONSTANTS = {
    HTTP_METHODS: {
        GET:'GET',
        POST:'POST',
        PUT:'PUT',
        DELETE:'DELETE',
    }
}

class Router {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest(req, res) {

        try {
            const { method, url:rawURL } = req;
            
            const methodRoutes = this.#routes.get(method);
    
            if (methodRoutes === undefined) {
                console.log(`HTTP method < ${method} > is not supported`);
                res.writeHead(400, {
                    "content-type":'application/json',
                });
                res.end(JSON.stringify({
                    message:`HTTP method < ${method} > is not supported`
                }));
                return;
            }
    
            const { url, queryString } = this.#splitURL(rawURL);
    
            
            for (const [_, routeBundle] of methodRoutes.entries()) {
                const urlMatch = routeBundle.regex.exec(url);
                if (!urlMatch) continue;
                
                // ======== assemble params ========
    
                const params = {};
                routeBundle.keys.forEach((key, i) => {
                    params[key] = urlMatch[i + 1];
                });
    
                const queryParams = this.#extractQueryParams(queryString);
    
                req.params = params;
                req.queryParams = queryParams;
    
                // =================================
    
                // собираем все middleware в одну структуру
                const wholeMiddleware = [...this.#middleware, ...routeBundle.middleware];
    
                await this.#executeMiddleware(req, res, wholeMiddleware, routeBundle.handler);

                return;
            }
        }
        catch (err) {
            console.log(`internal error: `, err);
            res.writeHead(500, {
                "content-type":'application/json',
            });
            res.end(JSON.stringify({
                message: 'enternal error',
                error:err,
            }));
        }

        if (!res.headersSent) {
            
            res.writeHead(404, {
                "content-type":'application/json',
            });
            res.end(JSON.stringify({
                message:'not found',
            }));
        }
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage, res:ServerResponse, next?:(payload:any) => Promise<any>) => Promise<any>)} handlers 
     */
    get(template, ...handlers) {
        const METHODS = LOCAL_CONSTANTS.HTTP_METHODS;
        this.#addRoute(template, METHODS.GET, handlers);
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage, res:ServerResponse, next?:(payload:any) => Promise<any>) => Promise<any>)} handlers 
     */
    post(template, ...handlers) {
        const METHODS = LOCAL_CONSTANTS.HTTP_METHODS;
        this.#addRoute(template, METHODS.POST, handlers);
    }

    /**
     * 
     * @param  {...((req:IncomingMessage, res:ServerResponse, next?:(payload) => Promise<any>) => Promise<any>)} middleware 
     */
    useMiddleware(...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    async #executeMiddleware(req, res, middleware, finalHandler, payload) {

        let index = 0;

        /**
         * 
         * @param {any} payload 
         */
        const next = async (nextPayload) => {

            if (res.headersSent) return;

            if (index < middleware.length) {
                const currentIndex = index++;
                const handler = middleware[currentIndex];
                if (handler) {
                    try {
                        await handler(req, res, next, nextPayload);
                    }
                    catch (error) {
                        // pass through this error
                        throw error;
                    }
                }
            }
            else {
                if (finalHandler) {
                    await finalHandler(req, res);
                }
            }
        }

        if (middleware.length > 0) {
            await next(payload);
        }
        else if (finalHandler) {
            await finalHandler(req, res);
        }

        return {chainBroken:false}
    }

    #addRoute(template, method, handlers) {
        const methodRoutes = this.#routes.get(method);
        if (methodRoutes === undefined) {
            throw new Error(`unregistred method name`);
        }

        const routeBundle = this.#assembleRouteBundle(template, handlers);

        methodRoutes.set(routeBundle.originalTemplate, routeBundle);

        console.log(`just added new route ${method} ${routeBundle.originalTemplate}`);
    }

    /**
     * 
     * @param {string} template 
     * @param {((req:IncomingMessage, res:ServerResponse) => Promise<any>)[]} handlers 
     * @returns {{
     *  keys:string[];
     *  regex:RegExp;
     *  handler:(req:IncomingMessage, res:ServerResponse) => Promise<any>;
     *  middleware:((req:IncomingMessage, res:ServerResponse) => Promise<any>)[];
     *  originalTemplate:string;
     * }}
     */
    #assembleRouteBundle(template, handlers) {

        if (handlers.length < 1) {
            throw new Error(`handlers.length must be not "0"`);
        }

        let regexTemplate = template.replace(/\*/g, '.*');
        const keys = [];
        regexTemplate = regexTemplate.replace(/:([^\/]+)/g, (_, key) => {
            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys,
            regex:new RegExp(`^${regexTemplate}$`),
            handler:handlers[handlers.length - 1],
            middleware:handlers.length > 1 ? handlers.slice(0, -1) : [],
            originalTemplate:template,
        }
    }

    /**
     * 
     * @param {string} rawURL 
     */
    #splitURL(rawURL) {
        
        // в большинстве случаев queryString отделен от url
        // символом '?'
        const [url, queryString] = rawURL.split('?');

        return {
            // если URL не содержит финальный слеш,
            // то свойству this.url будет присвоен url как есть
            // в противном случае (финальный слеш существует)
            // из переменной url будет извлечен финальный слеш
            // а результат присовен свойству this.url
            url:(url.match(/^.+\/$/) && url.replace(/\/$/, '')) || url,
            queryString,
        }
    }

    /**
     * 
     * @param {string|undefined} queryString 
     * @returns {Object.<string,string>}
     */
    #extractQueryParams(queryString) {
        
        const params = {};

        if (queryString === undefined) return params;

        queryString.split('&').forEach(couple => {
            const [k, v] = couple.split('=');
            if (k && v) {
                const normalizedKey = k.toLowerCase();
                params[normalizedKey] = v;
            }
        });

        return params;
    }

    /**
     * @type {Map<string,Map<string,{
     *  keys:string[];
     *  regex:RegExp;
     *  handler:(req:IncomingMessage, res:ServerResponse) => Promise<any>;
     *  middleware:((req:IncomingMessage, res:ServerResponse) => Promise<any>)[];
     *  originalTemplate:string;
     * }>}
     */
    #routes;
    /**
     * @type {(req:IncomingMessage, res:ServerResponse, next?:(payload) => Promise<any>}
     */
    #middleware;

    // === dependencies ===

    // ====================

    constructor() {
        const METHODS = LOCAL_CONSTANTS.HTTP_METHODS;
        
        this.#routes = new Map();
        for (const [k, method] of Object.entries(METHODS)) {
            this.#routes.set(method, new Map());
        }

        this.#middleware = [];
    }
}

module.exports = Router;