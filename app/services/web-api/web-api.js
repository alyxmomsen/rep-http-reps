const { readFile } = require("fs/promises");
const { join } = require("path");
const handleForm = require("../router/utils/handlers/handle-form/handle-form");
const Router = require("../router/router");

const router = new Router();

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