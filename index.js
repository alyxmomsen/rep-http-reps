const path = require('path');
const http = require('http');
const { router } = require('./app/services/router/controller/web-controller');

const server = http.createServer(async (req , res) => {
    await router.handleRequest(req, res);
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});

/** 
 * @param { http.IncomingMessage } req 
 * @param { http.ServerResponse } res 
 */
function handleRequest (req , res) {
	res.end(JSON.stringify({message:'welcolme to the knight bus'}));
}
