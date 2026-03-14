const { randomBytes } = require("node:crypto");

/**
 * @param {number|string} r
 * @param {number|string} g
 * @param {number|string} b
 * @returns {string}
 */
const createColorizerString = (r,g,b) => {
    return `\x1b[38;2;${r};${g};${b}m`
}

const COLORS = {
    A:createColorizerString(166, 57, 140) ,
    B:createColorizerString(30, 64, 105) ,
    C:createColorizerString(141, 168, 46) ,
    D:`\x1b[0m` ,
}


class DataBase {

    /**
     * data:Object.<columnName,columnValue>
     * returns: new row Id
     * @param {string} tableId 
     * @param {Object.<string,string>} data 
     * @returns {string}
     */
    createOne (tableId , data) {
        console.log('create one' ,{tableId , data});
        /**
         * @type {Map<string,string>}
         */
        const row = new Map() ;
        for (const [ columnName , columnValue ] of Object.entries(data)) {
            row.set(columnName , columnValue );
        }

        /* новый уникальный идентификатор строки "таблицы" */
        const newRowIdHash = randomBytes(32).toString("hex");

        const tableByTableId =  this.#data.get(tableId);
        if(!tableByTableId) {
            /* если таблицы с таким именем не существует
            заводим новую и сразу же добавляем строку, с уникальным Id */
            this.#data.set(tableId , new Map([[newRowIdHash , row]]));

            /* вывод в консоль для отладки */
            for (const [ key , value ] of this.#data) {
                console.log({key , value});
            }
            /* микротранзакция выполнена, выходим из метода */
            return newRowIdHash ;
        }

        /* если таблица существует, пушим строку */
        tableByTableId.set(newRowIdHash , row) ;

        return {
            success:{
                newRowIdHash,
            },
        } ;
    }

    /**
     * 
     * @param {string} tableId 
     * @param {string} rowId 
     */
    readOne (tableId , rowId) {

        console.log('read one' ,{tableId , rowId});

        const tableById = this.#data.get(tableId);
        if (!tableById) {
            return {
                error: {
                    message: `table by id ${tableById} is not exist`,
                },
            }
        }

        const rowById = tableById.get(rowId);

        if (!rowById) {
            return {
                error: {
                    message:`row by id ${rowId} is not exist`,
                } ,
            }
        }

        return {
            success: {
                
            }
        };
    }
    
    readAll (tableId) {
        console.log('read all' ,{tableId});

        /* тестовая реализация: 
        отправляет в лог все таблицы и все строки*/

        for (const [tableId , tableRows] of this.#data.entries()) {

            console.log(`${COLORS.A}table: ${tableId}${COLORS.D}`);

            for (const [ rowId , rowData ] of tableRows.entries()) {
                console.log(`${COLORS.B}row id: ${rowId}${COLORS.D}`);                
                for (const [ colName , colData ] of rowData.entries()) {
                    console.log(`${COLORS.C}column name: ${colName}; column value: ${colData}${COLORS.D}`);
                }
            }
        }

        return {};
    }

    updateOne (tableId , rowId , data) {
        console.log('update one' , {tableId , rowId , data});
        return {}
    }

    deleteOne (tableId , rowId) {
        console.log('delete one' , {tableId , rowId});
        return {}
    }

    deleteTable (tableId) {
        console.log('delete table' , tableId);
        return {}
    }

    #data;

    constructor () {
        this.#data = new Map;
    }
}

const database = new DataBase ;

module.exports = { database }
