const { FileManager } = require('../../../services/filemanager.service.js/filemanager.service');
const {
    filemanager,
} = require('../../../services/filemanager.service.js/fmanager.controller');
const { PostMapper } = require('./post-mapper.model');
const {
    StateContainerFactory: StateContainerFactory,
} = require('./transactions/transaction.controller');
const { StateContainer } = require('./transactions/transaction.model');

const LeafContainerActionFactories = {
    FileLeafAction: FileLeafStateContainerActionFactory,
    LinkLeafAction: LinkLeafStateContainerActionFactory,
    DataLeafAction: () => (controller, deps) => {
        controller.setData(
            payload instanceof Buffer ? payload.toString('utf-8') : payload
        );
        controller.setState('done');

        controller.setRollBack('main', async () => {
            console.log(`Container/test rollback`);
        });
    },
};

/**
 * @throws {Error} - PostMapperDIContainer: PostMapper required
 */
class PostMapperDIContainer {
    getPostMapper() {
        return new PostMapper({
            dataAction: DataActionFactory({
                StateContainerFactory: new StateContainerFactory(),
                StateContainerActionFactory:
                    LeafContainerActionFactories.DataLeafAction,
            }),
            fileAction: FileActionFactory({
                StateContainerFactory: new StateContainerFactory(),
                StateContainerActionFactory:
                    LeafContainerActionFactories.FileLeafAction,
            }),
            linkAction: LinkActionFactory({
                StateContainerFactory: new StateContainerFactory(),
                StateContainerActionFactory:
                    LeafContainerActionFactories.LinkLeafAction,
            }),
            stateRollBackContainerFactory:
                LeafContainerActionFactories.StateContainer(),
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
        StateContainerFactory: new StateContainerFactory(),
    }),
    FileAction: FileActionFactory({
        StateContainerFactory: new StateContainerFactory(),
    }),
    DataAction: DataActionFactory({
        StateContainerFactory: new StateContainerFactory(),
    }),
    LinkActionFactory,
    FileActionFactory,
    DataActionFactory,
};

/**
 *
 * @param {Object} deps
 * @param {StateContainerFactory} deps.StateContainerFactory
 * @returns {(payload:Object)=> Promise<any>} - Leaf Action
 */
function LinkActionFactory(deps = {}) {
    const StateContainerFactory = deps.StateContainerFactory;

    if (!deps.StateContainerFactory) {
        throw new Error();
    }

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
            const targetContainer =
                deps.globalContainers.get(targetContainerKey);

            if (!targetContainer) {
                console.log('link payload', {
                    payload,
                    globalContainers: deps.globalContainers,
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
                ContainerInterface.setState(
                    'done',
                    'target container is "done"'
                );
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

        return CurrentContainer;
    };

    return LinkAction;
}

/**
 *
 * @param {Object} deps
 * @param {StateContainerFactory} deps.StateContainerFactory
 * @returns {(payload:Object)=> Promise<any>} - Leaf Action
 */
function FileActionFactory(deps = {}) {
    const StateContainerFactory = deps.StateContainerFactory;

    if (!StateContainerFactory) {
        throw new Error(`deps.StateContainerFactory required`);
    }

    /**
     *
     * @param {Buffer<ArrayBuffer>} payload
     * @returns {(payload:Buffer<ArrayBuffer>) => Promise<any>}
     */
    const FileAction = async (payload) => {
        const LeafActionArgs = {
            FileData: payload,
        };

        console.log('FileAction/args: ', LeafActionArgs);

        const LeafStateContainer = StateContainerFactory.create();

        /**
         *
         * @param {import('./transactions/transaction.model').PreCommitActionController} ContainerInterface
         * @param {Object} deps
         * @param {Map<string,StateContainer>} deps.globalContainers
         */
        const StateContainerAction = async (
            StateContainerInterface,
            deps = {}
        ) => {
            const fileManagerResult = await filemanager.write(
                LeafActionArgs.FileData
            );

            if (fileManagerResult.error) {
                StateContainerInterface.setState(
                    StateContainer.States.Rejected
                );
                throw new Error(1);
                return;
            }

            if (!fileManagerResult.success) {
                StateContainerInterface.setState(
                    StateContainer.States.Rejected
                );
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
 * @param {StateContainerFactory} deps.StateContainerFactory
 * @returns {(payload:Object)=> Promise<any>} - Leaf Action
 */
function DataActionFactory(deps = {}) {
    const StateContainerFactory = deps.StateContainerFactory;

    if (!StateContainerFactory) {
        throw new Error(`deps.StateContainerFactory required`);
    }

    const DataAction = async (payload) => {
        const LeafStateContainer = StateContainerFactory.create();

        LeafStateContainer.setAction('main', (controller, deps) => {
            controller.setData(
                payload instanceof Buffer ? payload.toString('utf-8') : payload
            );
            controller.setState('done');

            controller.setRollBack('main', async () => {
                console.log(`Container/test rollback`);
            });
        });

        return LeafStateContainer;
    };

    return DataAction;
}

function LinkLeafStateContainerActionFactory() {


    /**
     * 
     * @param {{}} ContainerInterface 
     * @param {Object} deps 
     * @returns 
     */
    const fn = (ContainerInterface, deps) => {
        
        const targetContainerKey = `${payload.tableName}/${payload.groupId}`;
        const targetContainer = deps.globalContainers.get(targetContainerKey);

        if (!targetContainer) {
            console.log('link payload', {
                payload,
                globalContainers: deps.globalContainers,
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

    return fn;
}

/**
 * 
 * @param {Object} deps 
 * @param {FileManager} deps.filemanager 
 * @param {Object} deps 
 * @returns 
 */
function FileLeafStateContainerActionFactory(deps) {
    
    if (!deps.filemanager) {
        throw new Error(`deps.filemanager required`);
    }

    /**
     * 
     * @param {*} StateContainerInterface 
     * @param {Object} deps 
     * @returns 
     */
    const fn = async (StateContainerInterface, deps = {}) => {
        const fileManagerResult = await filemanager.write(
            LeafActionArgs.FileData
        );



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

    return fn;
}
