const http = require('http');
require('dotenv').config();
const router = require('./router/controller/router-controllers');
const storageManager = require('./services/custom-store-manager/custom-storage-manager');
const initStorageManager = require('./services/custom-store-manager/controller/init-storage-manager');

initStorageManager({});

const server = http.createServer((req , res) => {
    router.handleRequest(req , res);
});

const port = 3333;
const host = '127.0.0.1' ;

server.listen(port , host , () => {
    console.log({port , host});
});