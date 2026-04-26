const { randomBytes } = require("node:crypto");

class InMemoryDataBase {

    
    /**
     * 
     * @param {string} tableName 
     * @param {Object} data 
     */
    create(tableName, data) {
        
        
        if (!this.#database.has(tableName)) {
            console.log(`\x1b[33mcreate new table < ${tableName} >\x1b[0m`);
            this.#database.set(tableName, new Map());
        }

        const table = this.#database.get(tableName)
        
        const rowId = randomBytes(32).toString('hex');

        table.set(rowId, data);

        console.log(`\x1b[32madded new row in table < ${tableName} >\x1b[0m`);

        return {
            tableName: tableName,
            rowId: rowId,
            data:data,
        }
    }

    /**
     * @type {Map<string,Map<string,Object>>}
     */
    #database;

    constructor() {
        this.#database = new Map();
    }
}

module.exports = { InMemoryDataBase }