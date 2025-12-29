class Router {

    async handleRequest(req , res) {
        
        res.end('hello');
    }

    async get (template , ...handlers) {

        this.#addRoute(template , "GET" , handlers);
    }

    async post (template , ...handlers) {

        this.#addRoute(template , "POST" , handlers);
    }

    #acceptedMethods;
    #routes;

    async #addRoute (template , method , handlers) {

        const givenMethod = method.toUpperCase();

        const methodRoutes = this.#routes.get(givenMethod);

        if(methodRoutes === undefined) {
            console.log(`this method ${givenMethod} is not accepted`);
            return ;
        }

        if(methodRoutes.has(template) === true) {
            console.log(`this template ${template} already defined`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);

        console.log(`added route ${givenMethod} ${template}`);
    }

    async #compileRouteBundle (template , handlers) {

        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {

            keys.push(key);
        });

        return {
            keys , 
            regex:new RegExp(`^${regexTemplate}$`),
            handler: handlers[handlers.length - 1] , 
            middleware : handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
        }
    }

    constructor () {

        this.#routes = new Map();

        this.#acceptedMethods = [
            'GET' , 'POST',
        ] ;

        this.#acceptedMethods.forEach(m => {

            const method = m.toUpperCase();

            this.#routes.set(method , new Map());
            console.log(`added accepted method : ${method}`);
        });
    }
}


module.exports = {Router} ;