const { randomBytes } = require("node:crypto");
const fsadapter = require("./fs-adapter");

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

    async add(tableName , fields) {

        console.log(`add new item into database < ${tableName} > table...` , fields);

        const newTableItem = new Map();

        // copy all fields to new database table bundle
        // but body is not
        // body is storing into local filesystem
        for (const [key , bundle] of fields.entries()) {
            // console.log({key , bundle});

            if(key === '*') {
                
                const body = bundle.body ;

                if(body && !body.length) {
                    throw new Error('empty file body');
                }

                const uploadstatus = await fsadapter.upload(body);

                const { status , message , uploadPath } = uploadstatus;

                console.log({uploadstatus});

                if(status) {
                    throw new Error('smth wrong with uploading');
                }

                // mutate bundle
                // add next property
                // the property name is UPLOADPATH
                // and bundle.body (buffer data) will be deleted
                // cose that already stored in a filesystem

                bundle.uploadPath = uploadPath ;
                bundle.body = null ;

            }

            newTableItem.set(key , bundle);    
        }

        console.log({newTableItem});

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