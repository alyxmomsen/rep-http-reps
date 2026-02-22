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

        const { method:_m , url:fullURL } = req; 

        const method = _m.toUpperCase();

        const methodRoutes = this.#routes.get(method);

        if(!methodRoutes) {
            res.writeHead(400);
            res.end();
            return ;
        }

        for (const [ _ , routeBundle ] of methodRoutes.entries()) {

            const { 
                regex: routeTemplateRegex , keys:routeParamsKeys ,
                originalTemplate , handler:routeHandler , 
                middleware:routeMiddleware , 
            } = routeBundle ;

            const { url , queryStringLike } = this.#splitURL(fullURL);

            const urlMatch = routeTemplateRegex.exec(url);

            if(!urlMatch) continue ;

            // compile params

            const params = {} ;

            let i = 0 ;
            for (const key of routeParamsKeys) {
                params[key] = urlMatch[i + 1] ;
                i++ ;
            }

            const queryParams = this.#extractQueryParams(queryStringLike);

            req.params = params ;
            req.queryParams = queryParams ;

            // --------------

            await this.#executeMiddleware(req , res , this.#middleware) ;
            await this.#executeMiddleware(req , res , routeMiddleware) ;

            await routeHandler(req , res);
            return;
        }

        res.writeHead(404);
        res.end();
    }

    get (template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);    
    }

    post (template , ...handlers) {
        this.#addRoute(template , "POST" , handlers);    
    }

    /**
     * 
     * @param  {((req:IncomingMessage , res:ServerResponse , next:(() => Promise<void>)) => Promise<void>)[]} middleware 
     */
    use (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {string|null} queryStringLike 
     * @returns {any}
     */
    #extractQueryParams (queryStringLike) {
        const params = {} ;
        if(!queryStringLike) {
            return params ;
        }
        const couples = queryStringLike.split('&');
        for (const couple of couples) {
            const [key  , value] = couple.split('=');
            if(!key || !value) continue ;
            params[key.toLowerCase()] = value ;
        }
        return params ;
    }

    /**
     * 
     * @param {string} fullURL 
     * @returns {{url:string;queryStringLike:string|null}}
     */
    #splitURL (fullURL) {

        const [ _url , queryString ] = fullURL.split('?');
        return {
            url:/\.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url , 
            queryStringLike:queryString || null ,
        }
    }

    
    /**
     * 
     * @param {string} template 
     * @param {string} method 
     * @param {((req:IncomingMessage , res:ServerResponse , next:(() => vloid)) => void)[]} handlers 
    */
    #addRoute (template , method , handlers) {
       
       const _method = method ;
       
       const methodRoutes = this.#routes.get(_method);
       
       if(!methodRoutes) {
            throw new Error(`incorrect method ${_method}`);
        }
        
        const routeBundle =  this.#assembleRouteBundle(template  , handlers);

        const { originalTemplate } = routeBundle ;

        methodRoutes.set(originalTemplate , routeBundle);

        console.log(`\x1b[38;2;255;0;255madded route ${_method} ${template}\x1b[0m`);
    }
    
    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {((req:IncomingMessage , res:ServerResponse , next:(() => vloid)) => Promise<any>)[]} middleware
     */
    async #executeMiddleware (req ,res , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index];
            if(!handler) return ;
            await handler(req , res , next);
        }
        await next();
    }

    /**
     * 
     * @param {string} template 
     * @param {((req:IncomingMessage , res:ServerResponse , next:(() => vloid)) => void)[]} handlers 
     */
    #assembleRouteBundle (template , handlers) {
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)';
        });

        const bundle = {
            keys ,
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] , 
            regex:new RegExp(`^${regexTemplate}$`) ,
            originalTemplate:template ,
        }

        return bundle ;
    }

    #routes;
    #middleware;

    constructor () {

        this.#routes = new Map();
        this.#middleware = [] ;

        const methods = [
            'get' , 'post' ,
        ] ;

        methods.forEach(m => {
            this.#routes.set(m.toUpperCase() , new Map()) ;
        });


    }
}

module.exports = Router ;

