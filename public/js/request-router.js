
class RequestRouter {


    /**
     * 
     * @param  {...((payload) => void)} handlers 
     */
    addBeforeRequestListeners (...handlers) {
        handlers.forEach(handler => {
            this.#beforeRequestListeners.push(handler);
        });
    }

    /**
     * 
     * @param  {...((response:Response , next:(() => void)) => void)} handlers 
     */
    addListeners (...handlers) {
        handlers.forEach(handler => {
            this.#handlers.push(handler);
        });
    }

    /**
     * @param {Object} body 
     * @returns {Promise<void>}
     */
    async exec(body = {}) {
        const { success  , error } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        if(error) {
            return {
                error ,
            }
        }

        const { response } = success ;

        await this.#executeMiddleware(response , this.#middleware);

        for ( const handler of this.#handlers) {
            await handler(response);
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
     * @param  {...((response:Response , next:(() => void)) => Promise<void>)} midddleware 
     */
    useMiddleware (...midddleware) {
        midddleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {Response} response 
     * @param {((response:Response , next:(() => void)) => void)[]} middleware 
     * @returns {Promise<any>}
     */
    async #executeMiddleware (response,  middleware) {
        let index = 0;
        const next = async () => {
            const handler = middleware[index++];
            const {} = (handler && handler(response , context)) || {};
        }
        await next();
    }

    /**
     * 
     * @param {string} url 
     * @param {string} method 
     * @param {((response:Response , next:(() => void)) => Promise<void>)[]} handlers 
     * @param {((response:Response , next:(() => void)) => Promise<void>)[]} middleware 
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