const {
    DBAdapter,
} = require('../../../database-adapter/models/db-adapter.model');
const { DataBase } = require('../../../database/database');
const {
    FileManager,
} = require('../../../filemanager.service.js/filemanager.service');

class Transaction {
    /**
     * @type {any}
     */
    #fileResult;
    #fieldPending;
    #regularFieldPending;

    /**
     * @type {boolean}
     */
    #failed;

    /**
     *
     * @param {Object} Data
     * @param {Buffer<ArrayBuffer>} Data.fileData
     * @param {string} Data.mime
     * @param {string} Data.linkId
     * @param {string} Data.originalFileName
     */
    async processFile(data) {
        console.log({ isfailed: this.#failed });

        if (this.#failed) {
            throw new Error(`Transaction: this transaction is already failed`);
        }

        this.#argumentsValidation(data);

        const { fileData, originalFileName, mime } = data;

        const fmResponse = await this.#filemanager.write(data.fileData);

        if (fmResponse.error) {
            this.#failed = true;
            console.log({ failedcheck: this.#failed });
            throw new Error(`Transaction: filemanager failed`);
        }

        if (!fmResponse.success) {
            this.#failed = true;
            // console.log({failedcheck:this.#failed});
            throw new Error(`Transaction: filemanager iternal error`);
        }

        const dbadapter = this.#dbControllersRouter.get('files');

        console.log({ dbadapter });

        const dbresult = dbadapter.createOne({
            originalFileName: originalFileName,
            mime,
            fileSystemFilename: fmResponse.success.filename,
        });

        if (dbresult.error) {
            throw new Error(`Transaction: database err`);
        }

        if (!dbresult.success) {
            throw new Error(`Transaction: database no succ`);
        }

        console.log({ dbresult });

        this.#fileResult = fmResponse.success;

        if (this.#fieldPending) {
            this.#fieldPending(this.#fileResult);
        }

        // this.#dbadapter.createOne();
    }

    async processRegularField() {}

    async processLinkedField() {}

    #argumentsValidation(data) {
        if (!data.fileData || data.fileData instanceof Buffer === false) {
            throw new Error(
                `Transaction: file data shuld be an instance of a Buffer`
            );
        }

        if (!data.mime) {
            throw new Error(`Transaction: mime required`);
        }

        if (!data.originalFileName) {
            throw new Error(`Transaction: originalFileName required`);
        }

        if (!data.linkId) {
            throw new Error(`Transaction: linkId required`);
        }
    }

    /**
     * @type {Map<string,DBAdapter>}
     */
    #dbControllersRouter;
    /**
     * @type {FileManager}
     */
    #filemanager;

    /**
     *
     * @param {Object} deps
     * @param {FileManager} deps.fileManager
     * @param {Map<string,DBAdapter>} deps.dbControllersRouter
     */
    constructor(deps) {
        if (!deps.dbControllersRouter || !deps.dbControllersRouter || false) {
            throw new Error();
        }

        this.#dbControllersRouter = deps.dbControllersRouter;
        this.#filemanager = deps.fileManager;

        this.#failed = false;

        this.#fileResult = null;
        this.#fieldPending = null;
    }
}

class Transactor {
    /**
     * @type {Map<string,Transaction>}
     */
    #transactions;

    /**
     *
     * @param {string} id
     * @returns {Transaction}
     */
    useTransaction(id) {
        console.log({ transactions: this.#transactions });
        if (!this.#transactions.has(id)) {
            console.log(`\x1b[31m`, 'create a new transaction', `\x1b[0m`);
            this.#transactions.set(
                id,
                new Transaction({
                    dbControllersRouter: this.#dbControllersRouter,
                    fileManager: this.#filemanager,
                })
            );
        }

        const transaction = this.#transactions.get(id);

        return transaction;
    }

    // deps

    /**
     * @type {Map<string,DBAdapter>}
     */
    #dbControllersRouter;
    /**
     * @type {FileManager}
     */
    #filemanager;

    /**
     *
     * @param {Object} deps
     * @param {FileManager} deps.fileManager
     * @param {Map<string,DBAdapter>} deps.dbControllersRouter
     */
    constructor(deps) {
        if (!deps.dbControllersRouter || !deps.fileManager || false) {
            throw new Error(`Transactor: all deps required`);
        }

        this.#dbControllersRouter = deps.dbControllersRouter;
        this.#filemanager = deps.fileManager;

        this.#transactions = new Map();
    }
}

module.exports = {
    Transactor,
    Transaction,
};
