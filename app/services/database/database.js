const { randomBytes } = require("node:crypto");

class DataBase {

    createOne (tableId , data) {
        console.log('create one' ,{tableId , data});
        const row = new Map() ;

        for (const [ columnName , columnValue ] of Object.entries(data)) {
            row.set(columnName , columnValue );
        }

        const tableByTableId =  this.#data.get(tableId);

        const newRowIdHash = randomBytes(32).toString("hex");

        if(!tableByTableId) {
            this.#data.set(tableId , new Map([[newRowIdHash , row]]));

            for (const [ key , value ] of this.#data) {
                console.log({key , value});
            }

            return newRowIdHash ;
        }

        tableByTableId.set(newRowIdHash , row) ;

        return newRowIdHash ;
    }

    readOne (tableId , rowId) {
        console.log('read one' ,{tableId , rowId});

        for (const [tableId , tableRows] of this.#data.entries()) {

            console.log(`table: ${tableId}`);

            for (const [ rowId , rowData ] of tableRows.entries()) {
                console.log(`row id: ${rowId}`);                
                for (const [ colName , colData ] of rowData.entries()) {
                    console.log({colName , colData});
                }
            }

        }
    }
    
    readAll (tableId) {
        console.log('read all' ,{tableId});
    }

    updateOne (tableId , rowId , data) {
        console.log('update one' , {tableId , rowId , data});
    }

    deleteOne (tableId , rowId) {
        console.log('delete one' , {tableId , rowId});
    }

    deleteTable (tableId) {
        console.log('delete table' , tableId);
    }

    #data;

    constructor () {
        this.#data = new Map;
    }
}

const database = new DataBase ;

module.exports = { database }
