
class Router {

    async handleRequest (req , res) {

        const { method:mtd , url:fullURL} = req ;

        console.log({mtd , fullURL});
        const method = mtd.toUpperCase();

        const methodRoutes = this.#routes.get(method);

        if(methodRoutes === undefined) {
            console.log('\x1b[31mrequest to route that no accepted\x1b[0m');
            res.writeHead(403);
            res.end();
            return ;
        }

        const { url , rawQueryString } = this.#splitURL(fullURL);

        for (const [_t , routeBundle] of methodRoutes.entries()) {

            const match = routeBundle.regex.exec(url);

            if(!match) continue ;

            // compile params

            const params = {} ;

            routeBundle.keys.forEach((key , i) => {
                params[key] = match[i + 1] ;
            });

            const queryParams = this.#extractQueryParams(rawQueryString);

            // set params into the req object

            req.params = params ;
            req.queryParams = queryParams ;

            this.#executeMiddleware(req, res , [...this.#middleware , ...routeBundle.middleware]);

            routeBundle.handler(req , res);
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

    get (template , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    post (template , ...handlers) {
        this.#addRoute(template , "POST" , handlers);
    }

    #executeMiddleware (req ,res , middleware) {
        let index = 0 ;
        const next = () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            handler(req ,res , next);
        }

        next();
    }

    #extractQueryParams (rawQueryString) {

        const params = {} ;
        if(!rawQueryString) return params ;

        const couples = rawQueryString.split('&');

        couples.forEach(couple => {

            const [key , value] = couple.split('=');

            if(key && value) {
                params[key.toLowerCase()] = value ;
            }
        });

        return params ;
    }

    #splitURL (fullURL) {

        const [_url , rawQueryString] = fullURL.split('?');

        return {
            url:/.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url ,
            rawQueryString ,
        }

    }

    #addRoute(template , method , handlers) {
        
        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            
            throw new Error(`method ${_method} is not acceptted`);
        }

        if(methodRoutes.has(template) === true) {
            throw new Error (`template ${template} is already in use`) ;
        }

        const routeBundle = this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);

        console.log(`\x1b[33madded route: ${_method} ${routeBundle.originalTemplate}\x1b[0m`);
    }

    #compileRouteBundle (template , handlers) {
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)'
        });

        return {
            keys , 
            originalTemplate:template ,
            handler:handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1 ) : [] , 
            regex:new RegExp(`^${regexTemplate}$`),
        }
    }

    #routes;
    #middleware;

    constructor () {

        this.#routes = new Map();
        this.#middleware = [];

        const acceptedmethods = ['get' , 'post'] ;

        acceptedmethods.forEach(method => {
            const _method = method.toUpperCase();
            this.#routes.set(_method , new Map());
        });
    }
}

module.exports = Router ;