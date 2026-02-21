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

        console.log({nameTable});

        return {
            id , 
            row ,
        }

    }

    /**
     * 
     * @param {string} tablename 
     * @param {string} rowId 
     * @returns {{error?:{message:string};success?:{row:any}}}
     */
    readRow (tablename , rowId) {

        const _tableName = tablename.toUpperCase();
        const nameTable = this.#tables.get(_tableName);

        if(!nameTable) {
            return {
                error:{
                    message:`no table ${_tableName}` ,
                } ,
            }
        }

        const IDRow = nameTable.get(rowId);

        if(!IDRow) {
            return {
                error:{
                    message:`no row by id: ${rowId}` ,
                } ,
            }
        }

        return {
            success: {
                row:IDRow ,
            } ,
        }

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