const { readFile } = require("fs/promises");
const handleVideoStream = require("./handers/handle-video-stream");
const serveAsset = require("./handers/serve-asset");
const handleForm = require("./handers/handle-form");
const VideoManager = require("../services/video-manager");

const v3oM5r = new VideoManager();

class Router {

    async handleRequest(req , res) {
        
        const { method , headers , url:fullURLString } = req; 

        const methodRoutes = this.#routes.get(method);

        if (methodRoutes === undefined) {
            console.log();
            res.end('this method' + method +' is not accepted');
            return;
        }

        const { url , queryStringLike } = this.#splitURL(fullURLString);

        for (const [_ , routeBundle] of methodRoutes) {

            const urlmatch = routeBundle.regex.exec(url);
            if (urlmatch === null) continue;

            const params = {};
            routeBundle.keys.forEach((key , i) => {
                params[key] = urlmatch[i + 1];
            });

            req.params = params;
            req.queryParams = this.#extractQueryParams(queryStringLike);

            await this.#executeMiddleware(req , res , this.#middleware);
            await this.#executeMiddleware(req , res , routeBundle.middleware);

            await routeBundle.handler(req, res);
            return;
        }

    }

    use(...middleware) {
        
        middleware.forEach(mw => {

            this.#middleware.push(mw);
        });
    }

    get(template , ...handlers) {
        this.#addRoute(template , 'GET' , handlers);
    }

    post(template , ...handlers) {
        this.#addRoute(template , 'POST' , handlers);
    }

    async #executeMiddleware(req,  res , middleware) {
        
        let counter = 0;
        const next = () => {

            const handlerlike = middleware[counter++];

            if (handlerlike === undefined) return;

            handlerlike(req, res, next);
        }

        next();

    }

    #extractQueryParams(queryStringLike) {
        
        const params = {};

        if (queryStringLike === undefined) {
            return params;
        }

        const couples = queryStringLike.split('&');
        
        couples.forEach(couple => {

            const [key , value] = couple.split('=');
            if (key !== undefined && value !== undefined) {
                params[key.toLowerCase()] = value;
            }
        });

        return params;

    }

    #splitURL(fullURLString) {

        const [rawURL , queryStringLike] = fullURLString.split('?');

        return {
            url: /.+\/$/.test(rawURL) ? rawURL.replace(/\/$/ , '') : rawURL,
            queryStringLike ,
        };
    }   

    #addRoute(template ,method , handlers) {
        
        const _method = method.toUpperCase();

        const mehodRoutes = this.#routes.get(_method);

        if (mehodRoutes === undefined) {
            console.log(`method is not accepted`);
            return;
        }

        if (mehodRoutes.has(template) === true) {
            console.log(`this template ${template} is already exists`);
            return;
        }

        const routeBundle = this.#compileBundle(template , handlers);

        mehodRoutes.set(routeBundle.originalTemplate , routeBundle);
        console.log('added route' + ' ' + _method + ' ' + routeBundle.originalTemplate);
    }

    #compileBundle(template , handlers) {
        const keys = [];
        const regexTemplate = template.replace(/:([^\/]+)/g, (_ , key) => {
            keys.push(key);
            return '([^\/]+)'
        });

        return {
            regex: new RegExp(`^${regexTemplate}$`),
            handler: handlers[handlers.length - 1], 
            middleware: handlers.length > 1 ? handlers.slice(0, -1) : [],
            originalTemplate:template,
            keys ,
        }
    }

    #routes;
    #middleware;

    constructor() {
        this.#middleware = [];
        this.#routes = new Map();

        const accepted = ['get', 'post'];
        
        accepted.forEach(m => {
            const method = m.toUpperCase();
            this.#routes.set(method , new Map());
        });
    }
}

const router = new Router();

module.exports = router;


router.get('/public/asset/:type/:id', async (req, res) => {

    serveAsset(req, res);
});

router.get('/', (req, res , next) => {
    console.log('middleware');
    next();
}, async (req, res) => {
    
    const { params , queryParams , url , method } = req;

    res.end(JSON.stringify({url ,method , params , queryParams}));
});

router.get('/test/:id/foo/:bar', (req, res , next) => {
    console.log('middleware');
    next();
}, async (req, res) => {
    
    const { params , queryParams , url , method } = req;

    res.end(JSON.stringify({url ,method , params , queryParams}));
});

router.get('/api/video', async (req , res , next) => {

    const videoItem = await v3oM5r.getRanddom();

    console.log('global middle' , videoItem);

    const videopath = videoItem.path;

    req.local = {
        videopath ,
    };

    next();

} , async (req , res) => {
    await handleVideoStream(req , res);
});

router.get('/video', async (req,  res) => {
   
    try {
        const html = await readFile('./view/video.html');
        res.end(html);
    }
    catch (e) {
        res.end('internal error');
    }
});

router.post('/api/handle-form', async (req , res) => {
    handleForm(req ,res);
});

router.get('/form', async (req , res) => {
    
    try {
        const html = await readFile('./view/form.html');
        res.end(html);
    }
    catch (e) {
        res.end('smth went wrong');
    }
});
