const { randomBytes } = require('crypto');
const {} = require('fs');
class DataBase {

    create(tablename , fields) {

        const tableByName = this.#tables.get(tablename);

        const id = randomBytes(32).toString('hex');

        if(!tableByName) {
            this.#tables.set(tablename , new Map([
                [id , fields]
            ]));
            return id ;
        }

        tableByName.set(id , fields);

        console.log({tableByName});

        return id ;
    }

    getTableItemById (tablename , itemId) {

        const tableByName = this.#tables.get(tablename);

        if(!tablename) return null ;

        const itemById = tableByName.get(itemId);

        return itemById || null ;

    }

    getTableItems (tablename) {

        const items = [] ;

        const tableByName = this.#tables.get(tablename);

        if(!tableByName) return items ;

        tableByName.entries().forEach(([itemId , fields]) => {
            items.push({
                id:itemId ,
                fields ,
            });
        });

        return items ;

    }

    #tables;

    constructor () {
        this.#tables = new Map ();
    }
}

module.exports = DataBase ;