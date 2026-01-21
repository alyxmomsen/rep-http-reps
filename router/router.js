class Router {

    async handleRequest(req , res){

        const { method , url:fullURL} = req ;

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            sendFallBack(res ,403 , 'forbidden' , `method ${_method} is not accepted`);
            return ;
        }

        const {url , rawQueryStrintg} = await this.#splitURL(fullURL);

        for (const [routeBundleOriginalTemplate , routebundle ] of methodRoutes) {

            const urlmatch = routebundle.regex.exec(url);
            if(urlmatch === null) continue ;

            // --------------- compile params -----------------//

            const params = {};
            routebundle.keys.forEach((key , i) => {
                params[key] = urlmatch[i + 1] ;
            });

            req.params = params ;
            req.queryParams = await this.#extractQueryParams(rawQueryStrintg);

            // --------------- compile params -----------------//

            await this.#executeMiddleware(req , res , [
                ...this.#middleware , 
                ...routebundle.middleware
            ]);

            await routebundle.handler(req , res);
            return ;
        }

        async function sendFallBack (res , statusCode , statusMessage = '' ,  message = '') {
            
            res.writeHead(
                statusCode ,
                statusMessage ,
                {
                    'content-type':'text/plain' ,
                }
            );
            res.end(message);
        }
    }

    async use (...handlers) {

        handlers.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    async get (template , ...handlers) {
        await this.#addRoute(template , 'GET' , handlers);
    }

    async post(template , ...handlers) {
        await this.#addRoute(template , 'POST' , handlers);
    }

    async #executeMiddleware (req , res , middleware) {
        let counter = 0 ;
        const next = async () => {

            const middlerwareLike = middleware[counter++]
            if(middlerwareLike === undefined) return ;
            await middlerwareLike(req , res , next) ;
        }

        await next();
    }

    async #extractQueryParams (rawQueryStrintg) {

        const params = {} ;
        if(rawQueryStrintg === undefined) return params ;

        const couples = rawQueryStrintg.split('&');
        couples.forEach(couple => {

            const [key , value] = couple.split('=');
            if(key !== undefined && value !== undefined) {
                params[key.toLowerCase()] = value ;
            }
        });

        return params ;
    }

    async #addRoute (template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        const fallBackLog = (message) => {
            console.log(`fall back: ${message}`);
        }

        if(methodRoutes === undefined) {
            fallBackLog(`this method ${_method} is not accepted`);
            return ;
        }

        if(methodRoutes.has(template) === true) {
            fallBackLog(`that template ${template} is alredy in use`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(routeBundle.originalTemplate , routeBundle);

        console.log(`route ${_method} ${routeBundle.originalTemplate} added. Congrats !!!`);

    }

    async #splitURL (fullURL) {

        const [_url , rawQueryStrintg] = fullURL.split('?');

        return {
            url: /\.+\/$/.test(_url) ? _url.replace(/\/$/ , '') : _url  ,
            rawQueryStrintg ,
        }
    }

    async #compileRouteBundle (template , handlers) {
        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (fullmatch , keymatch) => {

            keys.push(keymatch);
            return '([^\/]+)' ;
        });

        const bundle = {
            keys ,
            handler:handlers[handlers.length - 1],
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex: new RegExp(`^${regexTemplate}$`) ,
            originalTemplate:template ,
        }

        return bundle ;

    }

    #routes;
    #middleware;
    constructor () {
        const acceptedMethods = [
            'GET' , 'POST'
        ];
        this.#routes = new Map();
        this.#middleware = [] ;
        
        acceptedMethods.forEach(m => {
            const _method = m.toUpperCase();
            this.#routes.set(_method , new Map());
        });
    }
}

module.exports = Router;

