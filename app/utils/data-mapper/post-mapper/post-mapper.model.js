const {
    dbControllersRouter,
} = require('../../../services/database-adapter/controller/db-adapter.controller');
const {
    DBAdapter,
} = require('../../../services/database-adapter/models/db-adapter.model');
const {
    StateContainerController: StateRollBackContainerFactory,
} = require('./transactions/transaction.controller');
const { StateContainer } = require('./transactions/transaction.model');
// const {
//     StateContainer: StateContainer,
// } = require('./transactions/transaction.model');
// const {
//     TransactionsContainer,
// } = require('./transactions/transactios-container.model');

class PostMapper {
    async processDataSet(data) {
        const DevVars = {
            ConsoleLog: {
                index: 0,
            },
        };

        // -------------------------------------

        const Flags = {};

        const Buffer = {
            Conrainers: {
                Pended: [],
            },
        };

        for (const [tableName, groups] of Object.entries(data)) {
            for (const [groupId, groupColumns] of Object.entries(groups)) {
                // structs of the iteration

                const ProcessedGroup = {
                    Container: await this.#processGroup(
                        groupColumns,
                        tableName
                    ),
                };

                const ContainersAddresses = {
                    Group: `${tableName}/${groupId}`,
                };

                // ====================================

                let id = ContainersAddresses.Group;
                this.#globalPull.containers.set(id, ProcessedGroup.Container);

                await ProcessedGroup.Container.preCommit(
                    this.#globalPull.containers
                );

                const PrecommittedGroupContainerSnapShot = {
                    state: ProcessedGroup.Container.getState(),
                    data: ProcessedGroup.Container.getData(),
                };

                if (
                    PrecommittedGroupContainerSnapShot.state.value ===
                    StateContainer.States.Pending
                ) {
                    /**
                     *
                     * устанавливаем executor для еще одной попытки
                     */
                    Buffer.Conrainers.Pended.push(async () => {
                        const container = ProcessedGroup.Container;
                        await container.preCommit(this.#globalPull.containers);
                        console.log('one more try: ', {
                            value: container.getState().value,
                            message: container.getState().message,
                            data: container.getData(),
                        });
                    });
                }

                // ----------- console log -----------

                console.log(
                    ++DevVars.ConsoleLog.index + ') post pre commit result: ',
                    {
                        state: PrecommittedGroupContainerSnapShot.state,
                        data: PrecommittedGroupContainerSnapShot.data,
                    }
                );

                // -----------------------------------
            }
        }

        for (const executor of Buffer.Conrainers.Pended) {
            await executor();
        }
    }

    /**
     *
     * @param {Object.<string,Object>} tableRowDataSet
     * @param {string} dbTableName
     * @returns
     */
    async #processGroup(tableRowDataSet, dbTableName) {
        /**
         * @description
         * represent the row and provide util interface
         */
        const currentRowContainer = this.#StateContainerFactory.create();

        const Buffer = {
            GroupContainer: '',
        };

        /**
         * @description
         * для каждой DB колонки создается отдельный контейнер
         * и пушится в этот буффер
         * @type {Map<string,StateCon>}
         */
        const rowContainersBuffer = new Map();

        for (const [
            columnName,
            { action: columnActionName, payload: columnActionPayload },
        ] of Object.entries(tableRowDataSet)) {
            const ColumnPayloadlAction = this.#actions.get(columnActionName);
            if (!ColumnPayloadlAction) {
                throw new Error(
                    `PostMapper::process/action: action not received`
                );
            }

            /**
             * @type {StateContainer}
             */
            const currentRowColumnContainer =
                await ColumnPayloadlAction(columnActionPayload);

            rowContainersBuffer.set(columnName, currentRowColumnContainer);
        }

        /**
         * у контейнеров есть метод preCommit
         * который вызывает его Экшны, а те, в свою очередь, дочерние экшны
         */
        currentRowContainer.setAction(
            'main',
            rowContainerActionFactory({
                groupContainers: this.#globalPull.containers,
                rowContainers: rowContainersBuffer,
                tableName: dbTableName,
            })
        );

