const http = require('http');

const ROUTER_CONSTANTS = {
	METHODS:{
		GET:'GET' ,
		POST:'POST' ,
		PUT:'PUT' ,
		DELETE:'DELETE' ,
	} ,
	RESPONSE_STATUSES:{
		200:{
			MESSAGE:'ok',
			CODE:200,
		}
	}
}

const { METHODS, RESPONSE_STATUSES } = ROUTER_CONSTANTS ;

class Router {
	
	/** 
	* @param { http.IncomingMessage } req
	* @param { http.ServerResponse } res
	*/
	async handleRequest(req, res) {
		
		const { method , url:fullURL } = req;
		
		const methodRoutes = this.#routes.get(method);
		if(!methodRoutes) {
			const { CODE , MESSAGE } = RESPONSE_STATUSES[200] ;
			sendFallback(res, CODE, MESSAGE, `incorrect REST method ${method}`);
			return;
		}
		
		const { url , queryString } = this.#splitURL(fullURL);
		
		for (const [ templateKey , routeBundle ] of methodRoutes.entries()) {
			const { 
                regex:bundleRegex , handler , keys:bundleKeys, middleware:routeMiddleware, 
            } = routeBundle ;
			const urlMatch = bundleRegex.exec(url);
			if(!urlMatch) continue ;
			
			/* compile route params */
			
			const params = {} ;
			bundleKeys.forEach((key, i) => {
				const maskMatchIndex = i + 1;
				params[key] = urlMatch[maskMatchIndex];
			});
			
			const queryParams = this.#extractQueryParams(queryString);
			
			req.params = params;
			req.queryParams = queryParams;
			
			/* end: compile route params */

            this.#executeMiddleware(req, res, this.#middleware);
			this.#executeMiddleware(req, res, routeMiddleware);

			await handler(req, res);
		}
		
		const message = `no mater how many times that you told me you wanted to leave`;
		res.end(JSON.stringify({message}));
	}

    /**
     * 
     * @param {string} template 
     * @param  {...((req:http.IncomingMessage, res:http.IncomingMessage, next?:() => Promise<void>) => Promise<void>)} handlers 
     */
    get (template , ...handlers) {
        this.#addRoute(template , METHODS.GET , handlers);
    }
	
	/**
     * 
     * @param {string} template 
     * @param  {...((req:http.IncomingMessage, res:http.IncomingMessage, next?:() => Promise<void>) => Promise<void>)} handlers 
     */
    post (template , ...handlers) {
        this.#addRoute(template , METHODS.POST , handlers);
    }
	
	/** 
	 * @param {http.IncomingMessage} req
	 * @param {http.ServerResponse} res
	 * @param {((req:http.IncomingMessage, res:http.ServerResponse, next?:()=>Promise<void>)=>Promise<void>)[]} middleware
	 * @returns {Promise<void>}
	*/
	async #executeMiddleware (req, res, middleware) {
		let index = 0;
		const next = async () => {
			const handler = middleware[index++];
			if(!handler) return;
			await handler(req, res, next);
		}
		await next() ;
	}
	
	/** 
	 * @param { ...((req:http.IncomingMessage, res:http.ServerResponse, next:()=>Promise<void>)=>Promise<void>) } middleware
	*/
	useMiddleware (...middleware) {
		middleware.forEach((mw) => {
			this.#middleware.push(mw);
		});
	}
	
	/** 
	 * @param { string } [queryString]
	 * @returns { Object.<string,string> } 
	*/
	#extractQueryParams (queryString) {
		const params = {};
		if(!queryString) return params;
		queryString.split('&')
			.forEach((paramCouple) => {
				const [key, value] = paramCouple.split('=');
				if(key && value) {
					const lowercasedKey = key;
					params[lowercasedKey] = value ;
				}
			});
		return params ;
	}
	
	/** 
	 * @param { string } fullURL
	 * @returns { {url:string;queryString?:string} }
	*/
	#splitURL (fullURL) {
		const [ url , queryString ] = fullURL.split('?');
		return {
			url: /.+\/$/.test(url) ? url.replace(/\/$/ , '') : url,
			queryString,
		}
	}
	
	/** 
	 * @param { string } template
	 * @param { string } method 
	 * @param { ((req:http.IncomingMessage, res:http.ServerResponse, next?:() => Promise<void>) => Promise<void>)[] } handlers
	 *
	*/
	#addRoute (template, method, handlers) {
		const normalizedMethod = method.toUpperCase() ;
		const methodRoutes = this.#routes.get(normalizedMethod);
		if(!methodRoutes) {
			throw new Error(`router; incorrect initial method`);
		}
		
		const routeBundle = this.#compileRouteBundle(template , handlers);
		const { originalTemplate , keys:routeParamsKeys } = routeBundle ;
		methodRoutes.set(originalTemplate , routeBundle);
		
		console.log(`\x1b[33madded new one route: ${normalizedMethod} ${originalTemplate} ${JSON.stringify(routeParamsKeys)}\x1b[0m`);
	}
	
	/** 
	 * @param {string} template 
	 * @param {((req:http.IncomingMessage, res:http.ServerResponse, next?:() => Promise<void>) => Promise<void>)[]} handlers 
	*/
	#compileRouteBundle (template , handlers) {
		
		const keys = [] ;
		const regexTemplate = template.replace(/:([^\/]+)/g , (_fullmatch, maskmatch) => {
			keys.push(maskmatch);
			return '([^\/]+)';
		});
		
		return {
			keys,
			regex: new RegExp(`^${regexTemplate}$`),
			handler: handlers[handlers.length - 1],
			middleware: handlers.length > 1 ? handlers.slice(0, -1) : [],
			originalTemplate: template,
		}
	}
	
	#routes;
	#middleware;
	
	constructor () {
		this.#routes = new Map();
		this.#middleware = [] ;
		
		for (const [ key , methodName ] of Object.entries(METHODS)) {
			this.#routes.set(methodName , new Map());
		}
		
		console.log(`\x1b[38;2;255;0;255mRouter is instanced\x1b[0m` , this.#routes);
	}
}

module.exports = { Router } ;

function sendFallback (res, statusCode, statusMessage, message) {
	
	res.writeHead(statusCode , statusMessage , {
		'content-type':"application/json" ,
	});
	res.end(JSON.stringify({
		message,
	}));
}