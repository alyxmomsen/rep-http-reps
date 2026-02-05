const { randomBytes } = require("node:crypto");

class DataBase {

    getTable(name) {
        
        // console.log({tables:this.#tables , name});

        const table = this.#tables.get(name);

        return table ;
    }

    getItemById (tableMap , id) {

        console.log({tableMap , id});

        // tableMap.get(id);

    }

    getTables () {
        return this.#tables ;
    }

    add(tableName , fields) {

        const newTableItem = new Map();

        for (const [key , bundle] of fields.entries()) {
            console.log({key , bundle});
            newTableItem.set(key , bundle);            
        }

        if(!this.#tables.has(tableName)) {
            this.#tables.set(tableName , new Map());
        }

        const table = this.#tables.get(tableName);
        
        table.set(
            randomBytes(32).toString('hex') ,
            newTableItem ,
        );

    }

    #tables;

    constructor () {
        this.#tables = new Map();
    }
}

const database = new DataBase ;

module.exports = database ;