const { FormHandler, formHandler } = require("../../request-handlers/form/form-handler");
const Router = require("../router");

const router = new Router();

router.get('/l/form', async (req ,res) => await formHandler.renderer(req , res) );
router.post('/api/handle-form', async (req ,res) => await formHandler.processForm(req , res) );
router.get('/api/handle-form', async (req ,res) => await formHandler.processForm(req , res) );

router.get('/test/:id/foo/:bar' , async (req  , res) => {

    const { method , url , params , queryParams } = req ;

    res.end(JSON.stringify({method , url , params , queryParams }));
});

module.exports = { router }