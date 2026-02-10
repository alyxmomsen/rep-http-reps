
class Router {

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

        methodRoutes.set();

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
    }
}