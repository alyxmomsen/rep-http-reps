const {} = require('fs');
const Router = require('../../services/router/router');

const router = new Router();

router.get('/test/:id/foo/:bar' , async (req , res) => {

    const { method , url , params , queryParams } = req ;

    res.writeHead(200 , 'ok' , {
        'content-type':'application/json' ,
    });
    res.end(JSON.stringify({method , url , params , queryParams}));
});

router.post('/test/:id/foo/:bar' , async (req , res) => {
    const { method , url , params , queryParams } = req ;
    const message = 'hello world' ;
    res.writeHead(200 , 'ok' , {
        'content-type':'application/json' ,
    });
    res.end(JSON.stringify({method , url , params , queryParams}));
});

module.exports = router ;