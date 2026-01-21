
const Router = require("../router");

const router = new Router();

router.get('/test/:id/foo/:bar' ,  async (req ,res) => {

    const { method , url , headers , params , queryParams } = req ;

    // const {id , bar} = params ;

    res.writeHead(200 , 'ok' , {
        'content-type':'application/json' ,
    });
    res.end(JSON.stringify({method , url , params  , queryParams}));

});

module.exports = router ;