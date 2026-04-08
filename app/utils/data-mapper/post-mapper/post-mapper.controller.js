
const { filemanager } = require("../../../services/filemanager.service.js/fmanager.controller");
const { DataActionFactory, FileActionFactory, LinkActionFactory, PostMapper } = require("./post-mapper.model");

/**
 * @throws {Error} - PostMapperDIContainer: PostMapper required
 */
class PostMapperDIContainer {

    getPostMapper () {
    
        return new PostMapper({
            dataAction:DataActionFactory({}),
            fileAction:FileActionFactory({
                fileManager:filemanager,
            }),
            linkAction:LinkActionFactory({}),
        })
    }

    /**
     * @type {PostMapper}
     */
    #postMapper;

    constructor (deps={}) {}
}

const postMapperDIContainer = new PostMapperDIContainer({});

module.exports = { postMapperDIContainer }