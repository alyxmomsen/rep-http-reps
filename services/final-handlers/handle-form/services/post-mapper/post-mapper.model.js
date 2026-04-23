class PostMapper {
    /**
     *
     * @param {Object} dataSet
     */
    async process(dataSet) {
        console.log('postmapper process start...');

        const Args = {
            DataSet: dataSet,
        };

        for (const [tableId, Groups] of Object.entries(Args.DataSet)) {
            console.log('cycle');
            for (const [groupId, groupColumns] of Object.entries(Groups)) {
                const CurrentIterationGroup = {
                    StateControllerAddress: `${tableId}/${groupId}`,
                };

                const ProcessedGroup = {
                    StateController: await this.#processGroup(
                        groupColumns,
                        tableId
                    ),
                };

                ProcessedGroup.StateController.try();

                this.#groupStateControllers.set(
                    CurrentIterationGroup.StateControllerAddress,
                    ProcessedGroup.StateController
                );
            }
        }
        console.log('postmapper process end...');
    }

    async #processGroup(groupDataSet, tableId) {
        console.log('process group...');
        const GroupStateController = this.#stateControllerFactory();

        GroupStateController.setTryAction(async (controller) => {
            for (const [
                columnName,
                { action: actionName, payload },
            ] of Object.entries(groupDataSet)) {
                const Action =
                    this.#leafsActions.get(actionName) ||
                    (() => {
                        console.log('wrong action');
                    });

                const ActionResult = await Action(payload, {
                    globalStateControllers: this.#groupStateControllers,
                });


            }
        });

        return GroupStateController;
    }

    /**
     * @type {Map<string,StateController>}
     */
    #groupStateControllers;

    /**
     * @type {() => StateController}
     */
    #stateControllerFactory;

    /**
     * @type {Map<string,(payload:Object) => Promise<any>>}
     */
    #leafsActions;

    /**
     *
     * @param {Object} deps
     * @param {() => StateController} deps.StateControllerFactory
     * @param {Map<string,() => Promise<any>>} deps.LeafActions
     */
    constructor(deps = {}) {
        if (!deps.StateControllerFactory) {
            throw new Error(
                `PostMapper::constructor: deps.StateControllerFactory required`
            );
        }

        if (!deps.LeafActions) {
            throw new Error(
                `PostMapper::constructor: deps.LeafActions required`
            );
        }

        this.#stateControllerFactory = deps.StateControllerFactory;

        this.#leafsActions = deps.LeafActions;

        this.#groupStateControllers = new Map();
    }
}

class StateController {
    static States = {};

    /**
     * @type {any}
     */
    #data;
    /**
     * @type {'pending'|'done'|'rejected'}
     */
    #state;

    try() {
        this.#actions.try({
            setState: (stateName) => {
                this.#state = stateName;
            },
            setData: (data) => {
                this.#data = data;
            },
        });
    }

    #rollback() {}

    #actions;

    /**
     *
     * @param {(controlller:{setState:(stateName:string) => void;setData:(data:any) => void}) => Promise<any>} executor
     */
    setTryAction(executor) {
        this.#actions.try = executor;
    }

    /**
     *
     * @param {Object} actions
     * @param {() => {}} actions.try
     * @param {() => {}} actions.rollback
     */
    constructor(actions) {
        this.#actions = {
            try: () => {},
            rollback: () => {},
        };
    }
}

function FileAction() {
    /**
     *
     * @param {Object} payload
     * @param {Object} deps
     */
    const fn = async function (payload, deps = {}) {
        console.log({ payload });
    };

    return fn;
}

function LinkAction() {
    /**
     *
     * @param {Object} payload
     * @param {Object} deps
     * @param {Map<string,StateController} deps.globalStateControllers
     */
    const fn = async function (payload, deps = {}) {
        if (!deps.globalStateControllers) {
            throw new Error(`LinkAction: deps.globalStateControllers required`);
        }

        const targetStateControllerAddress = `${payload.tableId}/${payload.groupId}`;
        const targetStateController = deps.globalStateControllers.get(
            targetStateControllerAddress
        );

        
        
    };

    return fn;
}

function DataAction() {
    /**
     *
     * @param {Object} payload
     * @param {Object} deps
     */
    const fn = async function (payload, deps = {}) {
        //
    };

    return fn;
}

const PostMapperActions = new Map();

PostMapperActions.set('file', FileAction());
PostMapperActions.set('data', LinkAction());
PostMapperActions.set('link', DataAction());

module.exports = { PostMapper, StateController, PostMapperActions };
