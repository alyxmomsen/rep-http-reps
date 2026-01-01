const {WebSocketServer} = require ('ws');
const { randomBytes } = require('crypto');
const { fork } = require('child_process');
const { join } = require('path');

const scanner = fork('./forks/filescanner.js')

class WSServer {
    
    #clinets;
    #messageHandlers;

    #handleMessage (connection , client ,data) {

        this.#messageHandlers[data.type][data.name].handler(connection , client , data.details);

        // console.log('message data' , data);
    }
    
    constructor () {

        this.#messageHandlers = {
            order: {
                'scan-dir': {
                    handler: (wsConnection , client , details) => {

                        const filter = details.filter;

                        scanner.send({
                            path:join('C:','Users','Public','Libraries') ,
                            filter ,
                        });

                        scanner.once('message' , (message) => {

                            // console.log({message});

                            client.data = message.payload ;

                            wsConnection.send(JSON.stringify({
                                type:'result' ,
                                payload:message.payload ,
                            }));

                        });

                        // console.log('handler ' , filter);
                    }
                }
            }
        }
        
        this.#clinets = [];
        
        const websocketserver = new WebSocketServer({
            port:3000 ,
            host:'localhost' ,
        });

        websocketserver.addListener('connection' , (ws) => {
            const newClient = {
                id:randomBytes(16).toString('hex') ,
                connection:ws ,
                data:[] ,
            };
    
            ws.addEventListener("message" , (message) => {

                this.#handleMessage(ws , newClient , JSON.parse(message.data));
            });

            
            this.#clinets.push(newClient) ;
            
            ws.send(JSON.stringify({
                type:'new-connection', 
                payload:newClient.id ,
            }));
            
            console.log('new connection' , newClient.id);
            
        });
    }
}

module.exports = WSServer ;

