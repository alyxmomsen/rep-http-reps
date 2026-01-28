require('fs');

class Router {


    async get(template  , ...handlers) {
        this.#addRoute(template , "GET" , handlers);
    }

    async post(template , ...handlers) {
        this.#addRoute(template  ,"POST" , handlers);
    }

    async #addRoute(template , method , handlers) {
        
        const _method = method.toUpperCase();

        const methodRoutes = this.#routes.get(_method);

        if (methodRoutes === undefined) {
            console.log('wrong'.toUpperCase());
            return;
        }

        if (methodRoutes.has(template) === true) {
            console.log('wrong'.toUpperCase());
            return;
        }
        
        const newRouteBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template, newRouteBundle);

        console.log(`congrats route ${_method} ${newRouteBundle.originalTemplate} is added`);

    }

    async #splitURL(fullURL) {
        
        const [url, rawQueryStringLike] = fullURL.split('?');
        
        return {
            url: /.+\/$/.test(url) ? url.replace(/\/$/, '') : url,
            rawQueryStringLike , 
        }
    }

    async #compileRouteBundle(template , handlers) {
        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g, (_, key) => {
            keys.push(key);
            return '([^\/]+)';
        });

        const bundle = {
            handler: handlers[handlers.length - 1],
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            regex:new RegExp(`${regexTemplate}`), 
            originalTemplate:template,
            keys ,
        }

        return bundle;
    }
    
    #routes;
    #middleware;

    constructor() {
        const metods = [
            'get', 'post'
        ];

        this.#routes = new Map();

        metods.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map);
        });

        this.#middleware = [];

    }
}