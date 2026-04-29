const {
    FileManager,
} = require('../../../../../../../file-manager/model/f-manager.model');
const {
    StateControllerFactory,
} = require('../../../../../../../utit-of-work/controller/state-controller.controller');
const {
    StateController,
    TryBehavior,
} = require('../../../../../../../utit-of-work/model/state-controller.model');
const { LeafAction } = require('../postmapper.model');

class FileAction extends LeafAction {
    /**
     *
     * @param {Object} payload
     * @param {any} payload.data
     * @param {Map<string,StateController>} payload.stateControllersGlobalPool
     */
    async execute(payload) {
        const stateController = this.#stateControllerFactory.Instatnce({
            payload: payload.data,
        });

        // stateController.setTryBehavior();

        stateController.try();
    }

    /**
     * @type {FileManager}
     */
    #fileManager;

    /**
     * @type {StateControllerFactory}
     */
    #stateControllerFactory;

    /**
     *
     * @param {Object} deps
     * @param {FileManager} deps.fileMananger
     * @param {StateControllerFactory} deps.StateControllerFactory
     */
    constructor(deps = {}) {
        if (!deps.fileMananger) {
            throw new Error(
                `FileAction::constructor: deps.fileMananger required`
            );
        }

        if (!deps.StateControllerFactory) {
            throw new Error(
                `FileAction::constructor: deps.StateControllerFactory required`
            );
        }

        this.#fileManager = deps.fileMananger;
        this.#stateControllerFactory = deps.StateControllerFactory;
    }
}

class TryFile extends TryBehavior {
    /**
     *
     * @param {Object} params
     * @param {StateController} params.stateController
     * @param {Buffer<ArrayBuffer>} params.payload
     */
    async execute(params) {
        const fileManagerResult = await this.#fileManager.save(params.payload);

        if (fileManagerResult.failure) {
            params.stateController.setStatus('rejected');
            return;
        }

        if (fileManagerResult.success) {
            const filesystemFilename = fileManagerResult.success.filename;
            params.stateController.setData(filesystemFilename);
            return;
        }

        throw new Error(`TryFile: filemanager iternal error`);
    }

    /**
     * @type {FileManager}
     */
    #fileManager;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.fileMananger
     */
    constructor(deps = {}) {
        if (!deps.fileMananger) {
            throw new Error(
                `TryFile::constructor of TryBehavior: deps.fileMananger required`
            );
        }

        this.#fileManager = deps.fileMananger;
    }
}

module.exports = { FileAction, TryFile };
