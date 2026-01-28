require('fs');

class Router {

    async handleRequest(req , res) {
        const { method:_method, url:fulUrl, headers } = req;
        const method = _method.toUpperCase();
        const methodRoutes = this.#routes.get(method);

        if (methodRoutes === undefined) {
            res.writeHead(403);
            res.end();
            console.log('x1b[32mno acceptedx1b[0m');
            return 
        }

        const { url, rawQueryStringLike } = await this.#splitURL(fulUrl);
        
        for (const [_ , routeBundle ] of methodRoutes) {
            
            const match = routeBundle.regex.exec(url);
            if (match === null) continue;
            
            // ------------------------------------------
            const params = {};
            routeBundle.keys.forEach((key , i) => {

                params[key] = match[i + 1];
            });

            const queryParams = await this.#parseQueryParams(rawQueryStringLike);

            req.params = params;
            req.queryParams = queryParams;

            // ------------------------------------------

            await this.#executeMiddleware(req , res ,[...this.#middleware , ...routeBundle.middleware]);

            await routeBundle.handler(req , res);

            return;
        }

        res.writeHead(404);
        res.end();
    }


    async get(template  , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    async post(template , ...handlers) {
        this.#addRoute(template  ,"POST" , handlers);
    }

    async use(...middleware) {

        middleware.forEach(mw => {

            this.#middleware.push(mw);
        });
    }

    async #executeMiddleware(req , res , middleware) {
        let index = 0;
        const next = async () => {
            const handlerLike = middleware[index++];
            if (handlerLike === undefined) return;
            await handlerLike(req , res , next);
        }

        await next();
    }

    async #parseQueryParams(rawQueryStringLike) {

        const params = {};

        if (!rawQueryStringLike) return params;

        const couples = rawQueryStringLike.split('&');

        couples.forEach(couple => {

            const [key, value] = couple.split('=');

            if (key && value) {
                params[key.toLowerCase()] = value;
            }

        });

        return params;
    }

    async #addRoute(template , method , handlers) {
        
        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if (methodRoutes === undefined) {
            console.log('wrong'.toUpperCase());
            return;
        }

        if (methodRoutes.has(template) === true) {
            console.log('wrong'.toUpperCase());
            return;
        }
        
        const newRouteBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template, newRouteBundle);

        console.log(`congrats route ${_method} ${newRouteBundle.originalTemplate} is added`);

    }

    async #splitURL(fullURL) {
        
        const [url, rawQueryStringLike] = fullURL.split('?');
        
        return {
            url: /.+\/$/.test(url) ? url.replace(/\/$/, '') : url,
            rawQueryStringLike , 
        }
    }

    async #compileRouteBundle(template , handlers) {
        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g, (_, key) => {
            keys.push(key);
            return '([^\/]+)';
        });

        const bundle = {
            handler: handlers[handlers.length - 1],
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex:new RegExp(`${regexTemplate}`), 
            originalTemplate:template,
            keys ,
        }

        return bundle;
    }
    
    #routes;
    #middleware;

    constructor() {
        const metods = [
            'get', 'post'
        ];

        this.#routes = new Map();

        metods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map);
        });

        this.#middleware = [];

    }
}

module.exports = Router;