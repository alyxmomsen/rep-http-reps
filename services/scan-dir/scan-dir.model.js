class ScanDir {
    scan() {
        this.#scanBehavior.execute();
    }

    /**
     * @type {ScanBehavior}
     */
    #scanBehavior;
    /**
     *
     * @param {Object} deps
     * @param {ScanBehavior} deps.scanBehavior
     */
    constructor(deps = {}) {
        if (!deps.scanBehavior) {
            throw new Error(`deps.scanBehavior required`);
        }

        this.#scanBehavior = deps.scanBehavior;
    }
}

class ScanBehavior {
    async execute() {}
    constructor() {}
}

module.exports = { ScanDir, ScanBehavior };
