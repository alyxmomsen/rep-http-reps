const { DataBaseControllerStrategy } = require("../model/behaviors");

class DataBaseController {

    /**
     * @returns {}
     */
    async createRow (tableId , rowData) {
        const { success , error } = await this.#behavior.createRow(tableId , rowData);
        if(error) {
            return {
                error ,
            }
        }
        console.log();
        return {
            success ,
        }
    }
    
    readRow (tableId , rowId) {
        const { } = this.#behavior.readRow(tableId , rowId);
        console.log();
    }
    
    readTableRows (tableId) {
        const { } = this.#behavior.readTableRows(tableId);
        console.log();
    }

    #behavior;

    /**
     * 
     * @param {DataBaseControllerStrategy} strategyBehavior 
     */
    constructor (strategyBehavior) {
        console.log({strategyBehavior});
        this.#behavior = strategyBehavior ;
    }
}

module.exports = { DataBaseController }