/**
 * @typedef {"done"|"rejected"|"pending"} StateControllerStatusToo
 */
/**
 *
 */
class StateControllerToo {
    async try(payload) {
        await this.#tryBehavior.execute({
            interface: {
                setStatus: this.#setStatus.bind(this),
                setData: this.#setData.bind(this),
                setTryBehavior: this.#setTryBehavior.bind(this),
                setRollBackBehavior: this.#setRollbackBehavior.bind(this),
            },
            payload: payload,
        });
        return {
            status: this.#status,
            data: this.#data,
        };
    }

    async rollBack() {
        await this.#rollBackBehavior.execute();
        return {
            status: this.#status,
            data: this.#data,
        };
    }

    getData() {
        return this.#data;
    }

    getStatus() {
        return this.#status;
    }

    /**
     *
     * @param {any} data
     */
    #setData(data) {
        this.#data = data;
    }

    /**
     * @param {StateControllerStatusToo} status
     */
    #setStatus(status) {
        this.#status = status;
    }

    /**
     *
     * @param {RollBackBehavior} rollbackbehavior
     */
    #setRollbackBehavior(rollbackbehavior) {
        this.#rollBackBehavior = rollbackbehavior;
    }

    /**
     *
     * @param {TryBehavior} tryBehavior
     */
    #setTryBehavior(tryBehavior) {
        this.#rollBackBehavior = tryBehavior;
    }

    /**
     * @type {TryBehavior}
     */
    #tryBehavior;
    /**
     * @type {RollBackBehavior}
     */
    #rollBackBehavior;

    /**
     * @type {any}
     */
    #data;
    /**
     * @type {StateControllerStatusToo}
     */
    #status;

    static Statuses = {
        Done: 'done',
        Pending: 'pending',
        Rejected: 'rejected',
    };

    /**
     *
     * @param {Object} deps
     * @param {TryBehavior} deps.tryBehavior
     * @param {RollBackBehavior} deps.rollBackBehavior
     */
    constructor(deps = {}) {
        if (!deps.tryBehavior) {
            throw new Error(
                `StateControllerToo::constructor deps.tryBehavior required`
            );
        }

        if (!deps.rollBackBehavior) {
            throw new Error(
                `StateControllerToo::constructor deps.rollBackBehavior required`
            );
        }

        this.#tryBehavior = deps.tryBehavior;
        this.#rollBackBehavior = deps.rollBackBehavior;

        this.#data = undefined;
        this.#status = 'pending';
    }
}

class TryBehavior {
    /**
     *
     * @param {Object} params
     * @param {Object} params.interface
     * @param {(status:StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {any} params.payload
     *
     */
    async execute(params) {}

    constructor() {}
}

class RollBackBehavior {
    async execute() {}

    constructor() {}
}

module.exports = { StateControllerToo, TryBehavior, RollBackBehavior };
