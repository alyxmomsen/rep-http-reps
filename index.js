const http = require('http');
const dotenv = require('dotenv');
if (!dotenv) {
    console.log(
        `\x1b[31m` + `- ❌ dotenv is not defined`.toUpperCase() + `\x1b[0m`
    );
} else {
    console.log(
        `\x1b[32m` + `- ✅ dotenv is defined`.toUpperCase() + `\x1b[0m`
    );
    dotenv.config();
}

const { router } = require('./app/services/router/controller/http-controller');

const httpServer = http.createServer(async (req, res) => {
    await router.handleRequest(req, res);
});

const port = 3333;
const host = 'localhost';
httpServer.listen(port, host, () => {
    console.log({ port, host });
});
