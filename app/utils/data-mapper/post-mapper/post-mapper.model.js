const { dbControllersRouter } = require('../../../services/database-adapter/controller/db-adapter.controller');
const { DBAdapter } = require('../../../services/database-adapter/models/db-adapter.model');
const {
    StateRollBackContainerFactory: StateRollBackContainerFactory,
} = require('./transactions/transaction.controller');
const { StateRollBackContainer } = require('./transactions/transaction.model');
const {
    TransactionsContainer,
} = require('./transactions/transactios-container.model');

class PostMapper {
    
    async process(data) {

        const pendedContainers = [];
        let i = 0;
        for (const [tableName, groups] of Object.entries(data)) {
            for (const [groupId, groupColumns] of Object.entries(groups)) {

                const rowContainer = await this.#handleRow(groupColumns,tableName);
                const groupContainerAddress = `${tableName}/${groupId}`;
                this.#groupContainers.set(groupContainerAddress, rowContainer);

                await rowContainer.preCommit(this.#groupContainers);
                
                const state = rowContainer.getState();
                const data = rowContainer.getData();

                if(state.value === 'pending') {

                    /**
                     * 
                     * устанавливаем executor для еще одной попытки
                     */
                    pendedContainers.push(async () => {
                        const container = rowContainer;
                        await container.preCommit(this.#groupContainers);
                        console.log('one more try: ', {
                            value:container.getState().value , 
                            message:container.getState().message,
                            data:container.getData(),
                        });
                    })
                }


                console.log((++i) + ') post pre commit result: ', {state, data});

                // const rowState = rowTransacton.getState();
                // console.log(
                //     'row state: ',
                //     { tableName, groupId },
                //     { rowState }
                // );
            }
        }

        for (const executor of pendedContainers) {
            await executor();
        }
    }
    

    /**
     * 
     * @param {Object.<string,Object>} groupColumns 
     * @param {string} tableName 
     * @returns 
     */
    async #handleRow(groupColumns, tableName) {
        // const container = new StateRollBackContainer();
        const container = this.#stateRollBackFactory.create();

        /**
         * @type {Map<string,StateRollBackContainer>}
         */
        const rowContainers = new Map();

        for (const [
            colName,
            { action: actionName, payload: actionPayload },
        ] of Object.entries(groupColumns)) {
            const ColumnAction = this.#actions.get(actionName);
            if (!ColumnAction) {
                throw new Error(
                    `PostMapper::process/action: incorrect action key`
                );
            }

            /**
             * @type {StateRollBackContainer}
             */
            const columnContainer = await ColumnAction(actionPayload);

            rowContainers.set(colName, columnContainer);
        }

        container.setAction('main', async (controller) => {

            const dataBaseDataSet = {}

            let isDone = true;
            for (const [colContainerName, colContainer] of rowContainers.entries()) {
                await colContainer.preCommit(this.#groupContainers);

                /**
                 * 
                 */

                /**
                 * @type {import('./transactions/transaction.model').ContainerState}
                 */
                const colContainerState = colContainer.getState();

                /**
                 * 
                */
                const colContainerData = colContainer.getData();
                dataBaseDataSet[colContainerName] = colContainerData;
               
                // console.log('PostMapper::handleRow/setAction/column state: ', {colContainerName,colContainerState, colContainerData});
                /**
                 * если хотя бы одна колонка реджекнутая, то 
                 * весь data-set идет в брак
                 * вы
                 */
                if (colContainerState.value === 'rejected') {
                    isDone = false;
                    controller.setState('rejected', "some one column is rejected");
                    return;
                }

                /**
                 * если хотя бы одно поле "pending", 
                 * то весь data-set идет в пендинг
                 * как это делается: 
                 * устанавливается флаг `isDone = false`
                 */
                if (colContainerState.value === 'pending') {
                    console.log('colContainerState.message',colContainerState.message);
                    isDone = false;
                }

                
                console.log('column pre-commit state: ', { colName: colContainerName, st: colContainerState });
            }

            /**
             * если мы дошли до этого места и флаг установлен как `false`,
             * это значит небыло `rejected`
             * но были `pending`
             */
            if (isDone === false) {
                controller.setState('pending', "someone pending");
                return;
            }

            /**
             * 
             * сохраняем данные в базе данных
             * 
             */
            // --------------------------------------
            /**
             * @type {DBAdapter|undefined}
             */
            const dbAdapter = dbControllersRouter.get(tableName);
            
            if(!dbAdapter) {
                controller.setState("rejected", "db name error");
                controller.setData(null);
                throw new Error();
                return;
            }
            
            // пробуем сохраниться
            const dbAdapterResult = dbAdapter.createOne(dataBaseDataSet);
            // console.log({dbAdapterResult});
            // throw new Error();
            
            if(dbAdapterResult.error) {
                /*  */
                controller.setState("rejected", "db storring failed");
                controller.setData(null);
                throw new Error();
                return;
            }
            
            if(!dbAdapterResult.success) {
                /* системная ошибка,- по каой-то причине не поля "success"*/
                controller.setState("rejected", "internal db error");
                controller.setData(null);
                throw new Error();
                return;
            }

            // --------------------------------------
            // успешно
            //---------------------------------------
            console.log('database data-set', {dataBaseDataSet});
            controller.setState('done', 'data was stored in the DB');
            controller.setData({rowId:dbAdapterResult.success.newRowIdHash,tableName:tableName});

        });

        return container;
    }

    /**
     * @type {Map<string,StateRollBackContainer>}
     */
    #groupContainers;

    /**
     * @type {Map<string,() => any>}
     */
    #actions;

    /**
     * @type {StateRollBackContainerFactory}
     */
    #stateRollBackFactory;
    /**
     *
     * @param {Object} deps
     * @param {Function} deps.fileAction
     * @param {Function} deps.linkAction
     * @param {Function} deps.dataAction
     * @param {StateRollBackContainerFactory} deps.stateRollBackContainerFactory
     */
    constructor(deps = {}) {
        const fileAction = deps.fileAction;
        const linkAction = deps.linkAction;
        const dataAction = deps.dataAction;

        if (!fileAction) {
            // console.log({fileAction});
            throw new Error('File-Action required');
        }
        if (!linkAction) {
            throw new Error('Link-Action required');
        }
        if (!dataAction) {
            throw new Error('Data-Action required');
        }

        console.log('PostMapper::constructor: check actions: ', {
            fileAction,
            linkAction,
            dataAction,
        });

        this.#actions = new Map();

        this.#actions.set('link', linkAction);
        this.#actions.set('file', fileAction);
        this.#actions.set('data', dataAction);

        // services deps

        const stateRollBackContainerFactory =
            deps.stateRollBackContainerFactory;

        if (!stateRollBackContainerFactory) {
            throw new Error(
                `PostMapper::constructor: SetRollBackContainerFactory required`
            );
        }

        this.#stateRollBackFactory = stateRollBackContainerFactory;

        // ------------

        this.#groupContainers = new Map();
    }
}

module.exports = { PostMapper };
