const {} = require('fs') ;
const { loggerFactory } = require('../../../utils/logger');
const ResponseDecorator = require('./services/response/response-decorator');
const log = loggerFactory('router' , '-u');
class Router {

    async handleRequest(req , res) {

        // этот объект работает с конкретным объектом ServerResponse
        const routerResponse = new ResponseDecorator (res) ;

        // ----------------------------

        const { method:m , url:fullURL } = req ;
        const method = m.toUpperCase();

        const methodRoutes  = this.#routes.get(method);

        if(!methodRoutes) {
            res.writeHead(403);
            res.end();
            return ;
        }

        const { url , queryStringLike } = this.#splitURL(fullURL);

        for (const [_t , routebundle] of methodRoutes.entries()) {
            
            const { regex , handler , middleware , keys } = routebundle ;

            const urlmatch = regex.exec(url);

            if(!urlmatch) continue ;

            // bundle params
            
            const params = {} ; 
            keys.forEach((key , i) => {
                params[key] = urlmatch[i + 1] ;
            });

            const queryParams = this.#extractQueryParams(queryStringLike);

            req.params = params ;
            req.queryParams = queryParams ;

            log('def' , {params , queryParams})

            // ===============

            await this.#executeMiddleware(req ,res , [...this.#middleware , ...middleware]);

            await handler(req , routerResponse);
            return ;
        }

        res.writeHead(404);
        res.end();
    }

    use (...middleware) {
        middleware.forEach(mw => this.#middleware.push(mw));
    }

    get(template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    post(template , ...handlers) {
        this.#addRoute(template , 'POST' , handlers);
    }

    async #executeMiddleware (req ,res , middlewareArr) {
        let index = 0 ;
        const next = async () => {
            const handlerLike = middlewareArr[index++] ;
            if(!handlerLike) return ;
            await handlerLike(req , res , next) ;
        }
        await next();
    }

    #splitURL (fullURL) {

        const [_url , queryStringLike ] = fullURL.split('?');

        return {
            url:/.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url ,
            queryStringLike ,
        } 
    }

    #extractQueryParams (queryStringLike) {
        const params = {} ;

        if(!queryStringLike) return params ;
        
        const couples = queryStringLike.split('&');

        couples.forEach(couple => {
            const [key , value] = couple.split('=');
            if(key && value) {
                params[key.toLowerCase()] = value ;
            }
        });

        return params ;

    }

    #addRoute (template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(!methodRoutes) throw new Error(`method ${_method} is not defined`) ;

        const routeBundle = this.#assembleRouteBundle(template , handlers);

        const {originalTemplate:_template} = routeBundle ;

        methodRoutes.set(_template , routeBundle);

        log('def' , `route ${_method} ${_template}`) ;
    }

    #assembleRouteBundle (template , handlers) {

        const keys = [] ;

        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)' ;
        });

        return {
            keys ,
            handler: handlers[handlers.length - 1], 
            middleware: handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex: new RegExp(`^${regexTemplate}$`) ,
            originalTemplate:template ,
        }
    }

    #routes;
    #middleware ;

    constructor () {
        
        this.#routes = new Map () ;
        this.#middleware = [] ;

        const methods = [
            'get' , 'post'
        ];

        methods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });

    }
}

module.exports = Router ;

