
const REQUEST_MANAGER_CONSTANTS = {
    constructor: {
        args:{
            keys:{
                URL:'url' , 
                METHOD:'method' , 
                BEFORE_REQUEST:'beforeRequest' , 
                MIDDLEWARE:'middleware' , 
                HANDLERS:'handlers',
            } ,
        } ,
    } ,
    methods:{
        EXEC:'exec' ,
        USE_MIDDLEWARE:'useMiddleware',
        EXECUTE_MIDDLEWARE:'#executeMiddleware',
        ADD_BEFORE_REQUEST_LISTENERES:'addBeforeRequestListeners',
        ADD_LISTENERS:'addListeners',
        USE_FETCH:'UseFetch' ,

    }
}

const { methods:RM_METH } = REQUEST_MANAGER_CONSTANTS ;

class RequestRoute {

    /**
     * 
     * @param {body?:Object;context?:Object} param0 
     * @return {Promise<void>}
     */
    async [RM_METH.EXEC]({body = {} , context = {}}) {

        for (const handler of this.#beforeRequestHandlers) {
            await handler(context);
        }

        const { success , error } = await RequestRoute[RM_METH.USE_FETCH]({url:this.#url , method:this.#method , body});

        if(error) {
            return {
                error ,
            }
        }

        const { response } = success ;

        await this[RM_METH.EXECUTE_MIDDLEWARE](response , context , this.#middleware) ;
        
        for (const handler of this.#handlers) {
            await handler(response , context);
        }
    }

    /**`
     * 
     * @param {Response} response 
     * @param {Object} context 
     * @param {((response:Response, context:Object, next?:(()=> Promise<void>)) => Promise<void>)[]} middleware 
     */
    async [RM_METH.EXECUTE_MIDDLEWARE] (response , context , middleware = []) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            const {} = (handler && await handler(response , context , next)) || {}
        }
        await next();
    }

    /**
     * 
     * @param  {...((response:Response , context:Object , next?:(() => Promise<void>)) => Promise<void>)[]} handlers 
     */
    [RM_METH.ADD_LISTENERS] (...handlers) {
        handlers.forEach(handler => {
            this.#handlers.push(handler);
        });
    }

    /**
     * 
     * @param  {...((response:Response , context:Object , next?:(() => Promise<void>)) => Promise<void>)[]} handlers 
     */
    [RM_METH.ADD_BEFORE_REQUEST_LISTENERES] (...handlers) {
        handlers.forEach(handler => {
            this.#beforeRequestHandlers.push(handler);
        });
    }

    /**
     * 
     * @param  {...((context:Object , next?:(() => Promise<void>)) => Promise<void>)[]} handlers 
     */
    [RM_METH.ADD_BEFORE_REQUEST_LISTENERES] (...handlers) {
        handlers.forEach(handler => {
            this.#middleware.push(handler);
        });
    }

    /**
     * 
     * @param {{url:string;method?:string;body?:Object}} param0 
     * @returns {{success:{response:Response}}|{error:{location:string;message:string;subjects:Object}}}
     */
    static async [RM_METH.USE_FETCH]({url , method = 'get' , body = {}}) {

        try {

            if(!url) {
                throw new Error(JSON.stringify({
                    location:'093847928743', 
                    subjects:{url} ,
                }));
            }
    
            const response = await fetch(url , { 
                method , 
                ...(method === 'get' ? {} : {body}) ,
    
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
                    location:'' ,
                    subjects:{nativeError:e} ,
                } ,
            }
        }

    }

    #url;
    #method;
    
    #beforeRequestHandlers;
    #middleware;
    #handlers;
    
    /**
     * 
     * @param {{
     *  url:string; 
     *  method:string;
     *  beforeRequest:((context:Object , next?:(()=>Promise<void>))=>void)[];
     *  middleware:((response:Response;context:Object;)=>Promise<void>)[];
     *  handlers
     * }} init 
     */
    constructor (init) {

        const { URL, METHOD, BEFORE_REQUEST, MIDDLEWARE, HANDLERS } = REQUEST_MANAGER_CONSTANTS.constructor.args.keys ;
        
        const url = init[URL] ;
        const method = init[METHOD] || 'get' ;
        const beforeRequestHandlers = init[BEFORE_REQUEST] || [] ;
        const midddleware = init[MIDDLEWARE] || [] ;
        const handlers = init[HANDLERS] || [] ;

        if(!url) {
            throw new Error(`no URL given`);
        }

        this.#url = url ;
        this.#method = method ;

        this.#beforeRequestHandlers = beforeRequestHandlers ;
        this.#middleware = midddleware ;
        this.#handlers = handlers ;
    }
}
