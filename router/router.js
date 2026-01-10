
class Router {

    async handleRequest (req , res) {

        const { method , url:fullURL } = req; 

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {
            res.writeHead(403 , 'forbidden' , {
               'content-type':'text/plain' , 
            });
            console.log('has not the method ad accepted');
            res.end(`forbidden route by method ${_method}`);
        }

        const { url , queryString } = await this.#splitURL(fullURL) ;

        for (const [ template , routeBundle ] of methodRoutes) {

            const match = routeBundle.regex.exec(url);
            if(match === null) continue ;

            routeBundle.handler(req , res);
            return ;
        }

        res.end('default response');
        return ;
    }

    async get (template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    async post (template , ...handlers) {
        this.#addRoute(template , 'POST' , handlers);
    }

    async #splitURL (fullURL) {

        const [urlHalf , queryStringHalf ] = fullURL.split('?');

        return {
            url: /.+\/$/.test(urlHalf) ? urlHalf.replace(/\/$/ , '') : urlHalf , 
            queryString:queryStringHalf ,
        }
    }

    async #addRoute (template , method , handlers) {

        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if(methodRoutes === undefined) {

            console.log(`this method is not accepted`);
            return ;
        }

        if (methodRoutes.has(template) === true) {
            console.log(`template allredy exist`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set((routeBundle).originalTemplate , routeBundle);

        console.log(`route ${_method} ${routeBundle.originalTemplate} is added`);

    }

    async #compileRouteBundle (template , handlers) {

        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {
            keys.push(key);
            return '([^\/]+)'
        });

        const bundle = {
            keys , 
            handler:handlers[handlers.length - 1] , 
            regex:new RegExp(`^${regexTemplate}$`) , 
            middleware: handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
        };

        return bundle ;
    }

    #routes ;
    #middleware ;
    #acceptedMethods ;

    constructor () {
        
        this.#routes = new Map();
        this.#middleware = [] ;
        this.#acceptedMethods = [] ;

        const acceptedMethods = [
            'get' , 'post'
        ];

        acceptedMethods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}


module.exports = Router ;