
class ResponseDataAssembler {

    #payload ;
    #errors ;

    constructor () {
        this.#errors = [] ;
        this.#payload = {} ;
    }
}

const resopnsedataAssembler = new ResponseDataAssembler () ;

module.exports = resopnsedataAssembler ;