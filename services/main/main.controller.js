const { ScanDirFactory } = require("../scan-dir/scan-dir.controller");
const { MainService } = require("./main.model");

class MainServiceFactory {
    Instance() {
        return new MainService({
            scanDir: this.#scanDirFactory,
        });
    }

    /**
     * @type {ScanDirFactory}
     */
    #scanDirFactory;

    //
    /**
     *
     * @param {Object} deps
     * @param {Object} deps.scanDirFactory
     */
    constructor(deps = {}) {
        this.#scanDirFactory = deps.scanDirFactory;
    }
}

module.exports = { MainServiceFactory };
