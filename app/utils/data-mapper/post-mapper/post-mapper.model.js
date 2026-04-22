const {
    dbControllersRouter,
} = require('../../../services/database-adapter/controller/db-adapter.controller');
const {
    DBAdapter,
} = require('../../../services/database-adapter/models/db-adapter.model');
const {
    StateContainerFactory,
} = require('./transactions/transaction.controller');

const { StateContainer } = require('./transactions/transaction.model');

const Factories = {
    GroupContainerAction: GroupContainerActionFactory,
};

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
                        // console.log('one more try: ', {
                        //     value: container.getState().value,
                        //     message: container.getState().message,
                        //     data: container.getData(),
                        // });
                    });
                }

                // ----------- console log -----------

                // console.log(
                //     ++DevVars.ConsoleLog.index + ') post pre commit result: ',
                //     {
                //         state: PrecommittedGroupContainerSnapShot.state,
                //         data: PrecommittedGroupContainerSnapShot.data,
                //     }
                // );

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
        const Args = {
            TableRowDataSet: tableRowDataSet,
            dbTableName: dbTableName,
        };

        const CurrentGroup = {
            /**
             * @description
             * represent the row and provide util interface
             */
            Container: this.#factories.StateContainer.create(),
        };

        const Buffers = {
            /**
             * @description
             * для каждой DB колонки создается отдельный контейнер
             * и пушится в этот буффер
             * @type {Map<string,StateContainer>}
             */
            GroupContainersPull: new Map(),
        };

        for (const [
            tableColumnName,
            { action: leafActionName, payload: leafActionPayload },
        ] of Object.entries(Args.TableRowDataSet)) {
            const IterationState = {
                tableColumnName: tableColumnName,
                leafActionName: leafActionName,
                leafActionPayload: leafActionPayload,
            };

            const LeafPropertyAction =
                this.#Actions[IterationState.leafActionName];
            if (!LeafPropertyAction) {
                throw new Error(
                    `PostMapper::process/action: action not received`
                );
            }

            /**
             * @type {{LeafStateContainer:StateContainer}}
             */
            const LeafActionResult = {
                LeafStateContainer: await LeafPropertyAction(
                    IterationState.leafActionPayload
                ),
            };

            Buffers.GroupContainersPull.set(
                IterationState.tableColumnName,
                LeafActionResult.LeafStateContainer
            );
        }

        /**
         * у контейнеров есть метод preCommit
         * который вызывает его Экшны, а те, в свою очередь, дочерние экшны
         */
        CurrentGroup.Container.setAction(
            'main',
            Factories.GroupContainerAction({
                globalContainersPull: this.#globalPull.containers,
                groupLeafsContainers: Buffers.GroupContainersPull,
                DBTableName: Args.dbTableName,
            })
        );

        return CurrentGroup.Container;
    }

    getGlobalContainersPullStates() {
        const dataSet = {};

        for (const [address, container] of this.#globalPull.containers) {
            dataSet[address] = container.getData();
        }

        return dataSet;
    }

    /**
     * @type {{
     *  containers:Map<string,StateContainer>;
     * }}
     */
    #globalPull;

    /**
     * @type {{
     *  file:() => Promise<StateContainer>;
     *  link:() => Promise<StateContainer>;
     *  data:() => Promise<StateContainer>;
     * }}
     */
    #Actions;

    /**
     * @type {StateContainerFactory}
     */
    #StateContainerFactory;

    /**
     * @type {{
     *  StateContainer:StateContainerFactory;
     * }}
     */
    #factories;

    /**
     *
     * @param {Object} deps
     * @param {Function} deps.fileAction
     * @param {Function} deps.linkAction
     * @param {Function} deps.dataAction
     * @param {StateContainerFactory} deps.stateRollBackContainerFactory
     * @param {{
     *  Group:Object;
     * }} deps.containerActionFactories
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

        this.#Actions = {
            file: fileAction,
            link: linkAction,
            data: dataAction,
        };

        // services deps

        const stateRollBackContainerFactory =
            deps.stateRollBackContainerFactory;

        if (!stateRollBackContainerFactory) {
            throw new Error(
                `PostMapper::constructor: SetRollBackContainerFactory required`
            );
        }

        this.#StateContainerFactory = stateRollBackContainerFactory;

        // set factories

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
 * @param {Map<string,StateContainer>} deps.globalContainersPull - global containers
 * @param {Map<string,StateContainer>} deps.groupLeafsContainers - represent db-columns containers
 * @param {string} deps.DBTableName
 * @returns {(controller:import('./transactions/transaction.model').PreCommitActionController) => Promise<any>}
 */
