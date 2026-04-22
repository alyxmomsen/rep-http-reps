
const http = require ('http');
const { router } = require('./services/router/controller/router.controller');



const httpServer = http.createServer(async (req, res) => {

    await router.handleRequest(req, res);  

});

httpServer.listen(3333, '0.0.0.0' , () => {

    console.log('hello bro');

});
