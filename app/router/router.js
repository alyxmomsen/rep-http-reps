
class Router {

    handleRequest(req, res) {

    }

    #addRoute(template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            throw new Error(`this method ${_method} is not accepted`);
        }

        if(methodRoutes.has(template)) {
            throw new Error(`this template ${template} already in use`) ;
        }

        const routeBundle = this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);

        console.log(`route ${_method} ${template} just added`);
    }

    #splitURL () {

    }

    #compileRouteBundle (template , handlers) {

        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return `([^\/]+)`;
        })

        return {
            regex:new RegExp(`^${regexTemplate}$`) ,
            handler:handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template,
            keys, 
        }
    }

    #routes ;
    #middleware;

    constructor () {

        const acceptedMethods = [
            'get' , 'post'
        ];

        this.#routes = new Map();
        this.#middleware = [] ;

        acceptedMethods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
            
        });
    }
}

module.exports = Router ;