
const CONTENT_TYPES = {
	MULTIPART_FORMDATA:'multipart/form-data',
	// MULTIPART_FORMDATA:'',
	// MULTIPART_FORMDATA:'',
}

class FormContentTypeRouter {
	
	/** 
	 * @param {string} contentType
	*/
	async handle (req , res, contentType, payload) {
		const contentTypeHandler = this.#contentTypeRoutes.get(contentType);
		if(!contentTypeHandler) {
			throw new Error(`no handler for this content-type ${contentType}`);
		}
		await contentTypeHandler(req , res , payload);
	}
	
	/** 
	 * @param {string} contentType
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
	
	#contentTypeRoutes;
	
	constructor() {
		this.#contentTypeRoutes = new Map();
		
	}
}

module.exports = { FormContentTypeRouter , CONTENT_TYPES }