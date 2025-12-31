class Router {

    async handleRequest(req , res) {

        const { url:rawURLString  , method } = req ;
        
        const methodRoutes = this.#routes.get(method.toUpperCase());

        if(methodRoutes === undefined) {
            console.log(`trying to use method < ${method.toUpperCase()} > but this is not accepted`);
            res.end(`method < ${method.toUpperCase()} > is not accepted`);
            return ;
        }

        const { url , queryString } = await this.#splitURL(rawURLString);

        for (const [template , routeBundle] of methodRoutes) {

            const match = routeBundle.regex.exec(url);

            if(match === null) continue ;

            this.#executeMiddleware(routeBundle.middleware , req , res);

            // extract query params
            const queryParams = await this.#extractQueryParams(queryString);

            console.log({queryParams});

            req.queryParams = queryParams ;
            
            // compile url params
            const params = {};
            routeBundle.keys.forEach((key , i) => {
                
                // console.log(key);

                const value = match[i + 1] ;

                params[key] = value ;    
            });
            req.params = params ;
            // ------------------- 

            routeBundle.handler(req , res);
            return ;
        }        

        res.end('stock respo');
    }

    async get (template , ...handlers) {

        this.#addRoute(template , 'GET' , handlers);
    }

    async post (template , ...handlers) {

        this.#addRoute(template , 'POST' , handlers);
    }

    async use (...middleware) {

        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    #routes ;
    #middleware ;
    #acceptedMethods ;

    async #compileUrlParams (keys , values) {

    }

    async #extractQueryParams (rawQueryString) {

        console.log({rawQueryString});

        if(rawQueryString === undefined) {
            return {} ;
        }

        const params = {} ;

        rawQueryString.split('&').forEach(couple => {

            
            const [ key , value ] = couple.split('=');
            

            if(key !== undefined && value !== undefined) {
                params[key.toLowerCase()] = value ;
            }
        });

        console.log({params});

        return params ;
    }

    async #executeMiddleware (middleware , req , res) {

        let counter = 0 ;

        const next  = () => {

            const oneMiddlewareLike = middleware[counter++];

            if(middleware === undefined) {
                return 
            }

            oneMiddlewareLike(req ,res , next);
        }

        next();

    }

    async #splitURL (rawURLString) {

        const [urlHalf , queryStringHalf] = rawURLString.split('?' , 2);
        
        return  {
            url:/.+\/$/.test(urlHalf) === true ? urlHalf.replace(/\/$/ , '') : urlHalf ,
            queryString:queryStringHalf ,
        }

    }

    async #addRoute (template , method , handlers) {

        const methodRoutes = this.#routes.get(method.toUpperCase());

        if(methodRoutes === undefined) {
            console.log(`this method < ${method.toUpperCase()} > is not accepted`);
            return ;
        }
        
        if(methodRoutes.has(template) === true) {
            
            console.log(`this template < ${method.toUpperCase()} > < ${template} > is already exist`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);

        console.log(`added route < ${method} > < ${routeBundle.originalTemplate} >` ,routeBundle);
    }

    async #compileRouteBundle (template , handlers) {
        
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {

            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys , 
            regex:new RegExp(`^${regexTemplate}$`) ,
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] , 
            originalTemplate:template ,
        }
    }

    constructor () {

        this.#middleware = [];

        this.#acceptedMethods = [
            'GET' , 'POST'
        ];

        this.#routes = new Map() ;

        this.#acceptedMethods.forEach(m => {

            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}


module.exports = {Router} ;