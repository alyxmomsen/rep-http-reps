const {
    dbControllersRouter,
} = require('../database-adapter/controller/db-adapter.controller');
const { DBAdapter } = require('../database-adapter/models/db-adapter.model');
const {
    FileManager,
} = require('../filemanager.service.js/filemanager.service');

class Transaction {
    /**
     * @type {Object|null}
     */
    #fileExecResult;
    /**
     * @type {((fileExecResult:Object) => any)|null}
     */
    #fieldPending;

    /**
     *
     * @param {Object} data
     * @param {string} data.originalFileName
     * @param {string} data.mime
     * @param {Buffer<ArrayBuffer>} data.file
     */
    async processFile(data) {
        const fileExecResult = await this.#handleFileData(data);

        if (this.#fieldPending) {
            this.#fieldPending(fileExecResult);
            console.log(
                `\x1b[32m`,
                'set file exec result',
                this.#fileExecResult,
                `\x1b[0m`
            );
        } else {
            this.#fileExecResult = fileExecResult;
            console.log(
                `\x1b[32m`,
                'set file exec result',
                this.#fileExecResult,
                `\x1b[0m`
            );
        }
    }

    /**
     * @type {Map<string,any>}
     */
    #resolved;

    processField(data) {
        if (this.#fileExecResult) {
            this.#resolved.set(data.columnName, this.#fileExecResult);

            console.dir(this.#resolved);
            // this.#handleFieldData(dataSet);
        } else {
            this.#fieldPending = (fileExecResult) => {
                this.#fileExecResult = fileExecResult;

                this.processField(data);
            };
        }
    }

    showResolved() {
        console.dir(this.#resolved, { depth: 20 });
    }

    /**
     *
     * @param {Object} data
     * @param {string} data.originalFileName
     * @param {string} data.mime
     * @param {Buffer<ArrayBuffer>} data.file
     */
    async #handleFileData(data) {
        if (!data || !data.originalFileName || !data.mime || !data.file) {
            throw new Error(`incorrect data-set`);
        }

        if (data.file.data instanceof Buffer === false) {
            throw new Error(`file must be Buffer`);
        }

        const fmresult = await this.#filemanager.write(data.file.data);

        if (fmresult.error) {
            throw new Error(`file writing fail`);
        }

        const fileName = fmresult.success.filename;

        const controller = this.#dataBaseControllersRouter.get('files');

        if (!controller) {
            throw new Error(`Transaction: incorrect db tablename`);
        }

        const dbresult = controller.createOne({
            originalFileName: data.originalFileName.data,
            mime: data.mime.data,
            fileSystemFilename: fileName,
        });

        console.log('transaction: dbresult', { dbresult });

        if (dbresult.success) {
            return {
                rowId: dbresult.success.newRowIdHash,
                data: dbresult.success.row,
            };
        } else {
            if (dbresult.error || !dbresult.success) {
                throw new Error(`Transaction: data base error`);
            }
        }
    }

    #handleFieldData() {
        const controler = dbControllersRouter.get('video-playlist');
        controler.createOne();
    }

    /**
     * @type {FileManager}
     */
    #filemanager;
    /**
     * @type {Map<string,DBAdapter}
     */
    #dataBaseControllersRouter;

    /**
     *
     * @param {Object} deps - dependencies container
     * @param {FileManager} deps.fileManager - fileManager
     * @param {Map<string|DBAdapter>} deps.dataBaseControllersRouter - dataBaseControllersRouter
     *
     */
    constructor(deps) {
        if (!deps || !deps.fileManager || !deps.dataBaseControllersRouter) {
            throw new Error(`Transaction: dependencies required`);
        }

        this.#filemanager = deps.fileManager;
        this.#dataBaseControllersRouter = deps.dataBaseControllersRouter;

        this.#fieldPending = null;
        this.#fileExecResult = null;

        this.#resolved = new Map();
    }
}

class Transactions {
    showResolved() {
        for (const [_, tr] of this.#transactions.entries()) {
            tr.showResolved();
        }
    }

    /**
     *
     * @param {string} linkId - linkid
     * @returns {Transaction}
     */
    getTransaction(linkId) {
        if (!this.#transactions.has(linkId)) {
            this.#transactions.set(
                linkId,
                new Transaction({
                    dataBaseControllersRouter: this.#dataBaseControllersRouter,
                    fileManager: this.#filemanager,
                })
            );
        }
        return this.#transactions.get(linkId);
    }

    /**
     * @type {Map<string,Transaction>}
     */
    #transactions;

    // deps

    #dataBaseControllersRouter;
    #filemanager;

    /**
     *
     * @param {Object} deps
     * @param {Map<string,DBAdapter>} deps.dataBaseControllersRouter
     * @param {FileManager} deps.fileManager
     */
    constructor(deps) {
        if (!deps || !deps.dataBaseControllersRouter || !deps.fileManager) {
            throw new Error(`incorrect dependencies`);
        }

        this.#filemanager = deps.fileManager;
        this.#dataBaseControllersRouter = deps.dataBaseControllersRouter;

        this.#transactions = new Map();
    }
}

module.exports = { Transactions, Transaction };
