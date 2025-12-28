
class Router {

    async handleRequest(req , res) {

        const { method , url: rawUrl } = req ;
        
        const {url , rawURLQueryString } = await this.#splitURL(rawUrl);

        console.log({url , rawUrl , rawURLQueryString});

        const methodRoutes = this.#routes.get(method.toUpperCase());

        if(methodRoutes === undefined) {

            res.writeHead(404 , 'not found');
            console.log('method is not defined');
            res.end('not found'.toUpperCase());
            return;
        }
        
        for (const [ template , bundle] of methodRoutes) {

            // console.log('method route couple' , template , bundle);

            console.log('test' ,bundle.regex , bundle);

            const match = bundle.regex.exec(url);

            if(match === null) continue ;

            const queryParams = await this.#parseQueryParams(rawURLQueryString);
            
            const params = {};
    
            res.params = params ;
            res.queryParams = queryParams ;

            bundle.handler(req , res);
            
            return;
        }

        res.writeHead(404 , 'not found');
        console.log('template is not added'.toUpperCase());
        res.end('not found');
        return;
    }

    async get (template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    async post (template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    #routes ;

    async #parseQueryParams (rawURLQueryString) {

        const params = {};

        if(rawURLQueryString === undefined) return params ;

        rawURLQueryString.split('&').forEach((couple , i) => {

            console.log(couple)

            const [key , value] = couple.split('=');

            if(key !== undefined && value !== undefined) {

                params[key.toLowerCase()] = value ;
            }

        });

        return params ;
    }

    async #splitURL(rawURL) {

        const [left , right] = rawURL.split(`?`);

        const url = /.+\/$/.test(left) === true ? left.replace(/\/$/ , '') : left ;
        const rawURLQueryString = right ; 

        return {
            url , 
            rawURLQueryString ,
        }
    }

    async #addRoute (template , method , handlers) {

        const methodRoutes = this.#routes.get(method.toUpperCase());

        if(methodRoutes === undefined) {

            console.log(`this method < ${method} > is not accepted`);
            
            return ;
        }
        
        if(methodRoutes.has(template) === true) {
        
            console.log(`this template < ${template} > alredy is exist`);
            return ;
        }

        const routeBundle  = await this.#compileBundle(template , handlers)

        methodRoutes.set(template , routeBundle);

        console.log(`congratulations route ${method.toUpperCase()} ${routeBundle.originalTemplate} added`);

    }

    async #compileBundle (template , handlers) {

        const keys = [] ;
        const regexTemplate = template.replace(/:([^\/]+)/g , (_ , key) => {

            keys.push(key);
            return '([^\/]+)';
        });

        return {
            keys , 
            regex: new RegExp(`^${regexTemplate}$`) ,
            handler: handlers[handlers.length - 1] ,
            middleware: handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            originalTemplate:template ,
        }

    }

    constructor () {

        this.#routes = new Map();

        const acceptedMethods = [
            'get' , 'post'
        ];

        acceptedMethods.forEach(m => {

            this.#routes.set(m.toUpperCase() , new Map);

        });

    }
}


module.exports = {Router} ;