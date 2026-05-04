const { ScanDirFactory } = require("../scan-dir/scan-dir.controller");
const { ScanDir } = require("../scan-dir/scan-dir.model");

class MainService {
    async process() {
        this.#scanDir.scan();
    }

    /**
     * @type {ScanDir}
     */
    #scanDir;

    /**
     *
     * @param {Object} deps
     * @param {ScanDir} deps.scanDir
     */
    constructor(deps = {}) {
        if (!deps.scanDir) {
            throw new Error(`deps.scanDir required`);
        }

        this.#scanDir = deps.scanDir;
    }
}

module.exports = { MainService };
