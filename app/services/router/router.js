const { IncomingMessage, ServerResponse } = require("node:http");
const { errorFactory, sendFallBack } = require("../../utils/error-factory");

const ROUTER_CONTSTANTS = {
    METHODS:{
        KEYS:{
            GET:'GET' ,
            POST:'POST' ,
            PUT:'PUT' ,
            DELETE:'DELETE' ,
        }
    }
}

class Router {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handleRequest(req, res) {
        try {
            const { method, url: rawURL } = req;
            const methodRoutes = this.#routes.get(method);

            if (!methodRoutes) {
                sendFallBack(res, 400, '::handleRequest', 'incorrect HTTP method', {method});
                return;
            }

            const { url, queryString } = this.#splitURL(rawURL);

            for (const [_, routeBundle] of methodRoutes.entries()) {
                const urlMatch = routeBundle.regex.exec(url);

                if (!urlMatch) continue;

                // Парсим параметры
                const params = {};
                routeBundle.keys.forEach((key, i) => {
                    params[key] = urlMatch[i + 1];
                });

                req.params = params;
                req.queryParams = this.#extractQueryParams(queryString);

                // Собираем все middleware (глобальные + роутовые)
                const allMiddleware = [...this.#middleware, ...routeBundle.middleware];

                // Запускаем цепочку middleware и передаём handler
                await this.#executeMiddleware(
                    req, 
                    res, 
                    allMiddleware, 
                    routeBundle.handler
                );

                return; // Выходим, handler уже вызван внутри #executeMiddleware
            }

            // Маршрут не найден
            if (!res.headersSent) {
                res.writeHead(404);
                res.end('not found');
            }

        } catch (err) {
            console.error('❌ Router error:', err);
            
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Internal Server Error',
                    message: err.message
                }));
            }
        }
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:((payload:any) => Promise<void>), payload?:any) => Promise<void>)} handlers 
     */
    get(template , ...handlers) {
        const { KEYS } = ROUTER_CONTSTANTS.METHODS ;
        this.#addRoute(template , KEYS.GET , handlers);
    }

    /**
     * 
     * @param {string} template 
     * @param  {...((req:IncomingMessage , res:ServerResponse , next?:((payload:any) => Promise<void>)) => Promise<void>), payload?:any} handlers 
     */
    post(template , ...handlers) {
        const { KEYS } = ROUTER_CONTSTANTS.METHODS ;
        this.#addRoute(template , KEYS.POST , handlers);
    }

    /**
     * @param {...((req:IncomingMessage,res:ServerResponse,next?:() => Promise<void>) => Promise<void>)} middleware 
     */
    useMiddleware (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {((req:IncomingMessage,res:ServerResponse,next?:(payload:any) => Promise<void>) => Promise<void>)[]} middleware 
     */
    async #executeMiddleware(req, res, middleware, finalHandler, payload) {
        let index = 0;
        
        const next = async (nextPayload) => {
            if (res.headersSent) return;
            
            if (index < middleware.length) {
                const currentIndex = index++;
                const handler = middleware[currentIndex];
                
                if (handler) {
                    try {
                        await handler(req, res, next, nextPayload);
                    } catch (error) {
                        throw error;
                    }
                }
            } else {
                // Все middleware выполнены — вызываем финальный обработчик
                if (finalHandler) {
                    await finalHandler(req, res);
                }
            }
        };
        
        if (middleware.length > 0) {
            await next(payload);
        } else if (finalHandler) {
            // Если middleware нет, вызываем сразу
            await finalHandler(req, res);
        }
        
        return { chainBroken: false }; // всегда false, потому что мы вызываем handler
    }

    /**
     * 
     * @param {string|null} [queryString] 
     */
    #extractQueryParams (queryString) {
        const params = {} ;
        if(!queryString) {
            return params ;
        }

        queryString.split('&').forEach((couple) => {
            const [ key , value ] = couple.split('=');
            if(key && value) {
                const normalizedKey = key.toLowerCase() ;
                params[normalizedKey] = value ;
            }
        });

        return params ;
    }

    /**
     * 
     * @param {string} rawURL 
     */
    #splitURL (rawURL) {
        const [ url , queryString ] = rawURL.split('?');
        return {
            url:(/^.+\/$/.test(url) && url.replace(/\/$/ , '')) || url ,
            queryString:queryString || null ,
        }
    }

    /**
     * 
     * @param {string} template 
     * @param {string} method 
     * @param {(((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>))[]} handlers 
     */
    #addRoute (template , method , handlers) {

        const normalizedMethod = method.toUpperCase();

        const methodRoutes = this.#routes.get(normalizedMethod);

        if(!methodRoutes) {
            throw new Error(
                JSON.stringify(
                    errorFactory(
                        'Router::#addRoute',
                        'incorrect method',
                        {normalizedMethod , methodRoutes},
                    )
                )
            );
        }

        const routeBundle = this.#assembleRouteBundle(template , handlers);

        const { originalTemplate } = routeBundle ;

        methodRoutes.set(originalTemplate , routeBundle);
        console.log(`\x1b[38;2;255;0;255madded route: ${normalizedMethod} ${originalTemplate}\x1b[0m`);
    }

    /**
     * 
     * @param {string} template 
     * @param {(((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>))[]} handlers 
     * @returns {{
     *  keys:string[];
     *  handler:(req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>;
     *  middleware:((req:IncomingMessage , res:ServerResponse , next?:(() => Promise<void>)) => Promise<void>)[];
     *  regexTemplate:RegExp;
     *  originalTemplate:string;
     * }}
     */
    #assembleRouteBundle (template , handlers) {
        const keys = [];
          
        let regexTemplate = template.replace(/\*/g, '.*');
        // let regexTemplate = template.replace(/\*/g, '[^\/]+');
        
        regexTemplate = regexTemplate.replace(/:([^\/]+)/g , (_  , key) => {
            keys.push(key);
            return '([^\/]+)' ;
        });

        return {
            keys , 
            regex:new RegExp(`^${regexTemplate}$`) , 
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] , 
            originalTemplate:template , 
        }
    }

    #routes ;
    #middleware ; 

    constructor () {

        const { KEYS } = ROUTER_CONTSTANTS.METHODS ;

        this.#routes = new Map();

        for (const [_ , method] of Object.entries(KEYS)) {
            this.#routes.set(method , new Map());
        }

        this.#middleware = [] ;

    }
}

module.exports = Router;