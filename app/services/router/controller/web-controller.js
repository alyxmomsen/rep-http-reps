const path = require('path');
const { Router } = require('../router');
const { formHandler } = require('../../route-end-point-handlers/form-handler/form-handler');

const router = new Router();

router.get('/page/form',  formHandler.renderHTML.bind(formHandler));
router.post('/api/handle-form' , formHandler.processRequest.bind(formHandler));

/* test route */
let numerator = 0 ;
router.get(
	'/test/:id/foo/:bar' ,
	async (req, res, next) => {
		const { method , url , params , queryParams } = req ;
		console.log(`test route middleware: ${++numerator}` ,{ method , url ,queryParams });
        next();
	},
	async (req, res, next) => {
		const { method , url , params , queryParams } = req ;
		console.log(`test route middleware: ${++numerator}` ,{ method, url, params, queryParams });
		next();
	},
	async (req, res, next) => {
		const { method , url , params , queryParams } = req ;
		console.log(`test route middleware: ${++numerator}` ,{ method, url, params, queryParams });
		next();
	},
	async (req, res) => {
		const { method , url , params , queryParams } = req ;
		res.end(JSON.stringify({message:'test route' , method, url, params, params, queryParams}));
	}
);

let middlewareNumerator = 0;
router.useMiddleware(
	(req, res, next) => {
		console.log(`global middleware ${++middlewareNumerator}`);
		next();
	},
	(req, res, next) => {
		console.log(`global middleware ${++middlewareNumerator}`);
		next();
	},
	(req, res, next) => {
		console.log(`global middleware ${++middlewareNumerator}`);
		next();
	},
);

module.exports = { router } ;