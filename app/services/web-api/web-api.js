const { readFile } = require("fs/promises");
const { join } = require("path");
const handleForm = require("../router/utils/handlers/handle-form/handle-form");
const Router = require("../router/router");
const processPublicRequest = require("../router/utils/handlers/process-public/process-public-request");
const getMediaFilesMetaData = require("../router/utils/handlers/get-playlist/get-media-data");
const { readFileSync, createReadStream } = require("fs");

const router = new Router();

router.get('/api/video-stream/:id' , (req  , res) => {

    console.log('media content reauest');

    res.writeHead(200 , 'ok' , {
        'content-type':'video/mkv'
    });

    createReadStream(join('.' , 'uploads' , '7777777777777777777.mkv')).pipe(res) ;

    
});

router.post('/api/get-media-data', async (req, res) => {
    
    await getMediaFilesMetaData(req, res);
    
});

router.get('/public/:type/:id', processPublicRequest);

router.get('/test/:id/foo/:bar', async (req , res) => {
    
    const { params, queryParams , url , method } = req;
    
    res.writeHead(200, 'ok', {
        'content-type':'application/json' ,
    });
    res.end(JSON.stringify({method  , url , params , queryParams}));

});

router.post('/api/handle-form' , async (req , res) => {

    await handleForm(req ,res);
});

router.get('/form' , async (req , res) => {

    try {
        const file = await readFile(join('.' , 'assets' , 'html' , 'form.html'));
        res.end(file);
    }
    catch (e) {
        console.log({e});
    }
    
});

module.exports = router ;