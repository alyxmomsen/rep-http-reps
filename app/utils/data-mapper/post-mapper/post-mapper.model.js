
// const { dbControllersRouter } = require("../../../services/database-adapter/controller/db-adapter.controller");
const { DBAdapter } = require("../../../services/database-adapter/models/db-adapter.model");
const { FileManager } = require("../../../services/filemanager.service.js/filemanager.service");

/**
 * 
 * @typedef {(context:PostMapper,payload:Object) => Promise<any>} ActionHandler
 * @typedef {"pending"|"ready"|"waiting for dependencies"|"failed"|"default"|"rejected"} TransactionState
 * 
 */


/**
 * @typedef {Object} SuccessCommitterReturnContsistentData
 * @property {string} CommitterReturnContsistentData.tableName
 * @property {string} CommitterReturnContsistentData.rowId
 * @property {Object} CommitterReturnContsistentData.storedRowData
 * @typedef {Object} ErrorCommitterReturnContsistentData
 * @property {string} CommitterReturnContsistentData.message
 */

/**
 * @typedef {"setRootContainer"|"setGroupIdContainer"} PostMapperEventName
 */

/**
 * 
 */

/** */
class PostMapper {

    /**
     * @type {Map<string,(context:Object) => any>}
     */
    #eventListeners;

    /**
     * addListener нужно модифицировать как "private",
     * а Actions байндить 
     */

    /**
     * 
     * @param {PostMapperEventName} eventName 
     * @param {(context:Object) => any} handler 
     */
    addListener (eventName, handler) {
        this.#eventListeners.set(eventName, handler);
    }

    /**
     * 
     * @param {PostMapperEventName} eventName 
     * @param {Object} context 
     */
    emmit(eventName, context) {
        console.log('PostMapper::emmit: ', {context, eventName});
        const providedEventName = eventName;
        for (const [listenerEventName, handler] of this.#eventListeners.entries()) {
            if(listenerEventName === providedEventName) {
                handler(context);
            }
        }
    }

    /**
     * 
     * @param {string} tableName 
     * @returns {TransactionsContainer}
     */
    #setTransactionRootContainer (tableName) {

        if(this.#rootTransactionsContainers.has(tableName)) {
            throw new Error(`PostMapper::process/iteration/table: tableName ${tableName} already registered`);
        }
        this.#rootTransactionsContainers.set(tableName, new TransactionsContainer(`${tableName}`));
        const groupContainer = this.#rootTransactionsContainers.get(tableName);

        // emmits

        this.emmit("setRootContainer", { 
            groupContainer:groupContainer, tableName 
        });

