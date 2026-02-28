const { IncomingMessage, ServerResponse } = require("node:http");

const ROUTER_CONTSTANTS = {
    METHODS:{
        KEYS:{
            GET:'GET' ,
            POST:'POST' ,
            PUT:'PUT' ,
            DELETE:'DELETE' ,
        }
    }
}

class Router {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest (req , res) {

        const { method , url:rawURL } = req ;

        const methodRoutes = this.#routes.get(method);

        if(!methodRoutes) {
            res.writeHead(400);
            res.end('incorrect method');
            return ;
        }

        const { url , queryString } = this.#splitURL(rawURL);

        for (const [ _ , routeBundle ] of methodRoutes.entries()) {

            const urlMatch = routeBundle.regex.exec(url);
            if(!urlMatch) continue ;

            // compile params
            
            const params = {} ;
            routeBundle.keys.forEach((key , i) => {
                params[key] = urlMatch[i + 1] ;
            });

            const queryParams = this.#extractQueryParams(queryString) ;

            req.params = params ;
            req.queryParams = queryParams ;

            

            await routeBundle.handler(req , res);
            
            
            // --------------

        }

        res.writeHead(404);
        res.end('not found');
    }

    

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)} handlers 
     */
    get(template , ...handlers) {
        const { KEYS } = ROUTER_CONTSTANTS.METHODS ;
        this.#addRoute(template , KEYS.GET , handlers);
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)} handlers 
     */
    post(template , ...handlers) {
        const { KEYS } = ROUTER_CONTSTANTS.METHODS ;
        this.#addRoute(template , KEYS.GET , handlers);
    }



    /**
     * @param {...((req:IncomingMessage,res:ServerResponse,next?:() => Promise<void>) => Promise<void>)} middleware 
     */
    useMiddleware (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {((req:IncomingMessage,res:ServerResponse,next?:() => Promise<void>) => Promise<void>)[]} middleware 
     */
    async #executeMiddleware (req , res , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++];
            if(!handler) return ;
            const {} = handler(req , res , next) || {} ;
        }
        await next();
    }

    /**
     * 
     * @param {string|null} [queryString] 
     */
    #extractQueryParams (queryString) {
        const params = {} ;
        if(!queryString) {
            return params ;
        }

        queryString.split('&').forEach((couple) => {
            const [ key , value ] = couple.split('=');
            if(key && value) {
                params[key.toLowerCase()] = value ;
            }
        });

        return params ;
    }

    /**
     * 
     * @param {string} rawURL 
     */
    #splitURL (rawURL) {
        const [ url , queryString ] = rawURL.split('?');
        return {
            url:(/^.+\/$/.test(url) && url.replace(/\/$/ , '')) || url ,
            queryString:queryString || null ,
        }
    }

    /**
     * 
     * @param {string} template 
     * @param {string} method 
     * @param {(((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>))[]} handlers 
     */
    #addRoute (template , method , handlers) {

        const normalizedMethod = method.toUpperCase();

        const methodRoutes = this.#routes.get(normalizedMethod);

        if(!methodRoutes) {
            throw new Error(JSON.stringify({
                location:'' ,
                message:"" ,
                subjects:{} ,
            }));
        }

        const routeBundle = this.#assembleRouteBundle(template , handlers);

        const { originalTemplate } = routeBundle ;

        methodRoutes.set(originalTemplate , routeBundle);
        console.log(`\x1b[38;2;255;0;255madded route: ${normalizedMethod} ${originalTemplate}\x1b[0m`);
    }

    /**
     * 
     * @param {string} template 
     * @param {(((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>))[]} handlers 
     * @returns {{
     *  keys:string[];
     *  handler:(req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>;
     *  middleware:((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)[];
     *  regexTemplate:RegExp;
     *  originalTemplate:string;
     * }}
     */
    #assembleRouteBundle (template , handlers) {
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_  , key) => {
            keys.push(key);
            return '([^\/]+)' ;
        });

        return {
            keys , 
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] , 
            regexTemplate:new RegExp(`^${regexTemplate}$`) , 
            originalTemplate:template , 
        }
    }

    #routes ;
    #middleware ; 

    constructor () {

        const { KEYS } = ROUTER_CONTSTANTS.METHODS ;

        this.#routes = new Map();

        for (const [_ , method] of Object.entries(KEYS)) {
            this.#routes.set(method , new Map());
        }

        this.#middleware = [] ;

    }
}

module.exports = Router ;