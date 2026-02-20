const { ServerResponse } = require("http");

class ResponseDecorator {

    addPayloadField (fieldName , value) {

        const payloadField = this.#responseData.payload[fieldName] ;

        if(!payloadField) {
            this.#responseData.payload = {
                ...this.#responseData.payload , 
                [fieldName]:value ,
            } ;
            return ;
        }

        payloadField = value instanceof Object ? {...value} : value ;

        this.#responseData.payload = {...this.#responseData.payload , [fieldName]:value} ;
    }

    getPayloadData () {
        return this.#responseData.payload ;
    }

    sendResponsePayloadData (statusCode , statusMessage) {

        this.#originalServerResonse.writeHead(statusCode , statusMessage , {
            "content-type":"application/json" ,
        });

        this.#originalServerResonse.end(JSON.stringify(this.#responseData));
    }


    #responseData;

    // overwrite

    write (...args) {
        return this.#originalServerResonse.write(...args)
    }

    end(...args) {
        return this.#originalServerResonse.end(...args);
    }

    writeHead (...args) {
        return this.#originalServerResonse.writeHead(...args);
    }

    get wrtable () {
        return this.#originalServerResonse.writable
    }

    #originalServerResonse ;

    constructor (res) {

        if(res instanceof ServerResponse === false) {
            throw new Error(`this is not ServerResponse`);
        }

        this.#originalServerResonse = res ;

        this.#responseData = {
            payload:{} ,
            status:0 ,
        }
    }
}

module.exports = ResponseDecorator ;
