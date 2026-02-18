class RequestRouter {

    async exec (body = {}) {

        // on-before-request-started

        for (const handler of this.#onBeforeRequestStartHandlers) {
            handler();
        }

        // =========================

        const { error , response } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        // =========================

        if(error) {
            console.error({error});
            return ;
        }

        // =========================

        await this.#executeMiddleware(response , [...this.#middleware]);
        for (const handler of this.#handlers) {
            await handler(response);
        }    

        // on-after-request-handled
        // ...
        // ------------------------
    }

    onBeforeRequestStarted (...handlers) {
        handlers.forEach(handler => {
            this.#onBeforeRequestStartHandlers.push(handler) ;
        });
    }
    
    useMiddleware (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }
    
    addHandlers (...handlers) {
        handlers.forEach((handler) => {
            this.#handlers.push(handler);
        });
    }
    
    static async UseFetch (url , method = 'get' , body = {}) {
        
        if(!url) throw new Error('usefetch :: incorrect url provided');
        if(!method) throw new Error('usefetch :: incorrect method provided');

        const _method = method.toLowerCase();

        try {

            const response = await fetch (url , {
                method:_method ,
                ...(_method === 'get' ? {} : {body}) ,
            }) ;

            return {
                response ,
            }
        }
        catch (e) {
            return {
                error:{
                    message:{
                        native:e ,
                    } ,
                } ,
            }
        }
    } 

    #handleError (err) {
        console.log({err});
    }
    
    async #executeMiddleware (responseByFetch , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(responseByFetch , next);
        }
        await next();
    }

    #url ;
    #method ;
    #handlers ;
    #middleware ;

    #onBeforeRequestStartHandlers ;
    
    constructor (
        url , 
        method , 
        handlers = [] , 
        middleware = [] , 
        onRequestStart = []
    ) {
        
        if(!url) throw new Error('router :: incorrect url provided ');
        
        if(!method) throw new Error('router :: incorrect method provided');

        const _method = method.toLowerCase();

        this.#url = url ;
        this.#method = method ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;

        this.#onBeforeRequestStartHandlers = [...onRequestStart] ;
    }
}