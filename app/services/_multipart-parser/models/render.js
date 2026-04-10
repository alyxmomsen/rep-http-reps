const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');

/* абсолютный путь для чтения файла */
const FORM_TEMPLATE_PATH = resolve('./assets/html/form.html');

async function renderMultipartForm(req, res) {
    console.log('render...');

    try {
        const formTemplatePath = FORM_TEMPLATE_PATH;
        const template = await readFile(formTemplatePath, 'utf-8');

        /*
         * здесь будет обработка темплейта
         */

        res.writeHead(200, 'ok', {
            'content-type': 'text/html',
        });
        res.end(template);
    } catch (e) {
        // здесь нужно сделать редирект
        console.log({ e });
        // res.setHeader("");
        res.writeHead(500, 'internal error', {
            'content-type': 'text/plain',
        });
        res.end('500. internal error');
    }
}

module.exports = { renderMultipartForm };
