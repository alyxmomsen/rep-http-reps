const {} = require('fs');
const loggerPreffix = 'Router: ' ;
class Router {

    async handleRequest (req , res) {

        const { method:_method , url:fullURL } = req;

        const method = _method.toUpperCase();

        const methodRoutes = this.#routes.get(method);

        if(!methodRoutes) {
            res.writeHead(404);
            console.log(loggerPreffix , `required no defined method < ${method} > `);
            res.end();
            return ;
        }

        const {url,queryStringLike} = this.#splitURL(fullURL);

        for (const [_ , routeBundle] of methodRoutes.entries()) {

            const { regex , handler , keys , middleware } = routeBundle ;

            const match = regex.exec(url);

            if(!match) continue ;

            // compile params
            const params = {} ;
            keys.forEach((key , i) => {
                params[key] = match[i + 1] ;
            });

            const queryParams = this.#extractQueryParams(queryStringLike);
            
            req.params = params ;
            req.queryParams = queryParams ;
            // ==============

            await this.#executeMiddleware(req , res , [...this.#middleware , ...middleware]);

            await handler(req ,res);
            return ;
        }

        res.writeHead(404);
        res.end();
    }

    use(...handlers) {
        handlers.forEach(handler => {
            this.middleware.push(handler);
        });
    }

    get(template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    post(template , ...handlers) {
        this.#addRoute(template , "POST" , handlers);
    }

    async #executeMiddleware (req , res , middlewareArr) {
        let index = 0 ;

        const next = async () => {
            const handler = middlewareArr[index++] ;
            if(!handler) return ;
            await handler(req , res , next);
        }

        await next();
    }

    #extractQueryParams (queryStringLike) {
        const params = {} ;
        if(!queryStringLike) return params ;
        const couples = queryStringLike.split('&');
        couples.forEach(couple => {
            const [key , value] = couple.split('=');
            if(key && value) {
                params[key.toLowerCase()] = value ;
            }
        });
        return params ;
    }

    #splitURL (fullURL) {
        const [_url , queryString] = fullURL.split('?');
        return {
            url: /.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url ,
            queryStringLike:queryString ,
        }
    }

    #addRoute (template , method , handlers) {

        const _method = method.toUpperCase() ;

        const methodRoutes = this.#routes.get(_method);

        if(!methodRoutes) {
            throw new Error(`this method < ${_method} > is not defined`) ;
        }

        const routeBundle = this.#makeRouteBundle(template , handlers);

        const { originalTemplate } = routeBundle ;

        methodRoutes.set(originalTemplate , routeBundle);

        console.log(loggerPreffix , `new route < ${_method} ${originalTemplate} > just added`);
    }

    #makeRouteBundle (template , handlers) {
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)' ;
        });

        const handlersLength = handlers.length ;

        return {
            keys ,
            regex:new RegExp(`^${regexTemplate}$`),
            handler: handlers[handlersLength - 1] ,
            middleware: handlersLength > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
        }
    }

    #routes;
    #middleware;

    constructor () {
        this.#routes = new Map ;
        this.#middleware = [] ;

        const defaultMethods = ['get' , 'post'] ;

        defaultMethods.forEach(m => {
            const _method = m.toUpperCase();
            this.#routes.set(_method , new Map);
        });
    }
}

module.exports = Router ;