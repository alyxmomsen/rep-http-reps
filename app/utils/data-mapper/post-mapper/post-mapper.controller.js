const {
    filemanager,
} = require('../../../services/filemanager.service.js/fmanager.controller');
const { PostMapper } = require('./post-mapper.model');
const {
    StateRollBackContainerFactory: SetRollBackContainerFactory,
    StateRollBackContainerFactory,
} = require('./transactions/transaction.controller');

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
    const rollBackContainerFactory = deps.rollBackContainerFactory;

    if (!rollBackContainerFactory) {
        throw new Error();
    }

    // console.log(`Link action`, { payload });

    /**
     *
     * @param {Object} payload
     * @returns
     */
    const LinkAction = async (payload) => {
        const transaction = rollBackContainerFactory.create();

        transaction.setAction('main', (controller, deps) => {
            const globalContainers = deps;

            const tarContKey = `${payload.tableName}/${payload.groupId}`;
            const targetContainer = globalContainers.get(tarContKey);

            if (!targetContainer) {
                
                console.log('link payload', {
                    payload,
                    globalContainers,
                    targetContainer,
                });
                controller.setState(
                    'pending',
                    `no target container ${tarContKey}`,
                    tarContKey,
                );
                return;
            }

            console.log('link payload check', {
                payload,
                globalContainers,
                targetContainer,
                targetContainerData:targetContainer.getData(),
            });
            // console.log({ targetContState: targetContainer.getState() });

            controller.setState('done', 'target container is exist');
            controller.setData('datatatatata');
        });

        // transaction.setRollBack('main', () => {
        //     // console.log('link main rollback');
        // });

        return transaction;
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
        // console.log(`File action`, { payload });
        const transaction = rollBackContainerFactory.create();

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

        transaction.setAction('main', preCommitAction);

        return transaction;
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
            
            controller.setData(payload instanceof Buffer? payload.toString('utf-8'): payload);
            controller.setState('done');
            
            controller.setRollBack('main', async () => {
                console.log(`Container/test rollback`);

            });
        });

        return transaction;
    };

    return DataAction;
}
