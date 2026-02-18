const { ServerResponse } = require("node:http");

class ResponseDecorator {

    // methods like on original ServerResponse
    
    write(chunk) {
        return this.#originalResponse.write(chunk);
    }
    
    end(data) {
        return this.#originalResponse.end(data);
    }
    
    get writable() {
        return this.#originalResponse.writable;
    }
    
    writeHead(...args) {
        return this.#originalResponse.writeHead(...args);
    }
    
    #originalResponse ; 

    // decorate

    addResponseData(key , value) {
        console.log('\x1b[31maddResponseData\x1b[0m' , {key , value});
        this.responseData.payload[key] = value ;
        console.log('\x1b[31maddResponseData\x1b[0m' , this.responseData);
        
    }
    
    sendResponseData (statusCode , statusMessage) {
        console.log('\x1b[31msendResponseData\x1b[0m' , this.responseData);
        this.#originalResponse.writeHead(statusCode , statusMessage , {
            'content-type':'apllication/json' ,
        });
        this.#originalResponse.end(JSON.stringify(this.responseData));
    }

    responseData ;

    constructor (res) {
        if(res instanceof ServerResponse === false ) throw new Error ('given object is not instance of the ServerResponse class') ;
        this.#originalResponse = res; 
        // ---
        this.responseData = {
            payload:{

            } ,
        } ;

    }
}

module.exports = ResponseDecorator ;