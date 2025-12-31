const {WebSocketServer} = require ('ws');
const { randomBytes } = require('crypto');
const { fork } = require('child_process');
const { join } = require('path');

const scanner = fork('./forks/filescanner.js')

class WSServer {
    
    #connections;
    #messageHandlers;

    #handleMessage (connection ,data) {

        this.#messageHandlers[data.type][data.name].handler(connection , data.details);

        console.log('message data' , data);
    }
    
    constructor () {

        this.#messageHandlers = {
            order: {
                'scan-dir': {
                    handler: (connection , details) => {

                        const filter = details.filter;

                        scanner.send({
                            path:join('C:','Users','Public','Libraries') ,
                            filter ,
                        });

                        scanner.once('message' , (message) => {

                            console.log({message});

                            connection.send(JSON.stringify({
                                type:'data' ,
                                payload:message.payload ,
                            }));

                        });

                        console.log('handler ' , filter);
                    }
                }
            }
        }
        
        this.#connections = [];
        
        const websocketserver = new WebSocketServer({
            port:3000 ,
            host:'localhost' ,
        });

        websocketserver.addListener('connection' , (ws) => {
    
            ws.addEventListener("message" , (message) => {

                this.#handleMessage(ws , JSON.parse(message.data));
            });

            const newConnection = {
                id:randomBytes(16).toString('hex') ,
                connection:ws ,
            };
            
            this.#connections.push(newConnection) ;
            
            ws.send(JSON.stringify({
                type:'new-connection', 
                payload:newConnection.id ,
            }));
            
            console.log('new connection' , newConnection.id);
            
        });
    }
}

module.exports = WSServer ;