        return currentRowContainer;
    }

    getResult() {
        const dataPull = {};

        for (const [address, container] of this.#globalPull.containers) {
            dataPull[address] = container.getData();
        }

        return dataPull;
    }

    /**
     * @type {{
     *  containers:Map<string,StateContainer>;
     * }}
     */
    #globalPull;

    /**
     * @type {Map<string,() => Promise<StateContainer>>}
     */
    #actions;

    /**
     * @type {StateRollBackContainerFactory}
     */
    #StateContainerFactory;

    /**
     * @type {{
     *  StateContainer:StateRollBackContainerFactory;
     * }}
     */
    #factories;

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
            throw new Error('File-Action required');
        }
        if (!linkAction) {
            throw new Error('Link-Action required');
        }
        if (!dataAction) {
            throw new Error('Data-Action required');
        }

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

        this.#StateContainerFactory = stateRollBackContainerFactory;

        this.#factories = {
            StateContainer: stateRollBackContainerFactory,
        };

        // ------------ structs -----------------

        this.#globalPull = {
            containers: new Map(),
        };
    }
}

module.exports = { PostMapper };

/**
 * @example
 *
 * will be
 *
 * @param {Object} deps
 * @param {Map<string,StateContainer>} deps.groupContainers - global containers
 * @param {Map<string,StateContainer>} deps.rowContainers - represent db-columns containers
 * @param {string} deps.tableName
 * @returns {(controller:import('./transactions/transaction.model').PreCommitActionController) => Promise<any>}
 */
function rowContainerActionFactory(deps = {}) {
    const groupContainers = deps.groupContainers;
    const rowContainers = deps.rowContainers;
    const tableName = deps.tableName;

    /**
     *
     * @param {import('./transactions/transaction.model').PreCommitActionController} parentContainerController
     * @returns
     */
    const RowContainerAction = async (parentContainerController) => {
        /**
         * @type {Object.<string,any>}
         * @description
         * buffer для накопления подготовленных данных перед отправкой в DataBase
         */
        const dataBaseDataSetBuffer = {};

        /**
         *
         */
        let isDoneFlag = true;

        /**
         *
         */
        for (const [
            columnContainerName,
            columnContainer,
        ] of rowContainers.entries()) {
            await columnContainer.preCommit(groupContainers);

            /**
             * @type {import('./transactions/transaction.model').ContainerState}
             */
            const colContainerState = columnContainer.getState();

            /**
             *
             */
            const colContainerData = columnContainer.getData();

            dataBaseDataSetBuffer[columnContainerName] = colContainerData;

            // console.log('PostMapper::handleRow/setAction/column state: ', {colContainerName,colContainerState, colContainerData});
            /**
             * если хотя бы одна колонка реджекнутая, то
             * весь data-set идет в брак
             */
            if (colContainerState.value === 'rejected') {
                isDoneFlag = false;
                parentContainerController.setState(
                    'rejected',
                    'some one column is rejected'
                );
                return;
            }

            /**
             * если хотя бы одно поле "pending",
             * то весь data-set идет в пендинг
             * как это делается:
             * устанавливается флаг `isDone = false`
             */
            if (colContainerState.value === 'pending') {
                console.log(
                    'colContainerState.message',
                    colContainerState.message
                );
                isDoneFlag = false;
            }

            console.log('column pre-commit state: ', {
                colName: columnContainerName,
                st: colContainerState,
            });
        }

        /**
         * @description
         * если мы дошли до этого места и флаг `isDoneFlag` установлен как `false`,
         * это значит `rejected` небыло,
         * но были `pending`
         */
        if (isDoneFlag === false) {
            parentContainerController.setState('pending', 'someone pending');
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

        if (!dbAdapter) {
            parentContainerController.setState('rejected', 'db name error');
            parentContainerController.setData(null);
            throw new Error();
            return;
        }

        // пробуем сохраниться
        const dbAdapterResult = dbAdapter.createOne(dataBaseDataSetBuffer);
        // console.log({dbAdapterResult});
        // throw new Error();

        if (dbAdapterResult.error) {
            /*  */
            parentContainerController.setState(
                'rejected',
                'db storring failed'
            );
            parentContainerController.setData(null);
            throw new Error();
            return;
        }

        if (!dbAdapterResult.success) {
            /* системная ошибка,- по каой-то причине не поля "success"*/
            parentContainerController.setState('rejected', 'internal db error');
            parentContainerController.setData(null);
            throw new Error();
            return;
        }

        // --------------------------------------
        // успешно
        console.log('database data-set', {
            dataBaseDataSet: dataBaseDataSetBuffer,
        });
        //---------------------------------------

        parentContainerController.setState('done', 'data was stored in the DB');
        parentContainerController.setData({
            rowId: dbAdapterResult.success.newRowIdHash,
            tableName: tableName,
        });
    };

    return RowContainerAction;
}
