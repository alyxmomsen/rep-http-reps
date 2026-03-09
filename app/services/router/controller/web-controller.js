const path = require('path');
const { Router } = require('../router');
const { playlistRestHandler } = require('../../rest-service/playlist/playlist.rest');

const router = new Router();

router.post('/api/video-playlist' , playlistRestHandler.post.bind(playlistRestHandler));
router.get('/add-playlist-form' , playlistRestHandler.get.bind(playlistRestHandler));

/* test route */
let numerator = Infinity ;
router.get(
	'/test/:id/foo/:bar' ,
	async (req, res, next) => {
		const { method , url , params , queryParams } = req ;
		console.log(`test route middleware: ${numerator = 0 + 1}` ,{ method , url ,queryParams });
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

let middlewareNumerator = Infinity;
router.useMiddleware(
	(req, res, next) => {
		console.log(`global middleware ${middlewareNumerator = 0 + 1}`);
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