
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
     * @param {{body?:Object;context?:Object}} param0 
     * @returns {Promise<any>}
     */
    async [RM_METH.EXEC] ({body = {} , context = {}}) {



        const { error , success } = await RequestRoute.UseFetch({
            url:this.#url , method:this.#method ,
            body:body ,
        });

        if(error) {
            console.log({e});
            return ;
        }

        console.log({error ,success});

        const { response } = success ;

        for (const handler of this.#beforRequestHandlers) {
            await handler(context);
        }

        await this[RM_METH.EXECUTE_MIDDLEWARE](response , context  , this.#globalMiddleware);
        
        for (const handler of this.#handlers) {
            await handler(response , context);
        }
        
    }

    /**
     * 
     * @param {Response} response 
     * @param {Object} context 
     * @param {((response:Response, context:Object, next:(()=>Promise<void>)) => Promise<void>)[]} middleware 
     */
    async [RM_METH.EXECUTE_MIDDLEWARE] (response ,context , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            const {} = (handler && handler(response , context , next)) || {} ;
        }
        await next();
    }

    /**
     * 
     * @param  {...((context:Object , next:(() => Promise<void>)) => Promise<void>)} midddleware 
     */
    [RM_METH.USE_MIDDLEWARE] (...midddleware) {
        midddleware.forEach(middleware => {
            this.#globalMiddleware
        });
    }

    /**
     * 
     * @param  {...((context:Object, next?:(() => Promise<void>)) => Promise<void>)} handlers 
     */
    [RM_METH.ADD_BEFORE_REQUEST_LISTENERES] (...handlers) {
        handlers.forEach(handler => {
            this.#beforRequestHandlers.push(handler);
        });
    }

    /**
     * 
     * @param  {...((response:Response, context:Object, next?:(() => Promise<void>)) => Promise<void>)} handlers 
     */
    [RM_METH.ADD_LISTENERS] (...handlers) {
        handlers.forEach(handler => {
            this.#handlers.push(handler);
        });
    }

    /**
     * 
     * @param {Object} param0 
     * @param {string} param0.url 
     * @param {string} [param0.method="get"] 
     * @param {Object} [param0.body={}] 
     * @returns {Promise<{response:Response}|{error:{location:string;message:string;subjects:Object}}>}
     */
    static async [RM_METH.USE_FETCH] ({
        url , method = "get" , body = {}
    }) {

        if(!url) {
            throw new Error(JSON.stringify({
                location:'RequestRouter::UseFetch' ,
                message:'incorrect URL' ,
                subjects:{url} ,
            }));
        }
        // URL is not validated !!
        
        try {

            const response = await fetch(url , {
                method ,
                ...(method === 'get' ? {} : { body }) ,
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
                    subjects:{nativeError:e} ,
                }
            }
        }
    }

    #url;
    #method;

    #beforRequestHandlers;
    #globalMiddleware;
    #handlers

    /**
     * 
     * @param {{
     *  url:string;
     *  method?:string;
     *  beforeRequest?:((context:Object,next?:(()=>Promise<void>)) => Promise<void>)[];
     *  midddleware?:((response:Response,context:Object,next:(()=>Promise<void>)) => Promise<void>)[];
     *  handlers?:((response:Response,context:Object,next:(()=>Promise<void>)) => Promise<void>)[];
     * }} param0 
     */
    constructor ({url , method = 'get' , beforeRequest = [] , middleware = [] , handlers = []}) {

        if(!url) {
            throw new Error(JSON.stringify({
                location:'RequestRouter::constructor' ,
                message:'incorrect URL' ,
                subjects:{url} ,
            }));
        }

        this.#url = url ;
        this.#method = method ;
        this.#beforRequestHandlers = [...beforeRequest] ;
        this.#globalMiddleware = [...middleware] ;
        this.#handlers = [...handlers] ;
    }
}