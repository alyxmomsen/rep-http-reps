
class DataBase {
    
    add(payload) {

        const {} = payload ;
        console.log({payload});

    }

    #files;

    constructor () {
        this.#files = new Map();
    }
}

const database = new DataBase ;

module.exports = database ;