function GroupContainerActionFactory(deps = {}) {
    if (
        !deps.groupLeafsContainers ||
        !deps.globalContainersPull ||
        !deps.DBTableName
    ) {
        throw new Error(`GroupContainerActionFactory: deps required`);
    }

    /**
     *
     * @param {import('./transactions/transaction.model').PreCommitActionController} ServedContainerInterface
     * @returns {Function}
     */
    const StateContainerAction = async (ServedContainerInterface) => {
        // const dataBaseDataSetBuffer = {};

        const LocalDataCache = {
            /**
             * @type {Object.<string,any>}
             * @description
             * buffer для накопления подготовленных данных перед отправкой в DataBase
             */
            DBDataSet: {},
        };

        const Flags = {
            /**
             * @default true
             * @description the flag let to set his state with the 'false'
             * @type {boolean}
             */

            allLeafsIsDone: true,
        };

        /**
         *
         */
        for (const [
            propertyName,
            leafContainer,
        ] of deps.groupLeafsContainers.entries()) {
            const CurrentIteration = {
                propertyName,
                leafContainer,
            };

            // const Leaf = {
            //     Container: leafContainer,
            //     ContainerSnapShot: null,
            // };

            // Leaf.Container.preCommit(deps.globalContainersPull);

            await CurrentIteration.leafContainer.preCommit(
                deps.globalContainersPull
            );

            const LeafContainerSnapshot = {
                /**
                 * @type {import('./transactions/transaction.model').ContainerState}
                 */
                state: CurrentIteration.leafContainer.getState(),
                data: CurrentIteration.leafContainer.getData(),
            };

            LocalDataCache.DBDataSet[CurrentIteration.propertyName] =
                LeafContainerSnapshot.data;

            // console.log('PostMapper::handleRow/setAction/column state: ', {colContainerName,colContainerState, colContainerData});
            /**
             * если хотя бы одна колонка реджекнутая, то
             * весь data-set идет в брак
             */
            if (
                LeafContainerSnapshot.state.value ===
                StateContainer.States.Rejected
            ) {
                Flags.allLeafsIsDone = false;
                ServedContainerInterface.setState(
                    StateContainer.States.Rejected,
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
            if (
                LeafContainerSnapshot.state.value ===
                StateContainer.States.Pending
            ) {
                console.log('LeafContainerSnapshot: ', LeafContainerSnapshot);
                Flags.allLeafsIsDone = false;
            }

            // console.log('column pre-commit state: ', {
            //     colName: CurrentIteration.propertyName,
            //     st: LeafContainerSnapshot.state,
            // });
        }

        /**
         * @description
         * если мы дошли до этого места и флаг `Flags.groupStateIsDone` установлен как `false`,
         * это значит `rejected` небыло,
         * но были `pending` states
         */
        if (Flags.allLeafsIsDone === false) {
            ServedContainerInterface.setState(
                StateContainer.States.Pending,
                'someone is pending'
            );
            return;
        }

        // console.log(`StateContainerAction/state: `, {
        //     groupLeafsContainers: deps.groupLeafsContainers,
        // });

        /**
         *
         * state: leafs state satisfied
         *
         * next step:
         *
         */

        /**
         *
         * сохраняем данные в базе данных
         *
         */
        // --------------------------------------
        /**
         * @type {DBAdapter|undefined}
         */
        const dbAdapter = dbControllersRouter.get(deps.DBTableName);

        if (!dbAdapter) {
            ServedContainerInterface.setState('rejected', 'db name error');
            ServedContainerInterface.setData(null);
            throw new Error();
            return;
        }

        // пробуем сохраниться
        const dbAdapterResult = dbAdapter.createOne(LocalDataCache.DBDataSet);

        if (dbAdapterResult.error) {
            /*  */
            ServedContainerInterface.setState('rejected', 'db storring failed');
            ServedContainerInterface.setData(null);
            throw new Error();
            return;
        }

        if (!dbAdapterResult.success) {
            /* системная ошибка,- по каой-то причине не поля "success"*/
            ServedContainerInterface.setState('rejected', 'internal db error');
            ServedContainerInterface.setData(null);
            throw new Error();
            return;
        }

        // --------------------------------------
        // успешно
        // console.log('database data-set', { Buffer: LocalDataCache });
        //---------------------------------------

        ServedContainerInterface.setState('done', 'data was stored in the DB');
        ServedContainerInterface.setData({
            rowId: dbAdapterResult.success.newRowIdHash,
            tableName: deps.DBTableName,
        });
    };

    return StateContainerAction;
}
