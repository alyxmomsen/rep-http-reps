
class Router {

    async handleRequest(req, res) {

        const { method:_m , url:fullURL } = req; 

        const method = _m.toUpperCase();

        const methodRoutes = this.#routes.get(method);

        if (methodRoutes === undefined) {
            res.writeHead(400);
            res.end();
            return ;
        }

        const {url , rawQueryString } = this.#splitURL(fullURL);

        for (const [_ , routeBundle ] of methodRoutes.entries()) {

            const match = routeBundle.regex.exec(url);

            if(!match) continue ;
            
            // process params...

            const params = {} ;
            routeBundle.keys.forEach((key , i) => {
                params[key] = match[i + 1] ;
            });

            // compile query params...

            const queryParams = this.#extractQueryParams(rawQueryString);

            // apply params...

            req.params = params ;
            req.queryParams = queryParams ;

            await this.#executeMiddleware(req , res , [...this.#middleware , ...routeBundle.middleware]);

            await routeBundle.handler(req , res);
            return ;
        }

        res.writeHead(404);
        res.end();
    }

    use (...middleware) {

        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    get(template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    post(template , ...handlers) {
        this.#addRoute(template , "POST" , handlers);
    }

    async #executeMiddleware (req ,res , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index];
            if(!handler) return ;
            await handler(req , res , next);
        }

        await next();
    }

    #extractQueryParams (rawQueryString) {

        const params = {} ;
        if(!rawQueryString) return params ;
        const couples = rawQueryString.split('&');
        for(const couple of couples) {
            const [key , value] = couple.split('=');
            if(!key || !value) continue ;
            params[key.toLowerCase()] = value ;
        }
        return params ;
    }

    #addRoute(template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            throw new Error(`this method ${_method} is not accepted`);
        }

        if(methodRoutes.has(template)) {
            throw new Error(`this template ${template} already in use`) ;
        }

        const routeBundle = this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);

        console.log(`route ${_method} ${template} just added`);
    }

    #splitURL (fullURL) {
        const [ _url , rawQueryString ] = fullURL.split('?') ;

        const url = /.+\/$/.test() ? _url.replace(/\/$/ , '') : _url ;

        return {
            url ,
            rawQueryString ,
        }
    }

    #compileRouteBundle (template , handlers) {

        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return `([^\/]+)`;
        })

        return {
            regex:new RegExp(`^${regexTemplate}$`) ,
            handler:handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template,
            keys, 
        }
    }

    #routes ;
    #middleware;

    constructor () {

        const acceptedMethods = [
            'get' , 'post'
        ];

        this.#routes = new Map();
        this.#middleware = [] ;

        acceptedMethods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
            
        });
    }
}

module.exports = Router ;