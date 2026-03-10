const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

const ASSETS_PATH = resolve('./assets/html/form.html');

async function renderMultipartForm(req, res) {
    
    console.log('render...');

    try {

        const formHTMLpath = ASSETS_PATH ;
        const file = await readFile(formHTMLpath , 'utf-8');
        res.writeHead(200 , 'ok' , {
            "content-type": 'text/html' ,
        });
        res.end(file);
    }
    catch (e) {
        // здесь нужно сделать редирект 
        console.log({e});
        // res.setHeader("");
        res.writeHead(500 , 'internal error' , {
            "content-type":'text/plain'
        });
        res.end('500. internal error');
    }

}

module.exports = { renderMultipartForm }