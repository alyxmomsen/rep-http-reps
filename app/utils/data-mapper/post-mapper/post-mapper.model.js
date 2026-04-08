
const { dbControllersRouter } = require("../../../services/database-adapter/controller/db-adapter.controller");
const { FileManager } = require("../../../services/filemanager.service.js/filemanager.service");

/**
 * 
 * @typedef {(payload:Object) => Promise<any>} ActionHandler
 * @typedef {"pending"|"ready"|"waiting for dependencies"|"failed"|"default"} TransactionState
 * 
 */

/** */
class PostMapper {

    /**
     * @type {Map<string,Transaction_>}
     */
    #transactions;

    async process(data) {

        for (const [tableName, groups] of Object.entries(data)) {

            if(this.#transactionsRouter.has(tableName)) {
                throw new Error(`PostMapper::process/iteration/table: tableName ${tableName} already registered`);
            }

            this.#transactionsRouter.set(tableName, new TransactionsContainer(`${tableName}`));
            const tableContainer = this.#transactionsRouter.get(tableName);

            for (const [groupId, columns] of Object.entries(groups)) {

                tableContainer.setChildContainer(groupId, new TransactionsContainer(`${tableName}/${groupId}`));
                const groupIdContainer = tableContainer.getChildContainer(groupId);

                groupIdContainer.addCommitHandler(async (data, transContainer) => {

                    try {

                        const controller = dbControllersRouter.get(tableName);
                        console.log(`started`, {controller});
                        if(!controller) {
                            console.log({controller,tableName});
                            throw new Error(`TransactionsContainer::committHandler/fail`);
                        }
                        const result = controller.createOne(data);
                        console.log(`TransactionsContainer::committHandler/success`, {controller,  tableName:'files', result});

                        return result;
                    }
                    catch (err) {
                        console.log('check this', {err});
                    }

                });

                console.log(`PostMapper::process/for-groups/group:`, {groupId, row: columns});

                const rowTransactions = await this.#handleRow(columns);

                for (const [name, transaction] of rowTransactions.entries()) {
                    groupIdContainer.addLocalTransaction(name, transaction);
                }


                console.log(`PostMapper::process/for/end`, {result: rowTransactions});

                try {
                    await groupIdContainer.commit();
                }
                catch (err) {
                    console.log(`PostManager::process/for/try-to-commit/failed`, {groupId, err});
                }
            }
        }

        console.log('PostMapper/process/result:', {trans:this.#transactions});
        console.dir(this.#transactions, {depth:10});
    }
 
    /**
     * 
     * @param {Object} row 
     * @param {Map<string,Transaction_>} groupIdTransactions 
     * @returns {Promise<Map<string,Transaction_>>}
     */
    async #handleRow(row, groupIdTransactions, tableName) {

        /**
         * @type {Map<string,Transaction_>}
         */
        const rowTransactions = new Map();
        
        for (const [colName, colData] of Object.entries(row)) {
            
            console.log(`PostMapper::handleRow/for/iteration` , {colName, colData});

            const Action = this.#actions.get(colData.action);
            if(!Action) {
                throw new Error(`PostMapper::#handleRow/Actions: no Action by name ${colData.action}`);
            }

            /**
             * @type {Transaction_}
             */
            const colTransaction =  await Action(colData.payload, this.#transactionsRouter);
            if(rowTransactions.has(colName)) {
                throw new Error(`PostMapper::#handleRow: transaction <${colName}> is already exist`);
            }
            rowTransactions.set(colName, colTransaction);
        }

        return rowTransactions;
    }

    /**
     * 
     * @param {string} actionName 
     * @param {ActionHandler} handler 
     */
    registrateAction (actionName, handler) {
        this.#actions.set(actionName, handler);
    }

    /**
     * @type {Map<string,ActionHandler}
     */
    #actions;

    /**
     * @type {Map<string,TransactionsContainer>}
     */
    #transactionsRouter;

    /**
     * 
     * @param {Object} deps 
     * @param {ActionHandler} deps.fileAction 
     * @param {ActionHandler} deps.dataAction
     * @param {ActionHandler} deps.linkAction
     * @throws {Error} - PostMapper: all the Actions required
     */
    constructor (deps={}) {

        const fileActionHandler = deps.fileAction;
        const dataActionHandler = deps.dataAction;
        const linkActionHandler = deps.linkAction;

        if(!fileActionHandler || !dataActionHandler || !linkActionHandler) {
            throw new Error(`PostMapper: all the Actions required`);
        }
        
        this.#actions = new Map();
        this.#actions.set('file', fileActionHandler);
        this.#actions.set('data', dataActionHandler);
        this.#actions.set('link', linkActionHandler);

        /**
         * 
         */
        this.#transactions = new Map();

        this.#transactionsRouter = new Map();
    }
}

module.exports = { PostMapper, FileActionFactory, LinkActionFactory, DataActionFactory }

// Actions


/**
 * 
 * @param {Object} deps 
 * @param {FileManager} deps.fileManager 
 * @returns {ActionHandler}
 */
function FileActionFactory (deps={}) {

    const fileManager = deps.fileManager;

    if(!fileManager) {
        throw new Error(`FileActionFactory: filemaNameger required`);
    }

    /**
     * @type {(payload:Buffer<ArrayBuffer>) => Promise<any> } payload
     * @throws {Error} - FileAction: payload shuld be instance of the Buffer
    */
    const FileAction = async (payload) => {

        const transaction_ = new Transaction_();
       
        if(payload instanceof Buffer === false) {
            throw new Error(`FileAction: payload shuld be instance of the Buffer`);
        }

        const fileData = payload;
       
        console.log(`FileAction/check payload`, {payload});

        const fmResult = await fileManager.write(fileData);

        if(fmResult.error) {
            console.log(`FileAction/filemanager/error: `,  {fmResult});
            transaction_.setState(`failed`);
            return;
        }
        
        if(!fmResult.success) {
            console.log(`FileAction/filemanager/internal error: no success: `,  {fmResult});
            transaction_.setState(`failed`);
            return;
        }

        transaction_.setRollBack('foobar', async () => {
            
            await fileManager.delete(fmResult.success.filename);
        });

        transaction_.setData(fmResult.success.filename);
        transaction_.setState('ready');
        
        return transaction_;

    }

    return FileAction

}

/**
 * 
 * @param {Object} deps 
 * @returns {ActionHandler} 
 */
function LinkActionFactory (deps={}) {

    /**
     * 
     * @param {Object} payload 
     * @param {Object} payload.tableName 
     * @param {Object} payload.groupId
     * @param {Map<string,TransactionsContainer>} transactions 
     * @returns {Transaction_}
     */
    const LinkAction = async (payload, transactions) => {

        const transaction = new Transaction_();

        if(!payload.tableName || false) {
            throw new Error(`LinkAction: payload.tableName required`);
        }

        if(!payload.groupId || false) {
            throw new Error(`LinkAction: payload.groupId required`);
        }

        const tableName = payload.tableName;
        const groupId = payload.groupId;

        console.log(`LinkAction/arguments` , {payload, transactions, tableName, groupId});
        
        const targetContainer = transactions.get(payload.tableName).getChildContainer(payload.groupId);
        
        if (!targetContainer) {
            throw new Error(`LinkAction: target container is not exist`);
        }

        console.log(`LinkAction/check target container: `, targetContainer);

        const containerState = {
            state:targetContainer.getState(),
            data:targetContainer.getData(),
            contName:targetContainer.getName(),
        }
        
        console.log(`LinkAction/target-container-state: `, {containerState, targetContainer});

        
        const tarContTransactions = targetContainer.getLocalTransactions();

        // const dbSet = {};
        // for (const [colName, colTransaction] of tarContTransactions.entries()) {
        //     const data = colTransaction.getData();
        //     const state = colTransaction.getState();
        //     if(state !== 'ready') {
        //         throw new Error(`LinkAction: code 1`);
        //     }
        //     dbSet[colName] = data;
        // }


        if(containerState.state === 'committed') {
            transaction.setData(containerState.data);
            transaction.setState("ready");
        }

        return transaction;

    }
    
    return LinkAction;
}

/**
 * 
 * @param {Object} deps 
 * @returns {ActionHandler} 
 */
function DataActionFactory (deps={}) {

    const DataAction = async (payload) => {
    
        const transaction = new Transaction_();

        console.log(`DataAction/args/payload`, {payload});

        transaction.setData(payload);
        transaction.setState("ready");

        console.log(`DataAction/check data state:` , transaction.getData());

        return transaction;
    }

    return DataAction;
}

class Transaction_ {

    hander () {

    }

    /**
     * @type {TransactionState}
     */
    #state;


    /**
     * 
     * @param {TransactionState} state 
     */
    setState(state) {
        this.#state = state;
    }
    /**
     * 
     * @returns {TransactionState}
     */
    getState() {
        return this.#state;
    }

    /**
     * @type {any}
     */
    #data;

    setData(data) {
        this.#data = data;
    }

    getData() {
        return this.#data;
    }

    async rollbackAll() {
        for (const [rollbackId, executor] of this.#rollbacks.entries()) {
            await executor();
        }
    }

    async rollback (id) {
        try {
            await this.#rollbacks.get(id)();
        }
        catch (e) {
            console.log('Transaction error: ', {e});
        }
    }

    /**
     * 
     * @param {string} id 
     * @param {() => Promise<any>} executer 
     */
    setRollBack (id, executer) {
        this.#rollbacks.set(id , executer);
    }

    apply () {

    }

    commit () {

    }

    /**
     * @type {Map<string,() => Promise<any>>}
     */
    #rollbacks;

    constructor () {
        this.#rollbacks = new Map();
        this.#data = null;
        this.#state = "default"
    }
}


class TransactionsContainer {
    /**
     * @type {"pending"|"committed"|"redy-to-commit"|"rejected"|"default"}
     */
    #state;
    #data;

    #commitHandler;

    /**
     * @type {Map<string,TransactionsContainer>}
     */
    #innerTransactionsContainers;
    /**
     * @type {Map<string,Transaction_>}
     */
    #localTransactions;

    /**
     * @type {Map<string,TransactionsContainer>}
     */
    #childContainers;

    /**
     * @type {string}
     */
    #containerName;

    getName() {
        return this.#containerName;
    }

    addCommitHandler(handler) {
        console.log(`TransactionsContainer::addCommitHandler`, handler);
        this.#commitHandler = handler;
    }

    async commit() {

        const transactionsData = {};
        for (const [name, transaction] of this.#localTransactions.entries()) {
            const state = transaction.getState();
            const data = transaction.getData();
            console.log(`TransactionsContainer::commit/state` , {state, data});
            if(state !== "ready") {
                this.#state = "rejected";
                throw new Error (`TransactionsContainer::commit: one of transactions is not ready; name='${name}' state='${state}'`);
                break;
            }
            transactionsData[name] = data;
        }

        console.log(`TransactionsContainer::commit/try commit`);

        const commitResult = await this.#commitHandler(transactionsData);

        this.#state = 'committed';
        this.#data  = commitResult.success;

        console.log(`\x1b[31mTransactionsContainer::commit: successfully committed\x1b[0m`, {transactionsData, commitResult});
    }

    addLocalTransaction(name , transaction) {
        if(this.#localTransactions.has(name)) {
            throw new Error(`TransactionsContainer::addTransaction: ${name} already registered`);
        }

        this.#localTransactions.set(name, transaction);
    }

    getLocalTransactions () {
        return this.#localTransactions;
    }

    getState() {
        return this.#state;
    }
    
    getData() {
        return this.#data;
    }

    getChildContainer (key) {
        const childContainer = this.#childContainers.get(key);
        if(!childContainer) {
            throw new Error(`TransactionsContainer::getChildContainer: no containter by name ${key}`);
        }
        return childContainer;
    }

    /**
     * 
     * @param {string} key 
     * @param {TransactionsContainer} container 
     */
    setChildContainer(name, container) {
        if(this.#childContainers.has(name)) {
            throw new Error(`TransactionsContainer::setChildContainer: name ${name} already registered`);
        }

        this.#childContainers.set(name, container);
    }

    

    /**
     * 
     * @param {string} name 
     * @param {Transaction_} transaction 
     */
    setInnerTransaction (name, transaction) {

        if(this.#innerTransactionsContainers.has(name)) {
            throw new Error(`TransactionsContainer: transaction ${name} already exist`);
        }

        this.#innerTransactionsContainers.set(name, transaction);
    }

    getInnerTransaction(name) {
        const container = this.#innerTransactionsContainers.get(name);
        if(!container) {
            throw new Error(`TransactionsContainer: no container by name`);
        }

        return container;
    }

    setRollBack() {

    }

    

    /**
     * 
     * @param {string} containerName 
     */
    constructor (containerName) {
        console.log(`TransactionsContainer::constructor/start`);
        this.#localTransactions = new Map();
        this.#childContainers = new Map();
        this.#commitHandler = async (data) => {
            console.log(`TransactionsContainer::commitHandler/default handler`, {data});
        }
        this.#state = "default";
        this.#data = null;

        this.#containerName = containerName;

        const check = {s:this.getState(),
        d:this.getData(),}

        console.log(`TransactionsContainer::constructor/end` , {
            state:this.#state, data:this.#data, name:this.#containerName, check
        });


    }
}