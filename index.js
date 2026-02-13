const http = require('http');

const httpserver = http.createServer((req , res) => {

    res.end('default response');
});

// const