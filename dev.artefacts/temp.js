
class RequestRouter {

    async exec (body = {}) {

        for (const handler of this.#beforeRequestHandlers) {
            await handler();
        }

        const { response: responseRawData , error } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        
        if(error) {
            console.error({error});
            return ;
        }
        
        await this.#executeMiddleware(responseRawData , [...this.#middleware]);
        
        for (const handler of this.#handlers) {
            await handler(responseRawData) ;
        }
    }

    useMiddleware (...middleware) {
        for (const handler of middleware) {
            this.#middleware.push(handler);
        }
    }

    addOnBeforeRequest (...handlers) {
        for (const handler of handlers) {
            this.#beforeRequestHandlers.push(handler);
        }
    }

    addListener (...handlers) {
        for (const handler of handlers) {
            this.#handlers.push(handler);
        }
    }

    static async UseFetch (url , method = 'get' , body = {}) {
        
        const _method = method.toLowerCase();
        
        try {
            if(!url) {
                throw new Error('fetch: incorrect url provided');
            }

            const response = await fetch(url , {
                method:_method ,
                ...(_method === 'get' ? {} : {body}) ,
            });

            return {
                response ,
            }
        }
        catch (e) {
            console.error({e});
            return {
                error: {
                    details:e ,
                } ,
            }
        }
    }

    async #executeMiddleware (responseRawData , middleware) {
        let index = 0 ;
        const next = async () => {
            const handlerLike = middleware[index++] ;
            if(!handlerLike) return ;
            await handlerLike(responseRawData , next);
        }

        await next();
    }

    #url ;
    #method ;
    #handlers ;
    #middleware ;

    #beforeRequestHandlers ;

    constructor (url , method = 'GET'  , handlers = [] , middleware = [] ) {
        if(!url) {
            throw new Error('RequestRouter constructor: incorrect url provided');
        }

        this.#url = url ;

        const _method = method.toLowerCase();
        this.#method = _method ;

        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;

        this.#beforeRequestHandlers = [] ;

    }
}