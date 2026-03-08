const { IncomingMessage, ServerResponse } = require('http');
const path = require('path');
const { readFile } = require('fs/promises');
const { contentTypeRouter } = require('./controller/content-type.router.controller');

const ERROR_PROTOCOL = 'custom_error_protocol';
console.log({dirname:__dirname});
const HTML_FORM_PATH = path.resolve(path.join('.', 'app', 'model', 'assets', 'html', 'form.html'));

const errorManager = new Map();

class FormHandler {
	
	
	
	/** 
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res
	*/
	async processRequest(req, res) {
		const { headers } =  req;
		
		const contentTypeHeader = headers['content-type'];
		
		try {
			if(!contentTypeHeader) {
			    throw new Error(`${ERROR_PROTOCOL}; code: 1; message: no content-type header;`);
            }
			
			const [ contentType , contentTypePayload ] = contentTypeHeader.split(/;[^\S]*/);
		
            await contentTypeRouter.handle(req , res , contentType , contentTypePayload);
		}
		catch(e) {
			console.log({e});
		}
	}
	
	async renderHTML (req, res) {
		try {   
            const file = await readFile(HTML_FORM_PATH , {encoding:'utf-8'});
			res.writeHead(200, 'ok' , {
				"content-type":"text/html",
			});
			res.end(file);
        }
        catch(e) {
            console.log({e});
        }
	}
	
	#errors;
	
	constructor () {
		this.#errors = new Map() ;
	}
}

const formHandler = new FormHandler();

module.exports = { formHandler } ;

function handleError(res, errorMessage) {
	if(!parseErrorMessage.startsWith(ERROR_PROTOCOL_IDENTITY)) {
		console.log(`unknown error protocol`);
	}
} 

function setErrorHandler(errorCode, handler) {
	const codeHandler = errorManager.get(errorCode);
	if(codeHandler) throw new Error(`you repeat error code`);
	errorManager.set(errorCode , handler);
}

setErrorHandler(1 , (err) => {
	const { code , message } = err;
	console.log(`error handler: ${code}`)
});