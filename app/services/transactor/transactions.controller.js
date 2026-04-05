const { Transaction } = require('./transactions.model');

class TransactionFactory {
    instance() {
        return new Transaction();
    }

    constructor() {}
}

module.exports = { TransactionFactory };
