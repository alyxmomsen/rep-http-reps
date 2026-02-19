const { randomBytes } = require('crypto');
class DataBase {

    create(tablename , fields) {

        console.log('db; creator:', {tablename , fields});

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

        console.log({tablename , itemId});

        const tableByName = this.#tables.get(tablename);

        if(!tableByName) return null ;

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

const database = new DataBase ;

module.exports = { database } ;