class Router {

    async handleRequest(req , res) {

        const { method , url:fullURL } = req; 
        const _method = method.toUpperCase();
        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {

            const fallbackmessage = `method ${_method} is not accepted` ;
            console.log(fallbackmessage);
            res.end(fallbackmessage);
            return ;
        }

        const {url , rawQueryString } = await this.#splitURL(fullURL);

        for (const [templateLikeId , routeBundle] of methodRoutes) {

            const match = routeBundle.regex.exec(url);
            
            if(match === null) continue ;


            // await this.#execMiddleware(req , res , this.#middleware);
            await this.#execMiddleware(req , res , routeBundle.middleware);


            // ------------------------------------
            const queryParams = this.#extractQueryStringParams(rawQueryString) ;
           
            const params = {};
            routeBundle.keys.forEach((key , i) => {
                params[key] = match[i + 1] ;
            });

            // ------------------------------------
            req.queryParams = queryParams ;
            req.params = params ;
            await routeBundle.handler(req , res) ;
            return ;
        }

        res.end('this is ');
    }

    async get (template , ...handlers) {
        this.#addRoute(template , "GET"  ,handlers);
    }

    async post (template , ...handlers) {
        this.#addRoute(template , "POST"  ,handlers);
    }

    async use (...middleware) {

        middleware.forEach(m => {

            this.#middleware.push(m);
        });
    }

    async #extractQueryStringParams (rawQueryString) {

        const queryParams = {}
        if(rawQueryString === undefined) {
            return queryParams ;
        }

        const queryStringParts = rawQueryString.split('&') ;

        queryStringParts.forEach((qsPart) => {

            const [key , value] = qsPart.split('=');
            if(key !== undefined && value !== undefined) {
                queryParams[key.toLowerCase()] = value ;
            }
        });

        return queryParams ;
    }

    async #execMiddleware (req,  res , middleware) {

        console.log({middleware});

        let counter = 0 ;

        const next = () => {
            
            console.log({middleware:middleware[counter++]});

            const middlewareOne = middleware[counter++] ;
            if(middlewareOne === undefined) {
                return ;
            }

            middlewareOne(req , res , next);
        }

        next();

    }

    async #splitURL (fullURL) {

        const [urlHalf , queryStringHalf ] = fullURL.split('?');

        return {
            url:/.+\/$/.test(urlHalf) ? urlHalf.replace(/\/$/ , '') : urlHalf , 
            rawQueryString:queryStringHalf ,
        }
    }

    async #addRoute(template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            console.log(`this route ${_method} is not accepted`);
            return;
        }

        if(methodRoutes.has(template) === true) {
            console.log(`this template ${template} is already in use`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(routeBundle.originalTemplate , routeBundle);

    }

    async #compileRouteBundle (template , handlers) {
        
        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)' ;
        });

        console.log({keys , template});

        return {
            keys , 
            originalTemplate:template ,
            handler:handlers[handlers.length - 1] ,
            middleware: handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex:new RegExp (`^${regexTemplate}$`) ,
        }

    }

    #acceptedMethods;
    #middleware;
    #routes;

    constructor () {

        this.#middleware = [] ;

        this.#routes = new Map();

        const accepted = [
            'get' , 'post'
        ] ;

        this.#acceptedMethods = new Map();

        accepted.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}


module.exports = {Router} ;