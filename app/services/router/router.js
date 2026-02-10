const {} = require('fs');
const loggerPreffix = 'Router: ' ;
class Router {

    async handleRequest (req , res) {

        const { method:_method } = req;

        const method = _method.toUpperCase();

        const methodRoutes = this.#routes.get(method);

        console.log(loggerPreffix , {methodRoutes})

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