const { randomBytes } = require('crypto');

const DB_CONSTANTS = {
    SUCCESS: {
        keys:{
            ID:'id' ,
            ROW:'row' ,
        }
    } ,
    tables:{
        FILES: {
            tablename:'FILES',
            keys:{
                TITLE:'title' ,
                DESCRIPTION:'description',
                ORIGINAL_FILENAME:'originalFilename',
                FILESYSTEM_FILENAME:'fileSystemFilename',
                MIME:'mime',
                EXTNAME:'extname',
                CONTENT_TYPE:'content-type' ,
            }
        },
        USERS:{
            tablename:'USERS',
            keys:{
                TITLE:'title' ,
                DESCRIPTION:'description',
                ORIGINAL_FILENAME:'originalFilename',
                FILESYSTEM_FILENAME:'fileSystemFilename',
                MIME:'mime',
                EXTNAME:'extname',
                CONTENT_TYPE:'content-type' ,
            }
        } ,
    }
}
class DataBase {

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
                    [DB_CONSTANTS.SUCCESS.keys.ID]:id , 
                    [DB_CONSTANTS.SUCCESS.keys.ROW]:row ,
                }
            }
        }
        
        console.log('check 2');
        nameTable.set(id , row);

        return {
            success:{
                [DB_CONSTANTS.SUCCESS.keys.ID]:id , 
                [DB_CONSTANTS.SUCCESS.keys.ROW]:row ,
            }
        }

    }

    /**
     * 
     * @param {string} tablename 
     * @param {string} rowId 
     */
    readRow (tablename , rowId) {

        console.log({tablename , rowId});
        const _tableName = tablename.toUpperCase();
        const nameTable = this.#tables.get(_tableName);

        if(!nameTable) {
            return {
                error:{
                    message:`no table ${_tableName}` ,
                    location:'DataBase::readRow' ,
                    subjects:{_tableName , nameTable} ,
                } ,
            }
        }

        const IDRow = nameTable.get(rowId);

        if(!IDRow) {
            return {
                error:{
                    location:'DataBase::readRow' ,
                    message:`no row by id: ${rowId}` ,
                    subjects:{IDRow} ,
                } ,
            }
        }

        return {
            success: {
                row:IDRow ,
            } ,
        }

    }

    /**
     * 
     * @param {*} tableName 
     */
    readTable (tableName) {
        const _tableName = tableName.toUpperCase();
        const tableByName = this.#tables.get(_tableName);

        if(!tableByName) {
            return {
                error:{
                    message:'no table by name ' + _tableName ,
                    subject:'',
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

module.exports = { database , DataBase , DB_CONSTANTS } ;

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
