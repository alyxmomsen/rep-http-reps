const { randomBytes } = require("node:crypto");

class DataBase {

    getTables () {
        return this.#tables ;
    }

    add(tableName , fields) {

        if(!this.#tables.has(tableName)) {
            this.#tables.set(tableName , new Map());
        }

        const table = this.#tables.get(tableName);

        const newTableItem = new Map();
        table.set(
            randomBytes(32).toString('hex') ,
            newTableItem ,
        );

        for (const [key , bundle] of fields.entries()) {
 
            newTableItem.set(key , bundle);            
        }
    }

    #tables;

    constructor () {
        this.#tables = new Map();
    }
}

const database = new DataBase ;

module.exports = database ;