const { IncomingMessage, ServerResponse } = require("node:http");

const CONTENT_TYPES = {
	MULTIPART_FORMDATA:'multipart/form-data',
	// MULTIPART_FORMDATA:'',
	// MULTIPART_FORMDATA:'',
}

class FormContentTypeRouter {
	
	/** 
	 * @param {string} contentType
	 * @returns {Promise<{success:Object}|{error:Object}>}
	*/
	async handle (req , res, contentType, payload , targetContentType) {
		const contentTypeHandler = this.#contentTypeRoutes.get(contentType);
		if(!contentTypeHandler) {
			throw new Error(`no handler for this content-type ${contentType}`);
		}
		const { success, error } = await contentTypeHandler(req , res , payload);
		if(error) {
			return {
				error,
			}
		}
		return {
			success,
		}
	}
	
	/** 
	 * @param {string} contentType
	 * @param {(req:IncomingMessage, res:ServerResponse, payload?:string)=>Promise<{success:Object;error:Object}>} handler 
	*/
	addRoute (contentType , handler) {
		
		let isContentTypeValid = false;
		for (const [key, validContentType] of Object.entries(CONTENT_TYPES)) {
			if(validContentType) {
				isContentTypeValid = true ;
				break;
			}
		}
		
		if(this.#contentTypeRoutes.has(contentType)) {
			throw new Error(`this content-type key <${contentType}> is already in use`);
		}
		
		this.#contentTypeRoutes.set(contentType, handler);
		
		console.log(`added new content-type <${contentType}> route handler`);
	}
	
	/**
	 * @type {Map<string,(req:IncomingMessage, res:ServerResponse, payload?:string)=>Promise<{success:Object}|{error:Object}>>}
	 */
	#contentTypeRoutes;
	
	constructor() {
		this.#contentTypeRoutes = new Map();
		
	}
}

module.exports = { FormContentTypeRouter , CONTENT_TYPES }