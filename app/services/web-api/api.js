const Router = require("../router/router");
const { join } = require("node:path");
const processAssetRequest = require("../request-handlers/process-asset-request/process-asset-request");
const processPublic = require("../request-handlers/process-public-asset/process-public");
const handleForm = require("../request-handlers/handle-form/handle-form");

const router = new Router ;

router.get('/public/:type/:id' , async (req ,res) => {
    processPublic(req , res);
});

router.post('/api/handle-form' , async (req , res) => {
    await handleForm(req , res);
});

router.get('/form' , async (req , res) => {

    processAssetRequest(req ,res , join('html' , 'form.html'));
});

router.get('/test/:id/foo/:bar' , async (req , res) => {
    const { method , url , params , queryParams} = req;
    res.end(JSON.stringify({method , url , params , queryParams }));
});


module.exports = router ;