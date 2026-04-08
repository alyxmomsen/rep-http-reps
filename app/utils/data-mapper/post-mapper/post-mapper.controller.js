const { PostMapper } = require("./post-mapper.model");

/**
 * @throws {Error} - PostMapperDIContainer: PostMapper required
 */
class PostMapperDIContainer {

    getPostMapper () {
    
        return new PostMapper({
            dataAction:DataAction,
            fileAction:FileAction,
            linkAction:LinkAction,
        })
    }

    /**
     * @type {PostMapper}
     */
    #postMapper;

    
    constructor (deps={}) {

    }
}

const postMapperDIContainer = new PostMapperDIContainer({});

module.exports = { postMapperDIContainer }

/**
 * @this {PostMapper}
 */
function LinkAction  (payload) {
    console.log(`Link action`, {payload});
}

/**
 * @this {PostMapper}
*/
function FileAction  (payload) {
    console.log(`File action`, {payload});
}

/**
 * @this {PostMapper}
*/
function DataAction  (payload) {
    console.log(`Data action`, {payload});
}