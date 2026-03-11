const { renderMultipartForm } = require("../../_multipart-parser/models/render");
const { FormHandler } = require("../../form-data-server/form-parser.router.entry-point");
const { handlePublic } = require("../../request-handlers/public/handle-public");
const { handleReactApp } = require("../../request-handlers/react/react-handler");
const { handleStatic } = require("../../request-handlers/static/static-handler");
const Router = require("../router");

const router = new Router();

// this first
router.get('/static/*', async (req, res) => await handleStatic(req, res));

router.get('/foo/*/bar', (req, res) => {
    res.end('test');
});

router.get('/foo/bar/*', (req, res) => {
    res.end('test');
});

router.get('/app', async (req, res) => handleReactApp(req , res));
router.get('/api/videos', async (req, res) => {
    
});

router.get('/video/:filename' , async (req  ,res) => {});

router.get('/l/form', renderMultipartForm);

router.post('/api/handle-form', FormHandler.processForm );

router.get('/public/:type/:id', async (req ,res) => await handlePublic(req , res) ) ;

// test route
router.get('/test/:id/foo/:bar' , async (req  , res) => {
    const { method , url , params , queryParams } = req ;
    res.end(JSON.stringify({method , url , params , queryParams }));
});

module.exports = { router }