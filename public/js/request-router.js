class RequestRouter {

    async exec (body = {}) {

        for (const handler of this.#beforeRequestHandlers) {
            await handler();
        }

        const { error , response } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        if(error) {
            console.log({error});
            return ;
        }

        for (const handler of this.#handlers) {
            await handler(response);
        }

    }

    onBeforeRequest (...handlers) {
        
        for (const handler of handlers) {
            this.#beforeRequestHandlers.push(handler);
        }
    }

    addHandlers (...handlers) {
        handlers.forEach(h5r => {
            this.#handlers.push(h5r);
        });
    }

    async useMiddleware (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    async #executeMidddleware (response , ...middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(response , next);
        }
        await next () ;
    }

    static async UseFetch (url , method , body) {

        if(!url) throw new Error ('usefetch: no url was provided');
        const _method = method.toLowerCase();

        try {
            const response = await fetch(url , {
                method:_method , 
                ... (_method === 'get' ? {} : {body}) ,
            });
            return {
                response: response ,
            }
        }
        catch (e) {
            console.log({e});
            return {
                error:{
                    details:e ,
                }
            }
        }

    }

    #url ;
    #method ;
    #handlers ;
    #middleware ;
    #beforeRequestHandlers ;

    constructor ({url , method  , handlers = [] , middleware = [] , beforeRequestHandlers = []}) {

        if(!url) throw new Error('no url given');

        this.#url = url ;
        this.#method = method ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;
        this.#beforeRequestHandlers = [] ;
    }
}