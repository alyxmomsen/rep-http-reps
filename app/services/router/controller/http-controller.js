const Router = require("../router");

const router = new Router();

router.get('/test/:id/foo/:bar' , async (req  , res) => {

    const { method , url , params , queryParams } = req ;

    res.end(JSON.stringify({method , url , params , queryParams }));
});

module.exports = { router }