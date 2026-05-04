const { ScanDir } = require("./scan-dir.model");

class ScanDirFactory {
    /**
     *
     * @param {Object} deps
     * @param {Object} deps.scanBehavior
     * @returns
     */
    Instance(deps = {}) {
        if (!deps.scanBehavior) {
            throw new Error(`deps.scanBehavior required`);
        }

        return new ScanDir({
            scanBehavior: deps.scanBehavior,
        });
    }

    constructor() {}
}

module.exports = { ScanDirFactory };
