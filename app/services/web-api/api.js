const { readFile } = require("fs/promises");
const Router = require("../router/router");
const { join } = require("path");
const publicHandler = require("../request-handlers/public-handler/public-handler");
const formhandler = require("../request-handlers/form-handler/form-handler");
const handleUpdatePlaylist = require("../request-handlers/update-playlist/update-playlist");
const getVideoStreamById = require("../request-handlers/get-video-stream-by-id/get-video-by-id");

const router = new Router() ;

router.post('/api/handle-form' , async (req , res) => {
    formhandler(req , res);
});

router.get('/public/:type/:id' , async (req, res) => {
    publicHandler(req , res);
});

router.get('/api/get-video-stream-by-id/:id' , async (req , res) =>{
    getVideoStreamById(req ,res);
});

router.get('/api/update-playlist' , async (req ,res) => {
    handleUpdatePlaylist(req, res);
});

router.get('/video-stream' , async (req , res) => {
    try {
        const file = await readFile(join('.' , 'app' , 'src' , 'assets' , 'html' , 'video-stream.html'));
        res.end(file);
    }
    catch(e) {
        console.log({e});
    }
});

router.get('/form' , async (req , res) => {
    
    try {
        const file = await readFile(join('.' , 'app' , 'src' , 'assets' , 'html' , 'form.html'));
        res.end(file);
    }
    catch(e) {
        console.log({e});
    }
} );

router.get('/test/:id/foo/:bar' , (req ,res) => {

    const { params , queryParams , method , url } = req; 
    res.end(JSON.stringify({ params , queryParams , method , url }));
});

module.exports = router ;