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

    constructor (res) {
        if(res instanceof ServerResponse === false ) throw new Error ('given object is not instance of the ServerResponse class') ;
        this.#originalResponse = res; 

    }
}

module.exports = ResponseDecorator ;