
class _RequestRouter {


    /**
     * 
     * @param  {...((context:Object) => Promise<void>)} handlers 
     */
    addBeforeRequestListeners (...handlers) {
        handlers.forEach(handler => {
            this.#beforeRequestListeners.push(handler);
        });
    }

    /**
     * 
     * @param  {...((response:Response , context:Object, next:(() => void)) => Promise<void>)} handlers 
     */
    addListeners (...handlers) {
        handlers.forEach(handler => {
            this.#handlers.push(handler);
        });
    }

    /**
     * @param {Object} body 
     * @param {Object} context 
     * @returns {Promise<void>}
     */
    async exec(body = {} , context = {}) {

        for (const beforeRequestHandler of this.#beforeRequestListeners) {
            await beforeRequestHandler(context);
        }

        const { success  , error } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        if(error) {
            return {
                error ,
            }
        }

        const { response } = success ;

        await this.#executeMiddleware(response , context , this.#middleware);

        for ( const handler of this.#handlers) {
            const {} = (handler && await handler(response , context)) || {};
        }
    }

    /**
     * @param {string} url 
     * @param {Object} body 
     * @returns {Promise<{success?:{response:Response};error?:{message:string;subject:any;location:string}}>}
     */
    static async UseFetch (url , method = "get" , body = {}) {
        
        try {
            
            if(!url) throw new Error(`incorrect url`) ;
    
            const normilizedMethod = method ;
    
            const response = await fetch(url, {
                method:normilizedMethod,
                ...(normilizedMethod === 'get' ? {} : {body}), 
            });

            return {
                success:{
                    response ,
                }
            }
        }
        catch (e) {
            console.log({e});
            return {
                error:{
                    message:'fetch error' ,
                    location:'RequestRouter::UseFetch' ,
                    subject:e ,
                }
            }
        }
    }

    #url;
    #method;

    #beforeRequestListeners;
    #middleware ;
    #handlers ;

    /**
     * 
     * @param  {...((response:Response , context:Object, next:(() => void)) => Promise<void>)} midddleware 
     */
    useMiddleware (...midddleware) {
        midddleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {Response} response 
     * @param {((response:Response , context:Object, next:(() => void)) => Promise<void>)[]} middleware 
     * @returns {Promise<any>}
     */
    async #executeMiddleware (response, context ,  middleware) {
        let index = 0;
        const next = async () => {
            const handler = middleware[index++];
            const {} = (handler && await handler(response , context)) || {};
        }
        await next();
    }

    /**
     * 
     * @param {string} url 
     * @param {string} method 
     * @param {((response:Response , context, next:(() => void)) => Promise<void>)[]} handlers 
     * @param {((response:Response , context, next:(() => void)) => Promise<void>)[]} middleware 
     */
    constructor (url , method = 'GET'  , beforeRequestHandlers = [], handlers = [] , middleware = [] ) {
        if(!url) throw new Error (`incorrect url`) ;
        this.#url = url ;
        this.#method = method.toLowerCase() ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;
        this.#beforeRequestListeners = [...beforeRequestHandlers] ;
    }
}