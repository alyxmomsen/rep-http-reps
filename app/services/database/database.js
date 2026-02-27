const { randomBytes } = require("node:crypto");

class DataBase {

    /**
     * @param {string} tableId 
     * @param {Object.<string,string>} data 
     * @returns {{row:{id:string;columns:Map<string,Object.<string,string>}}}
     */
    createRow (tableId , data) {

        const tableIdTable = this.#tables.get(tableId);

        const newRow = new Map();
        const id = randomBytes(32).toString('hex');
        for (const [ columnName , columnData ] of Object.entries(data)) {
            newRow.set(columnName  , columnData);
        }

        if(!tableIdTable) {
            this.#tables.set(tableId , new Map([[
                id , newRow ,
            ]]));
            return {
                row:{
                    id ,
                    columns: newRow ,
                } ,
            }
        }

        tableIdTable.set(id , newRow);

        return {
            row:{
                id ,
                columns: newRow ,
            } ,
        }
    }

    /**
     * 
     * @param {string} tableId 
     * @param {string} rowId 
     * @returns {{
     *  error:{location:string;message:string;subjects:Object}
     * }|{
     *  success:{row:{id:string;data:Object.<string,string>}}
     * }}
     */
    readRow (tableId, rowId) {
        const tableIdTable = this.#tables.get(tableId);
        if(!tableIdTable) {
            return {
                error:{
                    location:'DataBase::readRow' , 
                    message:`table by id < ${tableId} > is not exist` ,
                    subjects:{tableId} ,
                } ,
            }
        }
        
        const idRow = tableIdTable.get(rowId);
        
        if(!idRow) {
            return {
                error:{
                    location:'DataBase::readRow' , 
                    message:`row by id < ${rowId} > is not exist` ,
                    subjects:{rowId , tableId} ,
                } ,
            }
        }

        return {
            success: {
                row:{
                    id:rowId ,
                    data:idRow ,
                } ,
            } ,
        }
    }

    /**
     * 
     * @param {string} tableId 
     * @returns {{
     *  error:{location:string;message:string;subjects:Object}
     * }|{
     *  success:{table:{id:string;rows:Object.<string,string>}}
     * }}
     */
    readTableRows (tableId) {
        const tableIdTable = this.#tables.get(tableId);
        if(!tableIdTable) {
            return {
                error:{
                    location:'DataBase::readTableRows' , 
                    message:`table by id < ${tableId} > is not exist` ,
                    subjects:{tableId} ,
                } ,
            }
        }

        const rows = {} ;

        for (const [rowId , columns] of tableIdTable.entries()) {

            const row = {} ;

            for (const [ colname , colData ] of columns.entries()) {
                row[colname] = colData ;
            }

            rows[rowId] = row ;
        }

        return {
            success: {
                table:{
                    id:tableId ,
                    rows ,
                }
            }
        }
    }

    #tables;

    constructor () {
        this.#tables = new Map(); 
    }
}

const database = new DataBase();

module.exports = { database }