const http = require('http');
const { Router } = require('./router/router');
const { fork } = require('child_process');
const { join } = require('path');
const { statSync, existsSync, readFileSync } = require('fs');
const { subscribe } = require('diagnostics_channel');
const { createHash } = require('crypto');
const { buffer } = require('stream/consumers');
const { WebSocketServer } = require('ws');

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

const wsserver =  new WebSocketServer({port:8080});

wsserver.on('connection' , (ws) => {

    console.log('new web socket');


    ws.on('message' , async (data) => {

        console.log(JSON.parse(data.toString()));

        store.subscribe((data) => {

            ws.send(JSON.stringify(data));
        });
        
        await sendOrderParseDir(store);




    });



});


// const clients = new Set();

// server.on('upgrade' , async (req , socket) => {

//     console.log('updgrade is on');
//     const key = req.headers['sec-websocket-key'] ;

//     if(!key) {
//         socket.destroy();
//         return ;
//     }

//     console.log('upgrade is continue');

//     const acceptKey = await generateAcceptKey(key);

//     console.log('acceptKey' , acceptKey);

//     socket.write(
//         'HTTP/1.1 101 Switching Protocols\r\n' +
//         'Upgrade: websocket\r\n' +
//         'Connection: Upgrade\r\n' +
//         `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
//         '\r\n'
//     );``

//     clients.add(socket);

//     console.log('socket added');

//     socket.on('data', (buf) => {

//         console.log('buffer' , buf/* .toString("utf-8") */);

//         console.log('new web socket data');

//   });


// });

async function generateAcceptKey (key) {
    '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11' ;
    return createHash('sha1').update(key + GUID).digest("base64");

}

router.get('/' , async (req , res) => {

    const html = readFileSync('./index.html' , 'utf-8');
    res.end(html);
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

        res.end(JSON.stringify(data));

    });

});

const port = 3333;
const host = 'localhost';

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
