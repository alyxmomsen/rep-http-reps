const { IncomingMessage, ServerResponse } = require("node:http");
const { readFile } = require("node:fs/promises");
const { resolve, join, extname } = require("node:path");

const PUBLIC_DIR = resolve(join('.', 'public' , 'static'));

const MIME_TYPES = {
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.txt': 'text/plain',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

/**
 * Универсальный обработчик статических файлов
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
async function handleStatic(req, res) {
    try {
        // Получаем путь из URL (всё после /static/)
        const filePath = req.url.replace(/^\/static/, '');
        
        // Защита от path traversal атак
        const normalizedPath = filePath.replace(/\.\.\//g, '');
        const fullPath = join(PUBLIC_DIR, normalizedPath);

        console.log({fullPath});
        
        // Проверяем, что путь ведёт в public директорию
        if (!fullPath.startsWith(PUBLIC_DIR)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        // Определяем MIME тип по расширению
        const ext = extname(fullPath);
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        // Читаем и отдаём файл
        const file = await readFile(fullPath);
        
        res.writeHead(200, 'OK', {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000' // кэширование на год
        });
        res.end(file);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
        } else {
            console.error('Static handler error:', error);
            res.writeHead(500);
            res.end('Internal server error');
        }
    }
}

module.exports = { handleStatic };