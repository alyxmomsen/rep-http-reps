const {
    filemanager,
} = require('../../../services/filemanager.service.js/fmanager.controller');
const { PostMapper } = require('./post-mapper.model');
const {
    StateContainerController: SetRollBackContainerFactory,
    StateContainerController: StateRollBackContainerFactory,
} = require('./transactions/transaction.controller');
const { StateContainer: StateRollBackContainer } = require('./transactions/transaction.model');

/**
 * @throws {Error} - PostMapperDIContainer: PostMapper required
 */
class PostMapperDIContainer {
    getPostMapper() {
        return new PostMapper({
            dataAction: DataActionFactory({
                rollBackContainerFactory: new SetRollBackContainerFactory(),
            }),
            fileAction: FileActionFactory({
                rollBackContainerFactory: new SetRollBackContainerFactory(),
            }),
            linkAction: LinkActionFactory({
                rollBackContainerFactory: new SetRollBackContainerFactory(),
            }),
            stateRollBackContainerFactory: new SetRollBackContainerFactory(),
        });
    }

    /**
     * @type {PostMapper}
     */
    #postMapper;

    constructor(deps = {}) {}
}

const postMapperDIContainer = new PostMapperDIContainer({});

module.exports = {
    postMapperDIContainer,
    LinkAction: LinkActionFactory({
        rollBackContainerFactory: new StateRollBackContainerFactory(),
    }),
    FileAction: FileActionFactory({
        rollBackContainerFactory: new StateRollBackContainerFactory(),
    }),
    DataAction: DataActionFactory({
        rollBackContainerFactory: new StateRollBackContainerFactory(),
    }),
    LinkActionFactory,
    FileActionFactory,
    DataActionFactory,
};

/**
 *
 * @param {Object} deps
 * @param {StateRollBackContainerFactory} deps.rollBackContainerFactory
 * @returns (payload:Object) => Promise<any>
 */
function LinkActionFactory(deps = {}) {
    const containerFactory = deps.rollBackContainerFactory;

    if (!containerFactory) {
        throw new Error();
    }

    // console.log(`Link action`, { payload });

    /**
     *
     * @param {Object} payload
     * @returns
     */
    const LinkAction = async (payload) => {
        /**
         * @description
         * контейнер для обрабатываемго поля
         */
        const columnContainer = containerFactory.create();

        /**
         *
         * @param {import('./transactions/transaction.model').PreCommitActionController} controller
         * @param {*} deps
         */
        const preCommitAction = (controller, deps) => {
            /**
             * @type {Map<string,StateRollBackContainer>}
             */
            const globalContainers = deps;

            const targetContainerKey = `${payload.tableName}/${payload.groupId}`;
            const targetContainer = globalContainers.get(targetContainerKey);

            if (!targetContainer) {
                console.log('link payload', {
                    payload,
                    globalContainers,
                    targetContainer,
                });

                controller.setState(
                    'pending',
                    `no target container ${targetContainerKey}`, // пока что пометка для разработки,
                    // но каждый случай можно закодировать для дальнейшего использования в системе
                    targetContainerKey // пока что я сохраняю ключ целевого контейнера для повторной попытки.
                );
                return;
            }

            // console.log('link payload check', {
            //     payload,
            //     globalContainers,
            //     targetContainer,
            //     targetContainerData:targetContainer.getData(),
            // });

            // ===================================================

            /**
             *
             *
             *
             *
             */

            // ===================================================

            const targetContainerState = targetContainer.getState();
            const targetContainerData = targetContainer.getData();

            console.log('LinkAction/columnContainerAction/tar cont state: ', {
                targetContainerState,
                targetContainerData,
            });

            if (targetContainerState.value === 'done') {
                controller.setState('done', 'target container is "done"');
                controller.setData(targetContainerData);
                return;
            }

            if (targetContainerState.value === 'rejected') {
                controller.setState(
                    'rejected',
                    'target container is rejected, and current must be too'
                );
                controller.setData(null);
                return;
            }

            controller.setState(
                'pending',
                'target container is pending, and current must be too'
            );
            controller.setData(null);
        };

        columnContainer.setAction('main', preCommitAction);

        // transaction.setRollBack('main', () => {
        //     // console.log('link main rollback');
        // });

        return columnContainer;
    };

    return LinkAction;
}

/**
 *
 * @param {Object} deps
 * @param {StateRollBackContainerFactory} deps.rollBackContainerFactory
 * @returns
 */
function FileActionFactory(deps = {}) {
    const rollBackContainerFactory = deps.rollBackContainerFactory;

    if (!rollBackContainerFactory) {
        throw new Error();
    }

    const FileAction = async (payload) => {
        const columnContainer = rollBackContainerFactory.create();

        /**
         *
         * @param {import("./transactions/transaction.model").PreCommitActionController} controller
         * @param {Object} deps
         */
        const preCommitAction = async (controller, deps = {}) => {
            const { success, error } = await filemanager.write(payload);

            if (error) {
                controller.setState('rejected');
                throw new Error(1);
                return;
            }

            if (!success) {
                controller.setState('rejected');
                throw new Error(2);
                return;
            }

            controller.setState('done');
            controller.setData(success.filename);
            console.log('fmresult', { success });

            controller.setRollBack('main', async () => {
                await filemanager.delete(success.filename);
            });
        };

        columnContainer.setAction('main', preCommitAction);

        return columnContainer;
    };

    return FileAction;
}

/**
 *
 * @param {Object} deps
 * @param {SetRollBackContainerFactory} deps.rollBackContainerFactory
 * @returns (payload:Object)=> Promise<any>
 */
function DataActionFactory(deps = {}) {
    const rollBackContainerFactory = deps.rollBackContainerFactory;

    if (!rollBackContainerFactory) {
        throw new Error();
    }

    const DataAction = async (payload) => {
        const transaction = rollBackContainerFactory.create();

        transaction.setAction('main', (controller) => {
            controller.setData(
                payload instanceof Buffer ? payload.toString('utf-8') : payload
            );
            controller.setState('done');

            controller.setRollBack('main', async () => {
                console.log(`Container/test rollback`);
            });
        });

        return transaction;
    };

    return DataAction;
}