        return groupContainer;
    }

    async process(data) {

        for (const [tableName, groups] of Object.entries(data)) {

            const tableRootContainer = this.#setTransactionRootContainer(tableName);

            // if(this.#rootTransactionsContainers.has(tableName)) {
            //     throw new Error(`PostMapper::process/iteration/table: tableName ${tableName} already registered`);
            // }

            // this.#rootTransactionsContainers.set(tableName, new TransactionsContainer(`${tableName}`));
            // const tableRootContainer = this.#rootTransactionsContainers.get(tableName);

            for (const [groupId, columns] of Object.entries(groups)) {

                tableRootContainer.setChildContainer(groupId, new TransactionsContainer(`${tableName}/${groupId}`));
                const groupIdContainer = tableRootContainer.getChildContainer(groupId);

                // --------- event emitting --------- 

                this.emmit('setGroupIdContainer', { groupIdContainer });

                // --------- -------------- --------- 

                const groupCommittHandler = async (data, transContainer) => {

                    try {
                        // получаем контроллер, адаптер для работы с Базой Данных 
                        const controller = this.#dbControllersRouter.get(tableName);
                        // console.log(`started`, {controller});
                        if(!controller) {
                            console.log({controller,tableName});
                            throw new Error(`groupCommittHandler/fail`);
                        }
                        // --- // --- // --- // --- // --- // --- // --- //
                        const result = controller.createOne(data);
                        console.log(`groupCommittHandler/result`, {controller,  tableName:'files', result});
    
                        

                        /**
                         * @type {{success?:SuccessCommitterReturnContsistentData;error?:Object}}
                         */
                        const consistentRerurnData = {
                            // success?:{},
                            // error?:{},
                        }

                        if(!result) {
                            throw new Error (`groupCommittHandler/internal error: result required but not returned from db-adapter`) ;
                        }

                        if(result.error) {
                            consistentRerurnData.error =  result.error;
                            return consistentRerurnData;
                        }

                        if(!result.success) {
                            throw new Error(`groupCommittHandler/dbAdapter/result: no success provided`);
                        }

                        const rowId = result.success.newRowIdHash;
                        const storedRowData = result.success.row;

                        if(!rowId) {
                            throw new Error(`groupCommittHandler/at success: no rowId returned`);
                        }

                        consistentRerurnData.success = {
                            tableName:tableName,
                            rowId:rowId,
                            storedRowData:storedRowData,
                        }
                        
                        return consistentRerurnData;
                    }
                    catch (err) {
                        console.log('check this', {err});
                    }
                }
                groupIdContainer.addCommitter( groupCommittHandler );

                // console.log(`PostMapper::process/for-groups/group:`, {groupId, row: columns});

                // ============================================

                const rowTransactions = await this.#handleRow(columns);

                for (const [name, transaction] of rowTransactions.entries()) {
                    groupIdContainer.addLocalTransaction(name, transaction);
                }

                // console.log(`PostMapper::process/for/end`, {result: rowTransactions});

                // =========== try to commit ===========

                try {
                    await groupIdContainer.commit();
                }
                catch (err) {
                    // исключение коммита
                    console.log(`PostManager::process/for/try-to-commit/failed`, {groupId, err});
                }
            }
        }

        // console.log('PostMapper/process/result:', {trans:this.#transactions});
        // console.dir(this.#transactions, {depth:10});
    }
 
    /**
     * 
     * @param {Object} row 
     * @param {Map<string,Transaction_>} groupIdTransactions 
     * @returns {Promise<Map<string,Transaction_>>}
     */
    async #handleRow(row, groupIdTransactions, tableName) {

        /**
         * Здесь мы перебираем данные для каждого столбца Базы Данных
         * 
         */

        /**
         * @type {Map<string,Transaction_>}
         */
        const rowTransactions = new Map();
        
        for (const [colName, colData] of Object.entries(row)) {
            
            // console.log(`PostMapper::handleRow/for/iteration` , {colName, colData});

            const Action = this.#actions.get(colData.action);
            if(!Action) {
                throw new Error(`PostMapper::#handleRow/Actions: no Action by name ${colData.action}`);
            }

            /**
             * @type {Transaction_}
             */
            const colTransaction =  await Action(this, colData.payload, this.#rootTransactionsContainers);
            if(rowTransactions.has(colName)) {
                throw new Error(`PostMapper::#handleRow: transaction <${colName}> is already exist`);
            }

            // ----------------------------------

            rowTransactions.set(colName, colTransaction);
        }

        return rowTransactions;
    }

    /**
     * 
     * @description 
     * this probably will be deprecated
     * becose these all Actions at firs time
     * must provided as Dependencies
     * 
     * @param {string} actionName 
     * @param {ActionHandler} handler 
     */
    registrateAction (actionName, handler) {
        this.#actions.set(actionName, handler);
    }

    /**
     * @type {Map<string,Transaction_>}
     */
    #transactions;

    /**
     * @type {Map<string,ActionHandler}
     */
    #actions;

    /**
     * @type {Map<string,TransactionsContainer>}
     */
    #rootTransactionsContainers;

    /**
     * 
     */
    /**
     * @type {Map<string,DBAdapter>}
     */
    #dbControllersRouter;

    /**
     * 
     * @param {Object} deps 
     * @param {ActionHandler} deps.fileAction 
     * @param {ActionHandler} deps.dataAction
     * @param {ActionHandler} deps.linkAction
     * @param {Map<string,DBAdapter>} deps.dbControllersRouter
     * @throws {Error} - PostMapper: all the Actions required
     */
    constructor (deps={}) {

        // util deps

        const fileActionHandler = deps.fileAction;
        const dataActionHandler = deps.dataAction;
        const linkActionHandler = deps.linkAction;

        // service deps

        const dbControllersRouter = deps.dbControllersRouter;
        // const fileManager = deps.fileManager; // filemanager proivded locally in the FileAction

        // --- validate the dependencies

        if(!fileActionHandler || !dataActionHandler || !linkActionHandler) {
            throw new Error(`PostMapper::constructor: all the util Actions dependencies required`);
        }

        this.#actions = new Map();
        this.#actions.set('file', fileActionHandler);
        this.#actions.set('data', dataActionHandler);
        this.#actions.set('link', linkActionHandler);

        if(!dbControllersRouter || /* !fileManager */false) {
            throw new Error(`PostMapper::constructor: all the service dependencies required `);
        }dbControllersRouter
        
        this.#dbControllersRouter = deps.dbControllersRouter;

        this.#transactions = new Map();

        this.#rootTransactionsContainers = new Map();

        this.#eventListeners = new Map();
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
     * @type {(context:PostMapper,payload:Buffer<ArrayBuffer>) => Promise<any> } payload
     * @throws {Error} - FileAction: payload shuld be instance of the Buffer
    */
    const FileAction = async (context, payload) => {

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
     * @param {PostMapper} context - global context
     * @param {Object} payload 
     * @param {Object} payload.tableName 
     * @param {Object} payload.groupId
     * @param {Map<string,TransactionsContainer>} rootTransactions 
     * @returns {Transaction_}
     */
    const LinkAction = async (context, payload, rootTransactions) => {

        const transaction = new Transaction_();

        if(!payload.tableName || false) {
            throw new Error(`LinkAction: payload.tableName required`);
        }

        if(!payload.groupId || false) {
            throw new Error(`LinkAction: payload.groupId required`);
        }

        const tableName = payload.tableName;
        const groupId = payload.groupId;

        // console.log(`LinkAction/arguments` , {payload, transactions, tableName, groupId});
        
        const targetContainer = rootTransactions.get(payload.tableName)?.getChildContainer(payload.groupId);
        
        // console.log(`LinkAction/check transactions root Map: `, {transactions});
        if (!targetContainer) {

            /**
             * 
             * @param {{groupIdContainer:TransactionsContainer;tableName:string}} context 
             */
            const eventHandler = (context) => {
                
                const { groupIdContainer, tableName } = context || {};

                if(!groupIdContainer/*  || !tableName */) {
                    console.log('PostMapper',{context});
                    throw new Error(`PostMapper/setRootContainer-listener: both of context.groupContainer and context.tableName required`);
                } 

                if(groupIdContainer.getName() === `${payload.tableName}/${payload.groupId}`) {
                    
                    groupIdContainer.addListener('commit', (payload) => {

                        
    
                        const { container:targetContainer } = payload;
    
                        console.log('eventhandler666', {targetContainer});

                        const containerState = {
                            state:targetContainer.getState(),
                            data:targetContainer.getData(),
                            contName:targetContainer.getName(),
                        }
                        
                        console.log(`LinkAction/target-container-state: `, {containerState, targetContainer});
    
                        if(containerState.state === 'committed') {
                            transaction.setData(containerState.data);
                            transaction.setState("ready");
                            // throw new Error(`666`);
                        }

                        
                    });
                }
            }

            context.addListener("setGroupIdContainer", eventHandler);

            transaction.setState("pending");

            return transaction;
        }

        // console.log(`LinkAction/check target container: `, targetContainer);

        const containerState = {
            state:targetContainer.getState(),
            data:targetContainer.getData(),
            contName:targetContainer.getName(),
        }
        
        console.log(`LinkAction/target-container-state: `, {containerState, targetContainer});

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

    /**
     * 
     * @param {PostMapper} context - global context 
     * @param {Object} payload 
     * @returns 
     */
    const DataAction = async (context, payload) => {
    
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

    /**
     * @type {Map<string,(n:any) => any>}
     */
    #eventLiseners;

    /**
     * 
     * @param {string} eventName 
     * @param {(n:any) => any} handler 
     */
    addListener(eventName, handler) {
        this.#eventLiseners.set(eventName, handler);
        console.log('added listener', {eventName, handler});
        // throw new Error(`add listener`);
    }

    emit(eventName, context) {
        
        for (const [listenerEventName, handler] of this.#eventLiseners.entries()) {
            if(eventName === listenerEventName) {
                handler(context);
                return;
            }
        }
    }

    getName() {
        return this.#containerName;
    }

    addCommitter(handler) {
        console.log(`TransactionsContainer::addCommitHandler`, handler);
        this.#commitHandler = handler;
    }

    async commit() {

        const transactionsData = {};

        // validate local transactions

        
        let someOneIsNotReady = false;
        for (const [name, transaction] of this.#localTransactions.entries()) {

            const state = transaction.getState();
            const data = transaction.getData();
            
            console.log(`TransactionsContainer::commit/state` , {state, data});
            if(state !== "ready") {
                someOneIsNotReady = true;
                if(state === "rejected") {
                    this.#state = "rejected";
                    throw new Error (`TransactionsContainer::commit: one of transactions is rejected; name='${name}' state='${state}'`);
                }
                else if (state === "pending") {
                    continue;
                }
            }

            transactionsData[name] = data;
            
        }

        if(someOneIsNotReady) {
            this.#state = "pending";
            throw new Error(`TransactionsContainer::commit/some one is not ready`);
        }

        console.log(`TransactionsContainer::commit/try to commit`);

        /**
         * @type {{success?:SuccessCommitterReturnContsistentData;error?:Object}}
         */
        const commitHandlerResult = await this.#commitHandler(transactionsData);

        
        if(commitHandlerResult.error) {
            console.log(`TransactionsContainer::commit/failed: got error`, {commitResult: commitHandlerResult});
            this.#data = null;
            this.#state = 'rejected';
            return;
        }
        
        if(!commitHandlerResult.success) {
            console.log(`TransactionsContainer::commit/failed: got no success`, {commitResult: commitHandlerResult});
            this.#data = null;
            this.#state = 'rejected';
            return;
        }
        
        

        /**
         * сохраняем данные успешного коммита группы
         */
        this.#data  = {
            rowId:commitHandlerResult.success.rowId,
            tableName:commitHandlerResult.success.tableName,
        };

        this.#state = 'committed';

        this.emit('commit', {container:this});

        console.log(`\x1b[31mTransactionsContainer::commit: successfully committed\x1b[0m`, {transactionsData, commitResult: commitHandlerResult});
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

        this.#eventLiseners = new Map();
    }
}