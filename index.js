const http = require('http');
const { router } = require('./app/services/router/controller/http-controller');

const httpServer = http.createServer( async (req , res) => {
    console.log('new request: ');
    await router.handleRequest(req , res);
});

const port = 3333 ;
const host = 'localhost' ;
httpServer.listen(port, host, () => {
    console.log({port , host});
});
