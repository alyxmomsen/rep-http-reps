const { dbControllersRouter } = require('../../../services/database-adapter/controller/db-adapter.controller');
const {
    StateRollBackContainerFactory: StateRollBackContainerFactory,
} = require('./transactions/transaction.controller');
const { StateRollBackContainer } = require('./transactions/transaction.model');
const {
    TransactionsContainer,
} = require('./transactions/transactios-container.model');

class PostMapper {
    

    /**
     *
     * @param {*} tableName
     * @param {*} groupId
     * @param {*} container
     * @returns {TransactionsContainer}
     */
    #setContainer(tableName, groupId, container) {
        const generatedKey = `${tableName}/${groupId}`;

        if (this.#groupContainers.has(generatedKey)) {
            throw new Error(
                `PostMapper::setContainer: key is already exist ${generatedKey}`
            );
        }

        this.#groupContainers.set(generatedKey, container);

        return container;
    }

    
    async process(data) {
        for (const [tableName, groups] of Object.entries(data)) {
            for (const [groupId, groupColumns] of Object.entries(groups)) {

                const rowContainer = await this.#handleRow(groupColumns);
                const groupContainerAddress = `${tableName}/${groupId}`;
                this.#groupContainers.set(groupContainerAddress, rowContainer);

                // await rowTransacton.commit();
                
                // const rowState = rowTransacton.getState();
                // console.log(
                //     'row state: ',
                //     { tableName, groupId },
                //     { rowState }
                // );
            }
        }

        const pended = [];
        const rejected = [];
        const done = [];
        for (const [contName, cont] of this.#groupContainers.entries()) {
            await cont.preCommit();
            const state = cont.getState();
            
            switch (state.value) {
                case "done":
                    done.push(cont);
                    break;
                    case "rejected":
                        rejected.push(cont);
                    break;
                    case "pending":
                    pended.push(cont);
                    break;
                }
                
                // console.log({ finalState: state, contName, pended, rejected, done });
            }

            if (rejected.length) {
            throw new Error();
        }

        if (pended.length) {
            throw new Error()
        }
        
        for (const container of done) {
            const data = container.getData();
            console.log({data});
        }
    }
    
    async #handleRow(groupColumns) {
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
            const DataAction = this.#actions.get(actionName);
            if (!DataAction) {
                throw new Error(
                    `PostMapper::process/action: incorrect action key`
                );
            }

            /**
             * @type {StateRollBackContainer}
             */
            const columnContainer = await DataAction(actionPayload);

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
               
                console.log('PostMapper::handleRow/setAction/column state: ', {colContainerName,colContainerState, colContainerData});
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

            

            console.log('database data-set', {dataBaseDataSet});
            controller.setState('done', 'all is done');
            controller.setData(dataBaseDataSet);

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
