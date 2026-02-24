
class RequestRouter {

    /**
     * 
     * @param {Object} body 
     * @param {Object} context 
     * @returns {Promise<void>}
     */
    async exec (body = {} , context = {}) {

        for (const handler of this.#beforeRequestHandlers) {
            await handler(context);
        }
        
        const { error , success } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        if(error) {
            return {
                error ,
            }
        }

        const { response } = success ;

        await this.#executeMiddleware(response , context , this.#middleware);

        for (const handler of this.#handlers) {
            await handler(response , context);
        }

    }

    /**
     * 
     * @param  {...((response:Response,context?:Object) => Promise<void>)[]} handlers 
     */
    addListeners (...handlers) {
        handlers.forEach(handler => {
            this.#handlers.push(handler);
        });
    }

    /**
     * 
     * @param  {...((context:Object) => Promise<void>)[]} handlers 
     */
    addBeforeRequestListeners (...handlers) {
        handlers.forEach(handler => {
            this.#beforeRequestHandlers.push(handler);
        });
    }

    /**
     * 
     * @param  {...((response:Response, context?:Object) => Promise)} midddleware 
     */
    useMiddleware (...midddleware) {
        midddleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    static async UseFetch (url , method = "get" , body = {}) {

        const normalizedMethod = method.toLowerCase();

        try {

            if(!url) throw new Error({
                message:'incorrect url' ,
                subject:url ,
            });

            console.log(normalizedMethod , url);
            const response = await fetch(url , {
                method:normalizedMethod ,
                ...(normalizedMethod === 'get' ? {} : {body}) ,
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
                    location:'RequestRouter::UseFetch' ,
                    message:'fetch error' ,
                    subject:e ,
                }
            }
        }
    }

    /**
     * 
     * @param {Response} response 
     * @param {Object} context 
     * @param {((response:Response, context?:Object) => Promise<void>)[]} middleware 
     */
    async #executeMiddleware (response , context , middleware) {
        // stack capacity is not controlled !!!!
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++];
            if(!handler) return ;
            await handler(response , context);
        }
        await next();
    }

    #url;
    #method;

    #beforeRequestHandlers;
    #middleware;
    #handlers;

    /**
     * 
     * @param {{
     * url:string;
     * method?:string;
     * beforeRequest?:((context:Object)=>Promise<void>)[];
     * middleware?:((response:Response, contenxt:Object , next:(()=>Promise<void>))=>Promise<void>)[];
     * handlers?:((response:Response,context:Object)=>Promise<void>)[]
     * }} param0 
     */
    constructor ({url , method = 'get' , beforeRequest = [] , middleware = [] , handlers = []}) {
        if(!url) throw new Error('incorrect url');
        
        this.#url = url ;
        this.#method = method.toLowerCase() ;

        this.#beforeRequestHandlers = [...beforeRequest] ;
        this.#middleware = [...middleware] ;
        this.#handlers = [...handlers] ;

        console.log(this.#method , this.#url);
    }
}