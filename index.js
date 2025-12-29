const http = require('http');
const { Router } = require('./router/router');

const router = new Router();

const server = http.createServer((req , res) => {


    router.handleRequest(req , res);

});

router.use(
    (req ,res , next) => {
        console.log('glob middleware 1');
        next();
    } ,
    (req ,res , next) => {
        console.log('glob middleware 2');
        // next();
    } ,
    (req ,res , next) => {
        console.log('glob middleware 3');
        next();
    } ,
    (req ,res , next) => {
        console.log('glob middleware 4');
        next();
    } ,
);

router.get('/' , async (req , res) => {

    const {method , url , params , queryParams} = req ;

    res.end(JSON.stringify({
        method , url , params , queryParams
    }));
});

router.get(
    '/test/:foo/smth/:bar' , 
    async (req ,res , next) => {
        console.log('local middle ware 1');
        next();
    } , 
    async (req ,res , next) => {
        console.log('local middle ware 2');
        // next();
    } , 
    async (req ,res , next) => {
        console.log('local middle ware 3');
        next();
    } , 
    async (req ,res , next) => {
        console.log('local middle ware 4');
        next();
    } , 
    
    async (req , res) => {

    const {method , url , params , queryParams} = req ;

    res.end(JSON.stringify({
        method , url , params , queryParams
    }));
});

router.post('/post' , (req , res) => {
    res.end('default post resolve');
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});