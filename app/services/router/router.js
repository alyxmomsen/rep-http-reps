const { IncomingMessage, ServerResponse } = require("node:http");

const ROUTER_CONSTANTS = {
    METHODS: {
        GET:"GET" ,
        POST:"POST" ,
        PUT:"PUT" ,
        DELETE:"DELETE" ,
    } ,
    MAX_MIDDLEWARE_CALLSTACK_CAPACITY:1 , // demo value
}

class HTTPRouter {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest (req , res) {

        const { method , url:fullURLString } = req; 

        const normalizedMethod = method.toUpperCase();

        const methodRoutes = this.#routes.get(normalizedMethod);

        if(!methodRoutes) {
            res.writeHead(400 , 'bad request' , {
                "content-type":'application/json' ,
            });
            res.end(JSON.stringify({
                message:'incorrect message'
            }));
            return ;
        }

        for (const [ _ , routeBundle ] of methodRoutes.entries()) {

            const { 
                keys:routeParamsKeys , regex:routeBundleRegex , 
                handler , middleware:routeMiddleware , originalTemplate 
            } = routeBundle ;

            const { url , rawQueryString } = this.#splitURL(fullURLString);

            const urlMatch = routeBundleRegex.exec(url);

            if(!urlMatch) continue ;

            // extract params

            const params = {} ;

            routeParamsKeys.forEach((key , i) => {
                params[key.toLowerCase()] = urlMatch[i + 1] ;
            });

            const queryParams = this.#extractQueryParams(rawQueryString) ;

            req.params = params ;
            req.queryParams = queryParams ;

            // -------------- 

            await this.#executeMiddleware(req , res, this.#middleware);
            await this.#executeMiddleware(req , res, routeMiddleware);

            await handler(req , res);
            return ;
        }
        
        res.writeHead(404);
        res.end();
    }

    /**
     * 
     * @param {string} tempalate 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)} handlers 
     */
    get (tempalate , ...handlers) {
        const { METHODS } = ROUTER_CONSTANTS ;
        const method = METHODS.GET;
        this.#addRoute(tempalate , method , handlers);
    }

    /**
     * 
     * @param {string} tempalate 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)} handlers 
     */
    post (tempalate , ...handlers) {
        const { METHODS } = ROUTER_CONSTANTS ;
        const method = METHODS.POST;
        this.#addRoute(tempalate , method , handlers);
    }

    /**
     * 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)} middleware 
     */
    useMiddleware (...middleware) {
        middleware.forEach(onceMiddleware => {
            this.#middleware.push(onceMiddleware);
        });
    }

    /**
     * 
     * @param {string} [rawQueryString] 
     */
    #extractQueryParams (rawQueryString) {
        const params = {} ;
        if(!rawQueryString) return params ;

        const paramsCouples = rawQueryString.split('&');
        paramsCouples.forEach(couple => {
            const [ key , value ] = couple.split('=');
            if(key && value) {
                params[key.toLocaleLowerCase()] = value ;
            }
        });

        return params ;
    }

    /**
     * 
     * @param {string} fullURLString 
     * @returns {{
     *  url:string ,
     *  rawQueryString?:string
     * }}
     */
    #splitURL (fullURLString) {
        const [ url , rawQueryString ] = fullURLString.split('?') ;
        return {
            url: /^.+\/$/.test(url) ? url.replace(/\/$/ , '') : url ,
            rawQueryString ,
        }
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)[]} middleware
     * @returns {Promise<void>} 
     */
    async #executeMiddleware (req , res , middleware) {
        // const { MAX_MIDDLEWARE_CALLSTACK_CAPACITY:MAX_CAPACITY } = ROUTER_CONSTANTS ;
        // let callStackCapacity = 0;
        // const MAX_CALLSTACK_CAPACITY = MAX_CAPACITY ;
        let index = 0;
        const next = async () => {
            if(true/* (callStackCapacity++) < MAX_CALLSTACK_CAPACITY */) {
                const handler = middleware[index++] ;
                if(!handler) return ;
                await handler(req ,res , next);
            }
        }
        await next();
    }

    /**
     * 
     * @param {string} template 
     * @param {string} method 
     * @param {((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)[]} handlers 
     */
    #addRoute (template , method , handlers) {

        const normalizedMethod = method.toUpperCase();
        const methodRoues = this.#routes.get(normalizedMethod);

        if(!methodRoues) {
            throw new Error(JSON.stringify({
                location:'HTTPRouter::#addRoute' ,
                message:'incorrect method',
                subjects:{normalizedMethod} ,
            }));
        }

        const routeBundle = this.#assembleRouteBundle(template , handlers);

        const { originalTemplate } = routeBundle ;

        methodRoues.set(originalTemplate , routeBundle);


        const successMessage = `added route: ${normalizedMethod} ${originalTemplate}` ;
        console.log(`${successMessage}`);
    }

    /**
     * 
     * @param {string} template 
     * @param {((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)[]} handlers
     * @returns {{
     *  keys:string[];
     *  regex:RegExp;
     *  handler:(req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>;
     *  middleware:((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)[];
     *  originalTemplate:string;
     * }}
     */
    #assembleRouteBundle (template , handlers) {

        const keys = [] ;
        const templateRegex = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)'
        });
        
        return {
            keys ,
            regex: new RegExp(`^${templateRegex}$`) ,
            handler: handlers[handlers.length - 1] ,
            middleware: handlers.length > 1 ? handlers.slice(0  , -1) : [] ,
            originalTemplate: template ,
        }
    }

    #routes;
    #middleware;

    constructor () {
        this.#routes = new Map();
        this.#middleware = [] ;

        const { METHODS } = ROUTER_CONSTANTS ;

        for (const [key , methodName] of Object.entries(METHODS)) {
            this.#routes.set(methodName , new Map());
            console.log(
                '\x1b[33m' + 'added route: '.toUpperCase() + '\x1b[38;2;255;0;255m' + methodName + '\x1b[33m ; route details: \x1b[38;2;255;0;255m' , 
                this.#routes.get(methodName), 
                '\x1b[0m'
            );
        }

    }
}

module.exports = HTTPRouter ;