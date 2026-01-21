const { readFile } = require('fs/promises');
const handleFormData = require("../handlers/handle-form");
const Router = require("../router");
const { join } = require('path');

const router = new Router();

router.post('/api/handle-form' , async (req , res) => {

    await handleFormData(req , res);
});

router.get('/form' , async (req , res) => {

    try {
        const file = await readFile(join('.' , 'view' , 'form.html'));
        res.end(file);
    }   
    catch (e) {
        res.end(JSON.stringify({e}));
    }
});

router.get('/test/:id/foo/:bar' ,  async (req ,res) => {

    const { method , url , headers , params , queryParams } = req ;

    // const {id , bar} = params ;

    res.writeHead(200 , 'ok' , {
        'content-type':'application/json' ,
    });
    res.end(JSON.stringify({method , url , params  , queryParams}));

});

module.exports = router ;