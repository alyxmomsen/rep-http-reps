const { ServerResponse, IncomingMessage } = require('node:http');
const { loggerFactory } = require('../../../utils/logger');
const ResponseDecorator = require('./services/response/response-decorator');

const log = loggerFactory('router' , '-u');
class Router {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest (req , res) {

        const { method , url:urlRawString } =  req ;

        const methodRoute = this.#routes.get(method);

        if(!methodRoute) {
            res.writeHead(400);
            res.end();
            return ;
        }

        const { url , queryString } = this.#splitURL(urlRawString);

        for (const [ tmpl , bundle ] of methodRoute.entries()) {
            const { keys , regex , middleware:routeMiddleware , handler } = bundle ;

            const urlMatch = regex.exec(url);

            if(!urlMatch) continue ;

            // compile params 

            const params = {} ;
            keys.forEach((key , i) => {
                params[key] = urlMatch[i + 1] ;
            });

            const queryParams = this.#extractQueryParams(queryString);

            req.params = params ;
            req.queryParams = queryParams ;

            console.log({params , queryParams});

            await this.#executeMiddleware(req , res , [...this.#globalMiddleware]) ;
            await this.#executeMiddleware(req , res , [...routeMiddleware]) ;

            await handler(req, res);
            return ;
        }

        res.writeHead(404);
        res.end();
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage,res:ServerResponse,next?:(()=>void)) => Promise<void>)} handlers 
     */
    get (template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage,res:ServerResponse,next?:(()=>void)) => Promise<void>)} handlers 
     */
    post (template , ...handlers) {
        this.#addRoute(template , "POST" , handlers);
    }

    /**
     * 
     * @param  {...((req:IncomingMessage,res:ServerResponse,next?:(()=>void)) => Promise<void>)} middleware 
     */
    useMiddleware (...middleware) {
        middleware.forEach(handler => {
            this.#globalMiddleware.push(handler);
        });
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {((req:IncomingMessage,res:ServerResponse,next?:(()=>void)) => Promise<void>)[]} middleware 
     * @returns {Promise<void>}
     */
    async #executeMiddleware (req , res , middleware) {
        // it is not protected from call stack overload !!!
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++];
            handler && await handler(req , res, next);
        }
        await next()
    }

    /**
     * 
     * @param {string} [queryString] 
     * @returns {Object.<string,string>} 
     */
    #extractQueryParams (queryString) {

        const params = {} ;

        if(!queryString) return params ;

        const couples = queryString.split('&');

        couples.forEach(couple => {
            const [key , value] = couple.split('=');
            if(key && value) {
                params[key.toLowerCase()] = value ;
            }
        });

        return params ;
    }

    /**
     * 
     * @param {string} template 
     * @param {string} method 
     * @param {((req:IncomingMessage,res:ServerResponse,next?:(()=>void)) => Promise<void>)[]} handlers 
     */
    #addRoute (template , method , handlers) {

        const normalizedMethod = method.toUpperCase() ;

        const methodRoute = this.#routes.get(normalizedMethod);
        
        if(!methodRoute) {
            throw new Error(`incorrect method ${normalizedMethod}`);
        }

        const routeBundle = this.#compileRouteBundle(template , handlers);

        const { originalTemplate } = routeBundle ;

        methodRoute.set(originalTemplate , routeBundle);
        
        const successMessage = `added route ${normalizedMethod} ${originalTemplate}` ;

        console.log(`\x1b[38;2;255;0;255m${successMessage}\x1b[0m`);
    }

    /**
     * 
     * @param {string} fullURL 
     * @returns {{url:string;queryString?:string}}
     */
    #splitURL (fullURL) {

        const [urlRawPart  , queryString] = fullURL.split('?');
        const normalizedURL = /\.+\/$/.test(urlRawPart) ? urlRawPart.replace(/\/$/ , '') : urlRawPart ; 

        return {
            url:normalizedURL ,
            queryString ,
        }
    }

    /**
     * 
     * @param {string} template 
     * @param {((req:IncomingMessage,res:ServerResponse,next?:(()=>Promise<void>)) => Promise<void>)[]} handlers 
     * @returns {{
     *     keys:string[];
     *     handler:((req:IncomingMessage,res:ServerResponse,next?:(()=>Promise<void>)) => Promise<void>);
     *     middleware:((req:IncomingMessage,res:ServerResponse,next?:(()=>Promise<void>)) => Promise<void>)[];
     *     regex:RegExp;
     *     originalTemplate:string;
     * }}
     */
    #compileRouteBundle (template , handlers) {
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)' ;
        });
        return {
            keys ,
            handler:handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex:new RegExp(`^${regexTemplate}$`) ,
            originalTemplate:template ,
        }
    }
    
    #routes;
    #globalMiddleware;

    /**
     * 
     */
    constructor () {

        const methods = [
            'get' , 'post' ,
        ] ;

        this.#routes = new Map();

        methods.forEach(method => {
            const normalizedMethod = method.toUpperCase();
            this.#routes.set(normalizedMethod , new Map());
        });

        this.#globalMiddleware = [];
    }
}

module.exports = Router ;

