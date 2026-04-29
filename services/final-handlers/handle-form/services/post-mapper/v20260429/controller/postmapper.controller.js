const {
    FileManager,
} = require('../../../../../../file-manager/model/f-manager.model');
const {
    StateControllerFactory,
} = require('../../../../../../utit-of-work/controller/state-controller.controller');
const { FileAction, TryFile } = require('../model/leaf-actions/file.action');
const { PostMapper, GroupTryBehavior } = require('../model/postmapper.model');

/**
 * @type {Map<string,Lea>}
 */
const LeafActions = new Map();

LeafActions.set(
    'file',
    new FileAction({
        fileMananger: new FileManager(),
        StateControllerFactory: new StateControllerFactory({
            tryBehavior: new TryFile(),
        }),
    })
);
LeafActions.set('link', new FileAction());
LeafActions.set('data', new FileAction());

class PostMapperFactory {
    Instance() {
        return new PostMapper({
            leafActions: LeafActions,
            stateControllerFactory: new StateControllerFactory({
                tryBehavior: new GroupTryBehavior(),
            }),
        });
    }

    constructor() {}
}

module.exports = { LeafActions };
