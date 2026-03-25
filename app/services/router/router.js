const { IncomingMessage, ServerResponse } = require("node:http");

const LOCAL_CONSTANTS = {
    METHODS:{
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
    async handleRequest (req, res) {

        const { method, url:fullURL } = req;

        try {

            const methodRoutes = this.#routes.get(method);

            if(methodRoutes === undefined) {

                res.writeHead(400, {
                    "content-type":'application/json',
                });
                res.end(JSON.stringify({
                    message:'incorrect method ' + method,
                }));
                return;
            }

            const { url, queryString } = this.#splitURL(fullURL);

            console.log({url});

            for (const [_, routeBundle] of methodRoutes.entries()) {

                const urlMatch = routeBundle.regex.exec(url);

                console.log('hello world',  {urlMatch});

                if(!urlMatch) continue;

                const params = {};
                routeBundle.keys.forEach((key,i) => {
                    params[key] = urlMatch[i + 1];
                });

                req.params = params;

                routeBundle.handler(req, res);

                // await this.#executeMiddleware(req, res, this.#middleware, routeBundle.handler);

                return;

            }

        }
        catch (error) {

            res.writeHead(500, {
                "content-type":"application/json",
            });
            res.end(JSON.stringify({
                message:'internal server error',
                error:error,
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
     * @param  {...((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)} handlers 
     */
    get(template, ...handlers) {
        const normalMethod = LOCAL_CONSTANTS.METHODS.GET;
        this.#addRoute(template, normalMethod, handlers);
    }
    
    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)} handlers 
     */
    post(template, ...handlers) {
        const normalMethod = LOCAL_CONSTANTS.METHODS.POST;
        this.#addRoute(template, normalMethod, handlers);
    }

    /**
     * 
     * @param  {...((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)} middleware 
     */
    useMiddleware(...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {string} fullURL 
     */
    #splitURL (fullURL) {
        const [url, queryString] = fullURL.split('?');

        return {
            url:url.match(/.+\/$/) ? url.replace(/\/$/) : url,
            queryString,
        }
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)[]} middleware 
     * @param {any} payload 
     * @param {((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)} finalHandler 
     */
    async #executeMiddleware (req, res, middleware, payload, finalHandler) {
        
        if(res.headersSent) return {chainBroken:true};
        
        let index = 0;

        const next = async (nextPayload) => {

            if(index < middleware.length) {
                const currentIndex = index++;
                const handler = middleware[currentIndex];
                if(handler) {
                    try {
                        await handler(req, res, next, nextPayload);
                    }
                    catch (err) {
                        throw err;
                    }
                }
                else {
                    return {chainBroken:true};
                }
            }
            else {
                if(finalHandler) {
                    await finalHandler(req, res);
                }
                else {
                    return {chainBroken:true};
                }
            }
        }

        if(middleware.length > 0) {
            await next(payload);
        }
        else if (finalHandler) {
            await finalHandler(req, res);
        }

        return {chainBroken:false};
    }

    #addRoute (template, method, handlers) {

        const methodRoutes = this.#routes.get(method);
        if(methodRoutes === undefined) {
            throw new Error(`http rouer: inccorect HTTP method name ${method}`);
        }

        const routeBundle = this.#assembleRouteBundle(template, handlers);

        methodRoutes.set(routeBundle.originalTemplate, routeBundle);

        console.log(`added new route: ${method} ${routeBundle.originalTemplate}` , {routeBundle});

    }

    /**
     * 
     * @param {string} template 
     * @param {((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)[]} handlers 
     * @returns {{
     *  keys:string;
     *  regex:RegExp;
     *  handler:(req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>
     *  middleware:((req:IncomingMessage, res:ServerResponse, next?:(payload?:any) => Promise<any>) => Promise<any>)[]
     *  originalTemplate:string;
     * }}
     */
    #assembleRouteBundle (template , handlers) {

        if(handlers.length < 1) {
            throw new Error (`http router: handlers.length must be > "0"`);
        }

        const keys = [];
        // wildcard
        let regexTemplate = template.replace(/\*/g , '.*'); 
        regexTemplate = template.replace(/:([^\/]+)/g, (_, key) => {
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

    #routes;
    #middleware;

    constructor () {
        this.#middleware = [];
        this.#routes = new Map();

        for (const [k, normalMethodKey] of Object.entries(LOCAL_CONSTANTS.METHODS)) {
            this.#routes.set(normalMethodKey, new Map());
            console.log(`\x1b[33madded HTTP method ${normalMethodKey}\x1b[0m`);
        }
    }
}

module.exports = Router;