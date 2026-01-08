class Router {

    async handleRequest(req , res) {


        

        res.end('hello');
    }

    async get () {
        this.#addRoute();
    }

    async #addRoute(template , method , handlers) {

    }

    constructor () {

    }
}


module.exports = {Router} ;