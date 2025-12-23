class Router {



    async handleRequest(req , res) {

        
        

        res.end('hello');
    }

    async get (template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    async post (template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    #routes ;

    async #addRoute (template , method , handlers) {

        const methodRoutes = this.#routes.get(method.toUpperCase());

        if(methodRoutes === undefined) {

            console.log(`this method < ${method} > is not accepted`);
            
            return ;
        }
        
        if(methodRoutes.has(template) === true) {
        
            console.log(`this template < ${template} > alredy is exist`);
            return ;
        }

        const routeBundle  = await this.#compileBundle(template , handlers)

        methodRoutes.set(template , routeBundle);

        console.log(`congratulations route ${method.toUpperCase()} ${routeBundle.originalTemplate} added`);

    }

    async #compileBundle (template , handlers) {

        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {

            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys , 
            regex: new RegExp(`^${regexTemplate}$`) ,
            handler: handlers[handlers.length - 1] ,
            middleware: handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
        }

    }

    constructor () {

        this.#routes = new Map();

        const acceptedMethods = [
            'get' , 'post'
        ];

        acceptedMethods.forEach(m => {

            this.#routes.set(m.toUpperCase() , new Map);

        });

    }
}


module.exports = {Router} ;