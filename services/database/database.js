const { randomBytes } = require('crypto');
class DataBase {

    /**
     * 
     * @param {string} tablename 
     * @param {any} data 
     * @returns {void}
     */
    setRow_ (tablename , data) {

        const nameTable = this.#tables.get(tablename);

        const id = randomBytes(32).toString('hex');

        if(!nameTable) {
            this.#tables.set(tablename , new Map([[
                id , data ,
            ]])) ;
            return ;
        }

        nameTable.set(id , data);
    }

    /**
     * 
     * @param {string} tablename 
     * 
     */
    getAllRows_ (tablename) {

        const nameTable = this.#tables.get(tablename);

        if(!nameTable) {
            return {
                error:{
                    message:'no table ' + tablename,
                    subjects:{nameTable , tablename} ,
                } ,
            }
        }

        const rows = {} ;
        for (const [key , value] of nameTable) {
            rows[key] = value ;
        }

        return {
            success:{
                rows ,
            }
        }
    }

    /**
     * 
     * @param {string} tablename 
     * @param {string} id 
     * @returns {{error?:{message:string;subjects?:any};success:{row:any}}}
     * 
     */
    getRow_(tablename , id) {

        const nameTable = this.#tables.get(tablename);

        if(!nameTable) {
            return {
                error:{
                    message:'no table ' + tablename,
                    subjects:{nameTable} ,
                } ,
            }
        }

        const row = nameTable.get(id);

        if(!row) {
            return {
                error:{
                    message:'no row by id ' + id,
                    subjects:{nameTable , id} ,
                } ,
            }
        }

        return {
            success:{
                row ,
            }
        }

    }

    /**
     * 
     * @param {string} tablename 
     * @returns {{error?:{message?:string;subjects?:any};success?:{table:Table}}}
     */
    getTable(tablename) {

        const nameTable = this.#tables.get(tablename);

        if(!nameTable) {
            
            return {
                error:{
                    message:'' ,
                    subjects:{
                        nameTable ,
                    } ,
                }
            }
        }

        return {
            success: {
                table: new Table(nameTable) ,
            } ,
        }
    }

    /**
     * 
     * @param {string} tablename 
     * @param {Object<string,string>} row 
     * @returns {{success:{id:string;row:string}}}
     */
    createRow (tablename , row) {

        console.log('create row: ' , {tablename , row});

        const id = randomBytes(32).toString('hex');

        const nameTable = this.#tables.get(tablename);
        if(!nameTable) {
            console.log('check 1');
            this.#tables.set(tablename , new Map([[id ,row]]));
            return {
                success:{
                    id , row ,
                }
            }
        }
        
        console.log('check 2');
        nameTable.set(id , row);

        return {
            success:{
                id , row ,
            }
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

    readTable (tableName) {
        const _tableName = tableName.toUpperCase();
        const tableByName = this.#tables.get(_tableName);

        if(!tableByName) {
            return {
                error:{
                    message:'no table by name ' + _tableName ,
                } ,
            }
        }

        const rowsByTableName = [] ;

        for (const [ key , value ] of tableByName.entries()) {
            rowsByTableName.push({
                rowId:key ,
                rowData:value ,
            });
        }

        return {
            success:{
                rows:rowsByTableName ,
                tableByName ,
            } ,
        }
    }

    #tables;

    constructor () {
        this.#tables = new Map();
    }
}

const database = new DataBase ;

module.exports = { database , DataBase } ;

class Table {

    addRow (data) {

        for (const [key , value] of Object.entries(data)) {
            console.log({key , value});
        }
    }

    getRow(id) {
        const row = this.#table.get(id);
        return row ;
    }

    getAllRows () {

        const rows = {} ;

        for (const [key  ,value] of this.#table) {
            rows[key] = value ;
        }

        return rows ;
    }

    #table;

    /**
     * 
     * @param {Map<string , any>} table 
     */
    constructor (table) {
        this.#table = table ;
        // this.#table.get('hello');
    }
}
