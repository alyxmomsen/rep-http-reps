const { postMapperDIContainer } = require("../../../__dev-artefacts__/data-mapping/post-mapper/post-mapper.controller");
const { PostMapper } = require("../../../__dev-artefacts__/data-mapping/post-mapper/post-mapper.model");
const { PreMapper,  FILES_SCHEMA, LINK_COLUMN_SCHEMA } = require("../../../__dev-artefacts__/data-mapping/pre-mapper/pre-mapper.model");
const { filemanager } = require("../../../app/services/filemanager.service.js/fmanager.controller");
const { defaultState } = require("./utils/icoming-data-set.factory");

describe('premapping', () => {

    /**
     * @type {PreMapper}
     */
    let premapper;    

    let dataSet;

    /**
     * @type {PostMapper}
     */
    let postMapper;

    beforeEach(() => {

        const def1 = defaultState({
            body:Buffer.from('hello world'),
            contentType:'video/matroska',
            filename:'hello.mpeg4',
            tableName:'files',
            groupId:'00',
            columnName:'avatar',
        });

        const groupId = '123-123-123-123';

        dataSet = [
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                filename:'foo.mpeg4',
                tableName:'videos',
                groupId:'01',
                // columnName:'avatar',
            }),
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                filename:'bar.mpeg4',
                tableName:'videos',
                groupId:'00',
                // columnName:'avatar',
            }),
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'images',
                // groupId:'00',
                // columnName:'avatar',
            }),
            def1({
                body:{
                    tableName:'videos',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'other',
                groupId:'00',
                columnName:'avatar',
            }),
            def1({
                body:{
                    tableName:'videos',
                    groupId:'01',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'other',
                groupId:'00',
                columnName:'avatarka',
            }),
        ];

        dataSet.forEach(item => {
            console.log({item});
        });

        premapper = new PreMapper();

        postMapper = postMapperDIContainer.getPostMapper();

    });

    afterEach(() => {

    });

    test('def', async () => {


        let result = premapper.process(FILES_SCHEMA, dataSet[0], {});
        result = premapper.process(FILES_SCHEMA, dataSet[1], result);
        result = premapper.process(FILES_SCHEMA, dataSet[2], result);
        result = premapper.process(LINK_COLUMN_SCHEMA, dataSet[3], result);
        result = premapper.process(LINK_COLUMN_SCHEMA, dataSet[4], result);

        await postMapper.process(result);

        console.dir(result, {depth:20});

    });

});

