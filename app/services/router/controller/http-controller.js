const { renderMultipartForm } = require("../../_multipart-parser/models/render");
const { FormHandler } = require("../../form-data-server/form-parser.router.entry-point");
const { handlePublic } = require("../../request-handlers/public/handle-public");
const { handleReactApp } = require("../../request-handlers/react/react-handler");
const { handleStatic } = require("../../request-handlers/static/static-handler");
const Router = require("../router");

const router = new Router();

/* get static files */
router.get('/static/*', async (req, res) => await handleStatic(req, res));
/* public data route */
router.get('/public/:type/:id', async (req ,res) => await handlePublic(req , res) ) ;

/* react-app view */
router.get('/app', async (req, res) => handleReactApp(req , res));

/* get playlist */
router.get('/api/videos', async (req, res) => {res.end()});
/* get video-stream */
router.get('/video/:filename' , async (req  ,res) => {});

/* view */
router.get('/l/form', renderMultipartForm);

/* обработчик-роутер для всех зарегестрированных form content-type данных   */
router.post('/api/handle-form', FormHandler.processForm );

/* test route for URL params */
router.get('/test/:id/foo/:bar' , async (req  , res) => {
    const { method , url , params , queryParams } = req ;
    res.end(JSON.stringify({method , url , params , queryParams }));
});
/* test route for any tails */
router.get('/foo/bar/*', (req, res) => {
    res.end('test');
});
/* test route for any pathes in the middle of the URL */
router.get('/foo/*/bar', (req, res) => {
    res.end('test');
});

module.exports = { router }