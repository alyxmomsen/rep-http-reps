
class Router {


    async handleRequest (req , res) {



        return ;
    }

    async get (template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    async #addRoute (template , method , handlers) {

        const _method = method.toUppercase();

        const methodRoutes = this.#routes.get(_method);

    }

    async #compileRouteBundle (template , handlers) {

    }

    #routes ;
    #middleware ;
    #acceptedMethods ;

    constructor () {
        
        this.#routes = new Map();
        this.#middleware = [] ;
        this.#acceptedMethods = [] ;

        const acceptedMethods = [
            'get' , 'post'
        ];

        acceptedMethods.forEach(m => {
            const method = m.toUppercase();
            this.#routes.set(method , new Map());
        });
    }
}