const {
    filemanager,
} = require('../../../services/filemanager.service.js/fmanager.controller');
const { PostMapper } = require('./post-mapper.model');
const {
    StateContainerFactory: SetRollBackContainerFactory,
    StateContainerFactory: StateRollBackContainerFactory,
    StateContainerFactory,
} = require('./transactions/transaction.controller');
const { StateContainer: StateRollBackContainer, StateContainer } = require('./transactions/transaction.model');

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
                StateContainerFactory: new SetRollBackContainerFactory(),
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
        StateContainerFactory: new StateRollBackContainerFactory(),
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
 * @param {StateContainerFactory} deps.StateContainerFactory
 * @returns {(payload:Object) => Promise<any>}
 */
function LinkActionFactory(deps = {}) {
    const StateContainerFactory = deps.StateContainerFactory;

    if (!deps.StateContainerFactory) {
        throw new Error();
    }

    // console.log(`Link action`, { payload });

    /**
     *
     * @param {Object} payload
     * @param {Object} payload.tableName
     * @param {Object} payload.groupId
     * @returns {StateContainer}
     */
    const LinkAction = async (payload) => {
        /**
         * @description
         * контейнер для обрабатываемго поля
         */
        const CurrentContainer = StateContainerFactory.create();

        /**
         *
         * @param {import('./transactions/transaction.model').PreCommitActionController} ContainerInterface
         * @param {Object} deps
         * @param {Map<string,StateContainer>} deps.globalContainers
         */
        const ContainerActionCallBack = (ContainerInterface, deps) => {
            // /**
            //  * @type {Map<string,StateContainer>}
            //  */
            // const globalContainers = deps;

            const targetContainerKey = `${payload.tableName}/${payload.groupId}`;
            const targetContainer = deps.globalContainers.get(targetContainerKey);

            if (!targetContainer) {
                console.log('link payload', {
                    payload,
                    globalContainers:deps.globalContainers,
                    targetContainer,
                });

                ContainerInterface.setState(
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
                ContainerInterface.setState('done', 'target container is "done"');
                ContainerInterface.setData(targetContainerData);
                return;
            }

            if (targetContainerState.value === 'rejected') {
                ContainerInterface.setState(
                    'rejected',
                    'target container is rejected, and current must be too'
                );
                ContainerInterface.setData(null);
                return;
            }

            ContainerInterface.setState(
                'pending',
                'target container is pending, and current must be too'
            );
            ContainerInterface.setData(null);
        };

        CurrentContainer.setAction('main', ContainerActionCallBack);

        // transaction.setRollBack('main', () => {
        //     // console.log('link main rollback');
        // });

        return CurrentContainer;
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


    /**
     * 
     * @param {Buffer<ArrayBuffer>} payload 
     * @returns {(payload:Buffer<ArrayBuffer>) => Promise<any>}
     */
    const FileAction = async (payload) => {

        const LeafActionArgs = {
            FileData:payload,
        }

        console.log('FileAction/args: ', LeafActionArgs);

        const LeafStateContainer = rollBackContainerFactory.create();

        /**
         *
         * @param {import('./transactions/transaction.model').PreCommitActionController} ContainerInterface
         * @param {Object} deps
         * @param {Map<string,StateContainer>} deps.globalContainers
         */
        const StateContainerAction = async (StateContainerInterface, deps = {}) => {
           
            const fileManagerResult = await filemanager.write(LeafActionArgs.FileData);

            if (fileManagerResult.error) {
                StateContainerInterface.setState(StateContainer.States.Rejected);
                throw new Error(1);
                return;
            }

            if (!fileManagerResult.success) {
                StateContainerInterface.setState(StateContainer.States.Rejected);
                throw new Error(2);
                return;
            }

            StateContainerInterface.setState(StateContainer.States.Done);
            StateContainerInterface.setData(fileManagerResult.success.filename);
            console.log('fmresult', fileManagerResult);

            StateContainerInterface.setRollBack('main', async () => {
                await filemanager.delete(fileManagerResult.success.filename);
            });
        };

        LeafStateContainer.setAction('main', StateContainerAction);

        return LeafStateContainer;
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

        transaction.setAction('main', (controller, deps) => {
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
