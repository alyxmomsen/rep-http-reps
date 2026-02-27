const http = require('http');
const { router } = require('./app/services/router/controller/web-controller');

const httpserver = http.createServer(async (req , res) => {
    await router.handleRequest(req , res);
});

const port = 3333 ;
const host = 'localhost';
httpserver.listen(port , host  , () => {
    console.log({port , host});
});