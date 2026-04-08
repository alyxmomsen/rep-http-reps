const { Transaction } = require("./transactions/transaction.model");
const { TransactionsContainer } = require("./transactions/transactios-container.model");

class PostMapper {

    /**
     * @type {Map<string,TransactionsContainer>}
     */
    #containers;

    /**
     * @type {Map<string,() => any>}
     */
    #actions;

    /**
     * 
     * @param {*} tableName 
     * @param {*} groupId 
     * @param {*} container 
     * @returns {TransactionsContainer}
     */
    #setContainer(tableName, groupId, container) {

        const generatedKey = `${tableName}/${groupId}`;

        if(this.#containers.has(generatedKey)) {
            throw new Error(`PostMapper::setContainer: key is already exist ${generatedKey}`);
        }
    
        this.#containers.set(generatedKey, container);

        return container;
    }

    async #handleRow (groupColumns) {

        /**
         * @type {Map<string,Transaction>}
         */
        const rowTransactions = new Map();
        
        for (const [colName, {action:actionName, payload:actionPayload}] of Object.entries(groupColumns)) {
            
            const newTransaction = new Transaction();
            rowTransactions.set(colName, newTransaction);
            
            const action = this.#actions.get(actionName);
            if(!action) {
                throw new Error (`PostMapper::process/action: incorrect action key`);
            }

            newTransaction.setAction('main',  async () => {
                await action(actionPayload);
            });

        }
    }

    async process (data) {

        for (const [tableName, groups] of Object.entries(data)) {

            for (const [groupId, groupColumns] of Object.entries(groups)) {

                this.#handleRow(groupColumns);

                const goupIdContainer = this.#setContainer(tableName, groupId,  new TransactionsContainer({

                }));
                
            }
            
        }

    }
    /**
     * 
     * @param {Object} deps 
     * @param {Function} deps.fileAction 
     * @param {Function} deps.linkAction 
     * @param {Function} deps.dataAction 
     */
    constructor (deps={}) {

        const fileAction = deps.fileAction;
        const linkAction = deps.linkAction;
        const dataAction = deps.dataAction;

        this.#actions = new Map();

        this.#actions.set('link', linkAction);
        this.#actions.set('file', fileAction);
        this.#actions.set('data', dataAction);

        this.#containers = new Map();
    }
}

module.exports = { PostMapper }

