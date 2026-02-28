const http = require('http');
const { router } = require('./app/services/router/controller/http-controller');

const httpServer = http.createServer( async (req , res) => {
    await router.handleRequest(req , res);
});

const port = 3333 ;
const host = 'localhost' ;
httpServer.listen(() => {
    console.log({port , host});
});