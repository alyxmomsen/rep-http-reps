const {} = require('fs');

const handleFormData = require("./handlers/handle-form-data");
const { readFile } = require('fs/promises');
const { join } = require('path');

class Router {

    async handleRequest(req , res) {

        const { method , url:fullURL } = req ;
        
        const _method = method.toUpperCase() ;

        const methodRoutes = this.#routes.get(_method);

        const fallbackresponse = (res , message) => {
            res.end(message);
        }

        if(methodRoutes === undefined) {
            fallbackresponse(req , 'method routes falling');
            return ;
        }

        const { url , rawQueryString } = await this.#splitURL(fullURL);

        for (const [_ , bundle] of methodRoutes) {

            const match = bundle.regex.exec(url);
            if(match === null) continue ;
            
            // extract params
            const params = {};
            bundle.keys.forEach((key , i) => {

                params[key] = match[i + 1];
            });
                        
            req.params = params ;

            const queryParams = await this.#extractQueryParams(rawQueryString);
            req.queryParams = queryParams ;
            // end extract params

            this.#executeMiddleware(req , res , this.#middleware);
            this.#executeMiddleware(req , res , bundle.middleware);

            await bundle.handler(req , res);
            return ;
        }

        res.writeHead(404 , 'not found' , {
            'content-type':'text/plain',
        });
        res.end('not found');
    }

    async get (template , ...handlers) {
        await this.#addRoute(template , "GET" , handlers);
    }

    async post (template , ...handlers) {
        await this.#addRoute(template , "POST" , handlers);
    }

    async use (...handlers) {

        handlers.forEach(handler => {
            this.#middleware.push(handler);
        });
    }

    async #extractQueryParams (rawQueryString) {

        const params = {} ;
        if(rawQueryString === undefined) {
            return params ;
        }

        const couples = rawQueryString.split('&');
        couples.forEach(couple => {

            const [ key , value ] = couple.split('=');
            if(key !== undefined && value !== undefined) {
                params[key.toLowerCase()] = value ;
            }
        });

        return params ;
    }

    async #splitURL (fullURL) {

        const [_url , rawQueryString] = fullURL.split('?');

        const url = /.+\/$/.test(_url) === true ? _url.replace(/\/$/ , '') : _url ; 

        return {
            url ,
            rawQueryString ,
        }

    }

    async #executeMiddleware (req , res , middleware) {
        let counter = 0 ;
        const next = () => {

            const hanlerlike = middleware[counter++];
            if(hanlerlike === undefined) return;
            hanlerlike(req , res , next);

            return ;
        }

        next();
    }

    async #addRoute (template , method , handlers) {

        const _method = method.toUpperCase(); 

        const methodRoutes = this.#routes.get(_method);

        const fallbackmessage = (message) => console.log(`this ${message} is not correct`) ;

        if(methodRoutes === undefined) {

            fallbackmessage(_method);
            return;
        } 

        if(methodRoutes.get(template) === true) {
            fallbackmessage(template);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers) ;

        methodRoutes.set(template , routeBundle);

        console.log(`added route: ` , {routeBundle});

    }

    async #compileRouteBundle (template , handlers) {

        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {

            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys ,
            handler: handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template, 
            regex:new RegExp(`^${regexTemplate}$`), 
        }
    }
    
    #routes;
    #middleware;

    constructor () {

        this.#routes = new Map();
        this.#middleware = [] ;

        const acceptmethods = [
            'GET' , 'POST',
        ] ;

        acceptmethods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}

const router = new Router ();

router.use((req , res , next) => {console.log(`global mw 1`);next();} , (req , res , next) => {console.log(`global mw 1`);});

router.post('/api/handle-form' , async (req , res) => {
    await handleFormData(req , res);
});

router.get('/form' , async (req , res , next) => {
    console.log(`form middleware${''}`);
    next();
} , async (req , res) => {

    try {

        const file = await readFile(join('.' , 'view' , 'form.html'));
        res.end(file);

    }
    catch (e) {
        console.log('fail to load form');
        res.end('fail to load form');
        return;
    }

});

router.get('/test/:id' , async (req , res , next) => {
    console.log(`middleware local${''}`);
    next();
} , async (req , res) => {

    res.end('hello world');
});

module.exports = { router } ;

