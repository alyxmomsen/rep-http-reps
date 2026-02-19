const { ServerResponse } = require("http");

class ResponseDecorator {

    // overwrite

    writeHead (...value) {
        return this.#originalResponse.writeHead(...value);
    }

    end(data) {
        return this.#originalResponse.end(data);
    }

    get writable () {
        return this.#originalResponse.writable ;
    }

    write (chunk) {
        return this.#originalResponse.write(chunk);
    }

    #originalResponse;


    // current

    addPayloadValue (key  ,value) {
        this.#responseData.payload = { 
            ...this.#responseData.payload ,
            [key]:value
        } ;

        console.log({responseData:this.#responseData});
    }

    getPayload () {
        return this.#responseData.payload ;
    }

    // updatePayloadValue (key , value) {
    //     this.#responseData.payload = {
    //         ...this.#responseData.payload , 
    //         [key]:{
    //             ...(this.#responseData.payload[key] ? {[]})
    //         }
    //     }
    // }

    sendResponseData (statusCode , statusMessage) {

        this.#originalResponse.writeHead(statusCode , statusMessage , {
            'content-type':'application/json' ,
        });
        this.#originalResponse.end(JSON.stringify(this.#responseData));
    }

    #responseData;

    constructor (res) {
        if(res instanceof ServerResponse === false) throw new Error('"res" is not instance of the ServerResponse class');
        this.#originalResponse = res; 

        this.#responseData = {
            payload:{} ,
        } ;
    }
}

module.exports = ResponseDecorator ;
