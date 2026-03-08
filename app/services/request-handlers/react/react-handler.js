const { IncomingMessage, ServerResponse } = require("node:http");
const { readFile } = require("node:fs/promises");
const { resolve, join } = require("node:path");

const REACT_APP_PATH = resolve(join('.', 'public', 'static', 'react.html'));

/**
 * Отдает React приложение
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
async function handleReactApp(req, res) {

    console.log('handle react app');

    try {
        const file = await readFile(REACT_APP_PATH, 'utf-8');
        res.writeHead(200, 'OK', {
            'Content-Type': 'text/html',
        });
        res.end(file);
    } catch (error) {
        console.error('Error serving React app:', error);
        res.writeHead(500);
        res.end('Error loading application');
    }
}

module.exports = { handleReactApp };