
class RouterResponse {

    json() {

        this.#serverResponseInstance.writeHead();
        return this ;
    }

    send() {
        this.#serverResponseInstance.end();
    }

    updatePayload () {

    }

    resetPayload () {

    }

    #payload;
    #serverResponseInstance ;

    constructor (res) {
        this.#serverResponseInstance = res ;
        this.#payload = {} ;
    }
}