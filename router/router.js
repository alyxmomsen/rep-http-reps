class Router {

    async handleRequest(req , res) {

        const {method , url:fullURLSting} = req ;

        console.log('new request. method: ' , method);

        const methodRoutes = this.#routes.get(method.toUpperCase());

        if(methodRoutes === undefined) {

            console.log(`it is trying to request to not accepted method : ${method.toUpperCase()}`);
            res.end('this method is not provided');
            return;
        }

        const { url } = await this.#splitFullURLSting(fullURLSting);

        for (const [template , routeBundle] of methodRoutes) {


            const match = routeBundle.regex.exec(url);

            if(match === null) continue ;

            const params = await this.compileParams(routeBundle.keys , match.slice(1) , url);

            const queryParams = {};

            req.params = params ;
            req.queryParams = queryParams ;
            await routeBundle.handler(req , res);

            return ;
        }

        res.end('stock response not route (' + url +') response');
    }

    async get (template , ...handlers) {

        this.#addRoute(template , "GET" , handlers);
    }

    async post (template , ...handlers) {

        this.#addRoute(template , "POST" , handlers);
    }

    #acceptedMethods;
    #routes;

    async compileParams (keys , values , url) {

        const params = {};

        keys.forEach((key, i) => {
            
            params[key] = values[i] ;
            
        });
        
        return params ;

    }

    async #splitFullURLSting (fullURLSting) {

        const [urlHalf , qSHalf] = fullURLSting.split('?' , 2);

        return {
            url: /.+\/$/.test(urlHalf) ? urlHalf.replace(/\/$/ , '') : urlHalf , 
            rawQueryString:qSHalf ,
        }
    }

    async #addRoute (template , method , handlers) {

        const givenMethod = method.toUpperCase();

        const methodRoutes = this.#routes.get(givenMethod);

        if(methodRoutes === undefined) {
            console.log(`this method ${givenMethod} is not accepted`);
            return ;
        }

        if(methodRoutes.has(template) === true) {
            console.log(`this template ${template} already defined`);
            return ;
        }

        const routeBundle = await this.#compileRouteBundle(template , handlers);

        methodRoutes.set(template , routeBundle);

        console.log(`added route ${givenMethod} ${template}`);
    }

    async #compileRouteBundle (template , handlers) {

        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {

            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys , 
            regex:new RegExp(`^${regexTemplate}$`),
            handler: handlers[handlers.length - 1] , 
            middleware : handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
        }
    }

    constructor () {

        this.#routes = new Map();

        this.#acceptedMethods = [
            'GET' , 'POST',
        ] ;

        this.#acceptedMethods.forEach(m => {

            const method = m.toUpperCase();

            this.#routes.set(method , new Map());
            console.log(`added accepted method : ${method}`);
        });
    }
}


module.exports = {Router} ;