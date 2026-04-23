class PostMapper {
    /**
     *
     * @param {Object} dataSet
     */
    async process(dataSet) {
        const Args = {
            DataSet: dataSet,
        };

        for (const [tableId, Groups] of Object.entries(Args.DataSet)) {
            for (const [groupId, groupColumns] of Object.entries(Groups)) {
                const CurrentIterationGroup = {
                    StateControllerAddress: `${tableId}/${groupId}`,
                };

                const ProcessedGroup = {
                    StateController: this.#processGroup(groupColumns, tableId),
                };

                this.#groupStateControllers.set(
                    CurrentIterationGroup.StateControllerAddress,
                    ProcessedGroup.StateController
                );
            }
        }
    }

    #processGroup(groupDataSet, tableId) {
        const GroupStateController = this.#stateControllerFactory();

        GroupStateController.setTryAction((controller) => {
            for (const [columnName, { action, payload }] of Object.entries(
                groupDataSet
            )) {
                switch (action) {
                    case 'file':
                        break;
                    case 'data':
                        break;
                    case 'link':
                        const targetStateControllerAddress = `${payload.tableId}/${payload.groupId}`;
                        const targetStateController =
                            this.#groupStateControllers.get(
                                targetStateControllerAddress
                            );

                        break;
                }
            }
        });

        GroupStateController.try();

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
     *
     * @param {Object} deps
     * @param {() => StateController} deps.StateControllerFactory
     */
    constructor(deps = {}) {
        if (!deps.StateControllerFactory) {
            throw new Error(
                `PostMapper::constructor: deps.StateControllerFactory required`
            );
        }

        this.#groupStateControllers = new Map();

        this.#stateControllerFactory = deps.StateControllerFactory;
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

module.exports = { PostMapper, StateController };
