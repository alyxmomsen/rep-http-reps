const {} = require('fs');
class Router {

    async handleRequest(req , res) {

        const { url:fullURL , method:_method} = req ;

        const {url , rawQueryStringLike} = this.#splitURL(fullURL);

        const method = _method.toUpperCase();

        const methodRoutes = this.#routes.get(method);

        for (const [_ , routeBundle] of methodRoutes) {

            const match = routeBundle.regex.exec(url);

            if(!match) continue ;

            // bundle params

            const params = {} ;

            routeBundle.keys.forEach((key , i) => {
            
                params[key] = match[i + 1] ;
            });
            
            const queryParams = this.#extractQueryParams(rawQueryStringLike) ;

            // -----------------------

            // apply params to req object

            req.params = params ;
            req.queryParams = queryParams ;

            // ------------------------------

            await this.#executeMiddleware(req ,res , [...this.#middleware , ...routeBundle.middleware]);

            await routeBundle.handler(req , res);
            return ;
        }

        res.writeHead(404);
        res.end();
    }

    get(template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    post(template , ...handlers) {
        this.#addRoute(template , "POST" , handlers);
    }

    use (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    async #executeMiddleware (req, res , middleware) {
        let index = 0 ;
        const next = async () => {
            const handlerLike = middleware[index++] ;
            if(!handlerLike) return ;
            await handlerLike(req, res , next);
        }

        await next();
    }

    #addRoute (template , method , handlers) {

        console.log('add new route...');

        const colorizeConsole = {
            RED:'\x1b[31m' ,
            GREEN:'\x1b[32m' ,
            ORANGE:'\x1b[33',
            DEF:'\x1b[0m' ,
        }

        const _method = method.toUpperCase(method);

        const methodRoutes = this.#routes.get(_method);

        if(!methodRoutes) {

            throw new Error(`this method < ${_method} > is not accepted`);
        }

        if(methodRoutes.has(template)) {
            throw new Error(`this template < ${template} > is already in use`);
        }

        const routeBundle = this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);
        
        console.log(`route ${_method} ${routeBundle.originalTemplate} just added`);

    }

    #compileRouteBundle (template , handlers) {
        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g  , (_ , key) => {
            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys ,
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
            regex:new RegExp(`^${regexTemplate}$`),
        }
    }

    #extractQueryParams (rawQueryStringLike) {

        const params = {} ;

        if(!rawQueryStringLike) return params ;
        
        const couples = rawQueryStringLike.split('&');

        couples.forEach(couple => {

            const [key , value] = couple.split('=');

            if(key && value) {
                params[key.toLowerCase()] = value ;
            };
        });

        return params ; 
    }

    #splitURL (fullURL) {

        const [_url , rawQueryStringLike] = fullURL.split('?');

        return {
            url:/.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url ,
            rawQueryStringLike,
        }
    }

    #routes;
    #middleware;

    constructor () {

        this.#routes = new Map() ;
        this.#middleware = [] ;

        const acceptedMethods = [
            'get' , 'post'
        ] ;

        acceptedMethods.forEach(_method => {
            const method = _method.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}

module.exports = Router ;