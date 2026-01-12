
class Router {

    async handleRequest(req , res) {

        const {method , url:fullURL} = req ;
        const _method = method.toUpperCase() ;

        const methodRoutes = await this.#routes.get(_method);

        if(methodRoutes === undefined) {
            console.log();
            res.end(`${_method} is not accepted`);
            return ;
        }

        const {url , rawQueryString} = await this.#splitURL(fullURL);
        for (const [_ , routeBundle] of methodRoutes) {

            const urlmatch = routeBundle.regex.exec(url);

            if(urlmatch === null) {
                continue ;
            }

            // extract params

            const params = {};

            routeBundle.keys.forEach((key , i) => {
                params[key] = urlmatch[i + 1] ;
            });

            const queryParams = this.#parseQueryParams(rawQueryString);
            
            // end extract params
            req.params = params ;
            req.queryParams = queryParams ;
            
            await this.#executeMiddleware(req ,res , this.#middleware);
            await this.#executeMiddleware(req , res , routeBundle.middleware);
            
            routeBundle.handler(req , res);
            return ;
        }

        res.end('foo bar');
    }

    async use (...middleware) {

        middleware.forEach(mw => {

            this.#middleware.push(mw);
        });
    }

    async get (template , ...handlers) {
        await this.#addRoute(template  , 'GET' , handlers);
    }

    async post (template , ...handlers) {
        await this.#addRoute(template  , 'POST' , handlers);
    }

    #routes ;
    #middleware ;

    async #executeMiddleware(req , res , middleware) {

        let counter = 0 ;
        const next = () => {

            const handlerlike = middleware[counter++] ;

            if(handlerlike === undefined) return ;

            handlerlike(req , res , next);
        }

        next();

    }

    async #parseQueryParams (rawQueryString) {

        if(rawQueryString === undefined) return null ;

        const params = {} ;

        const couples = rawQueryString.split('&');
        couples.forEach((couple) => {

            const [key , value] = couple.split('=');

            if(key !== undefined & value !== undefined) {
                params[key.toLowerCase()] = value ;
            }

        });

        return params ;

    }

    async #splitURL (fullURL) {

        const [urlHalf , queryStringHalf] = fullURL.split('?');

        return {
            url:/.+\/$/.test(urlHalf) ? urlHalf.replace(/\/$/ , '') : urlHalf ,
            rawQueryString:queryStringHalf ,
        }
    }

    async #addRoute (template , method , handlers) {

        const _method = method ;

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            console.log(`method ${_method} is not accepted`);
            return ;
        }
        
        if(methodRoutes.has(template) === true) {
            console.log(`template ${template} already in use`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(routeBundle.originalTemplate , routeBundle);

        console.log(`route < ${routeBundle.originalTemplate} > is sat`);

    }

    async #compileRouteBundle (template  , handlers) {

        const keys = [] ;
        const regex= /:([^\/]+)/g ;
        const regexTemplate = template.replace(regex , (_ , key) => {
            return '([^\/]+)';
        });

        const bundle = {
            keys , 
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
            regex:new RegExp(`^${regexTemplate}$`) ,
        } ;
 
        return bundle ;
    }

    constructor () {

        this.#routes = new Map();
        this.#middleware = [] ;

        const am = 'get post put delete';

        am.split(' ').forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}


module.exports = {Router} ;