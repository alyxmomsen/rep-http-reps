const { randomBytes } = require('crypto');
class DataBase {

    createRow (tablename , row) {

        const id = randomBytes(32).toString('hex');

        const nameTable = this.#tables.get(tablename);
        if(!nameTable) {
            this.#tables.set(tablename , new Map([[id ,row]]));
            return {
                id ,
                row ,
            } ;
        }

        nameTable.set(id , row);

        return {
            id , 
            row ,
        }

    }

    readRow (tablename , rowId) {

        this.#tables.get(tablename);

    }

    createTable () {

    }

    readTable () {

    }

    #tables;

    constructor () {
        this.#tables = new Map();
    }
}

const database = new DataBase ;

module.exports = { database } ;