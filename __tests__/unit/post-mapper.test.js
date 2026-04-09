const { DataAction, FileAction, LinkAction } = require("../../app/utils/data-mapper/post-mapper/post-mapper.controller");
const { PostMapper } = require("../../app/utils/data-mapper/post-mapper/post-mapper.model");

describe('post-mapper', () => {

    /**
     * @type {PostMapper}
     */
    let postMapper;

    beforeEach(() => {
        postMapper = new PostMapper({
            dataAction: DataAction,
            fileAction: FileAction,
            linkAction: LinkAction,
        });
    });
    
    test('def', () => {
        postMapper();
    });
});