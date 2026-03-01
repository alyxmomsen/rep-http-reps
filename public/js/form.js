
window.addEventListener('DOMContentLoaded' , () => {




});

class RequestRouter {

    // execute

    addListener (handler) {
        this.#routes.get();
    }

    addRoute (url , method , handler) {

        const routeBundle = {
            method , 
            handler ,
        }

        this.#routes.set(url , routeBundle);
    }

    #routes;

    constructor () {
        this.#routes = new Map();
    }
}

class RequestRoute {

    async execute (body = {}) {
        const { error , success } = await RequestRoute.UseFetch(this.#url , this.#method , body);

        if(error) {
            console.log({error});
            return ;
        }

        const { response } = success ;

        this.#responseHandler(response , );

        for (const handler of this.#responseHandler) {
            await handler(response);
        }
    }

    static async UseFetch (url , method , body) {
        try {
            const response = await fetch(url , {
                method:method , 
                ...(method === 'get'? {} : { body }),
            });

            return {
                success:{
                    response ,
                } ,
            }
        }
        catch (e) {
            console.log({e});
            return {
                error:{
                    location:'RequestRoute::execute' ,
                    message:'' ,
                    subjects:{naiveError:{e}}
                }
            }
        }
    }

    addBeforeRequestListeners (...handlers) {
        handlers.forEach(handler => {
            this.#beforeRequestHandlers.push(handler);
        });
    }

    addMiddleware (...handlers) {
        handlers.forEach(handler => {
            this.#middleware.push(handler);
        });
    }

    /**
     * 
     * @param {(response:Response , payload) => Promise<void>} handler 
     */
    addResponseHandler (handler) {
        this.#responseHandler = async (res) => await handler(res , payload) ;
    }

    #url ;
    #method ;
    #responseHandler ;
    #middleware ;
    #beforeRequestHandlers ;

    /**
     * 
     * @param {string} url 
     * @param {string} method 
     * @param  {...((res:Response , payload:Object) => Promise<void>)} handlers 
     */
    constructor (url , method , ...handlers) {
        this.#url = url ;
        this.method = method ;
        this.#responseHandler = handlers.length ? handlers[handlers.length - 1] : f=>f ;
        this.#middleware = [] ;
        this.#beforeRequestHandlers = [] ;
    }
}