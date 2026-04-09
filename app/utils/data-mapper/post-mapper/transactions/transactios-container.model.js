const { Transaction } = require('./transaction.model');

class TransactionsContainer {
    /**
     * @type {Transaction}
     */
    #transactions;

    rollback() {}

    commit() {}

    /**
     *
     * @param {Object.<string,Transaction} transactions
     */
    constructor() {
        this.#transactions = new Map();
    }
}

module.exports = { TransactionsContainer };
