const Router = require("../router/router");
const { join } = require("node:path");
const { resourceLimits } = require("node:worker_threads");
const processPublicFile = require("../../utils/public-files-manage/public-files-manager");
const { readFile } = require("node:fs/promises");
const handleForm = require("./services/handlers/handle-form/handle-form");

const router = new Router();

router.post('/api/handle-form' , async (req , res) => {
    handleForm(req , res);
});


router.get('/form' , async (req , res) => {

    try {
        const file = await readFile(join('.' , 'app' , 'assets' , 'html' , 'form.html'));
        res.writeHead(200);
        res.end(file);
    }
    catch (e) {
        res.writeHead(500);
        res.end();
    }
});

router.get('/public/:type/:id' , processPublicFile);

router.get('/test/:id/foo/:bar' , async (req , res) => {

    const { params , queryParams , method , url} = req ;

    res.end(JSON.stringify({params  ,queryParams , method , url}));
});

module.exports = router ;