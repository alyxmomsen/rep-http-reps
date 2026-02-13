const http = require('http');
const { loggerFactory } = require('./utils/logger');
const { router } = require('./app/controller/web-api/web-api');

const log = loggerFactory('index' , '-u');

const httpserver = http.createServer(async (req , res) => {

    router.handleRequest(req , res);
});

const port = 3333 ;
const host = '127.0.0.1' ;

httpserver.listen(port , host , () => {
    log('def' , 'foo bar' , {port ,host});
})