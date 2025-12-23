const http = require('http');
const { Router } = require('./router/router');
const { fork } = require('child_process');
const { join } = require('path');
const { statSync, existsSync, readFileSync } = require('fs');
const { subscribe } = require('diagnostics_channel');

const store = {
    subscribers:[],
    status:0 ,
    data:null ,
    tryexecuteSubscribes () {
        if(this.status > 0) return ;
        this.subscribers.forEach(subscriber => {
            subscriber(this.data)
        });
    } ,
    update(data) {

        this.data = data ;

        this.tryexecuteSubscribes();
        
    } , 
    subscribe(cb) {
        this.subscribers.push(cb)
    } ,
}

const filescannerprocess = fork(join('.' , 'services' , 'ipc-filescanner' , 'file-scanner.js'));

filescannerprocess.on('message' , (message) => {

    if(message.type && message.type === 'order::response' ) {

        store.status = 0 ;

        // store.

        store.update(message.payload);

        console.log({type:message.type , payload:message.payload});
    }
});

const router = new Router();

const server = http.createServer((req , res) => {
    
    router.handleRequest(req , res);
});

router.get('/test/:id/foo/:bar' , async (req , res) => {

    const { method , url } = req ;

    const {params , queryParams} = res ;

    // res.setHeader('content-type' , 'application/json');
    // res.end(JSON.stringify({
    //     method ,
    //     url ,
    //     params , 
    //     queryParams,
    // }));

    await sendOrderParseDir(store);

    store.subscribe((data) => {


        const rawhtml = readFileSync('./index.html' , 'utf-8');

        const content = rawhtml.replace(/\<\%content\%\>/ , data.files.map(elem => `<a href="#">${elem}</a>`).join('<br>'));

        res.end(content);

    });

});

const port = 3333;
const host = '0.0.0.0';

server.listen(port, host , () => {
    console.log({port , host});
});


async function sendOrderParseDir (store) {

    store.status = 1 ;

    filescannerprocess.send({type:'order::parse-directory' , payload : {
        path:join('D:' , 'Documents') ,
    }});

}

async function launchIPC (scriptPath) {
    
    if(existsSync(scriptPath) === false) {
        return
    }
    
    const filescannerProccess = fork(scriptPath);
    
    filescannerProccess.on('message' , (message  , cb) => {
        
        if(message.type && message.type === 'hello') {
            
            console.log(message);
            
            filescannerProccess.send('hello-hello kid it s me you father');
        }
        
        filescannerProccess.send('hello kid');
        
    });
    
}

async function listenSTDIN () {

    process.stdin.on('end' , () => {
        console.log('process data end');
    });
    
    process.stdin.on('data' , (chunk) => {
        
        // console.log('process data chunk: ' , chunk);
    
    });
}
