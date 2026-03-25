const { IncomingMessage, ServerResponse } = require("node:http");

const LOCAL_CONSTANTS = {
    METHODS:{
        GET:'GET',
        POST:'POST',
        PUT:'PUT',
        DELETE:'DELETE',
    }
}

class Router {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest (req, res) {

    }

    #addRoute () {
        
    }

    #routes;
    #middleware;

    constructor () {
        this.#middleware = [];
        this.#routes = new Map();

        for (const [k, normalMethodKey] of Object.entries(LOCAL_CONSTANTS.METHODS)) {
            this.#routes.set(normalMethodKey, new Map());
            console.log(`\x1b[33madded HTTP method ${normalMethodKey}\x1b[0m`);
        }
    }
}

module.exports = Router;