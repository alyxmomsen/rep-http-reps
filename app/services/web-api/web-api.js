const Router = require("../router/router");

const router = new Router();

router.get('/test/:id/foo/:bar' , async (req , res) => {

    const { params , queryParams , method , url} = req ;

    res.end(JSON.stringify({params  ,queryParams , method , url}));
});

module.exports = router ;