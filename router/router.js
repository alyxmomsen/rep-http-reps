class _Router {

    async handleRequest(req , res) {

        const {method , url:wholeURL} = req ;
        
        console.log('handle request' , {method});

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            const fallbackmessage = `that method < ${_method} > is not accepted` ;
            console.log(fallbackmessage);
            res.end(fallbackmessage);
            return ;
        }

        const { url , rawQueryString } = await this.splitURL(wholeURL);

        for (const [indexLikeTemplate , routeBundle] of methodRoutes) {
            
            const match = routeBundle.regex.exec(url);

            if(match === null) continue ;

            // compile params

            const params = {} ;

            routeBundle.keys.forEach((key , i) => {

                params[key] = match[i + 1] ;
            });

            const queryParams = await this.#parseQueryParams(rawQueryString) ;

            // end compile params

            req.params = params ;
            req.queryParams = queryParams ;

            this.#executeMiddleware(req ,res , this.#middleware);
            this.#executeMiddleware(req ,res , routeBundle.middleware);

            routeBundle.handler(req , res);
            return ;
        }

        const defaultresponse = 'default response' ;
        res.end(defaultresponse);
    }

    async use (...middleware) {

        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    async get (template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    async post (template , ...handlers) {
        await this.#addRoute(template , "POST" , handlers);
    }

    async splitURL (wholeURLString) {
        
        const [_url , rawQueryString] = wholeURLString.split('?') ;
        
        return {
            url: /.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url , 
            rawQueryString ,
        }
    }

    async #executeMiddleware (req , res , middleware) {

        let counter = 0 ;
        const next = () => {

            const handler = middleware[counter++] ;
            if(handler === undefined) return;

            handler(req , res , next);
        }

        next();

        return ;
    }

    async #parseQueryParams (rawQueryString) {

        const params = {};
        if(rawQueryString === undefined) {
            return params ;
        }

        const couples = rawQueryString.split('&');
        
        for (let couple of couples) {
            const [key , value] = couple.split('=');
            if(key !== undefined && value !== undefined) {

                params[key.toLowerCase()] = value ;
            }
        }

        return params ;
    }

    async #addRoute(template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            const fallbackmessage = `this method < ${_method} > is not accepted` ;
            console.log(fallbackmessage);
            return ;
        }
        
        if(methodRoutes.has(template) === true) {
            const fallbackmessage = `this template < ${_method} > already in use` ;
            console.log(fallbackmessage);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(routeBundle.originalTemplate , routeBundle);
        console.log(`added route < ${_method} > < ${routeBundle.originalTemplate} >`);
    }   

    #routes ;
    #middleware;

    async #compileRouteBundle (template , handlers) {

        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)'
        });

        return {
            keys ,
            handler: handlers[handlers.length - 1] ,
            middleware: handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex:new RegExp(`^${regexTemplate}$`),
            originalTemplate:template , 
        }
    }

    constructor () {
        
        this.#middleware = [];
        this.#routes = new Map;
        const acceptMethods = [
            'GET' , "POST" ,
        ];

        acceptMethods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map);
        });
    }
}


module.exports = {_Router} ;