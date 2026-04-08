
const { dataBase } = require("../../../app/services/database/controller/db.controller");
const { postMapperDIContainer } = require("../../../app/utils/data-mapper/post-mapper/post-mapper.controller");
const { PostMapper } = require("../../../app/utils/data-mapper/post-mapper/post-mapper.model");
const { PreMapper, FILES_SCHEMA, LINK_COLUMN_SCHEMA, REGULAR_COLUMN_SCHEMA } = require("../../../app/utils/data-mapper/pre-mapper/pre-mapper.model");
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
                tableName:'files',
                groupId:'01',
                // columnName:'avatar',
            }),
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                filename:'bar.mpeg4',
                tableName:'files',
                groupId:'00',
                // columnName:'avatar',
            }),
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'files',
                // groupId:'00',
                // columnName:'avatar',
            }),
            // to link
            def1({
                body:{
                    tableName:'files',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'00',
                columnName:'avatar',
            }),
            // to link
            def1({
                body:{
                    tableName:'files',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'00',
                columnName:'logo',
            }),
            // to link
            def1({
                body:{
                    tableName:'files',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'00',
                columnName:'thumb-nail',
            }),
            def1({
                body:Buffer.from(`my name`),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'00',
                columnName:'name',
            }),
            def1({
                body:Buffer.from(`my last name`),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'00',
                columnName:'last-name',
            }),
            // to link
            def1({
                body:{
                    tableName:'files',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'66',
                columnName:'avatar',
            }),
            // to link
            def1({
                body:{
                    tableName:'files',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'66',
                columnName:'logo',
            }),
            // to link
            def1({
                body:{
                    tableName:'files',
                    groupId:'00',
                    columnName:'fileSystemFileName',
                },
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'66',
                columnName:'thumb-nail',
            }),
            def1({
                body:Buffer.from(`my name`),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'66',
                columnName:'name',
            }),
            def1({
                body:Buffer.from(`my last name`),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'users',
                groupId:'66',
                columnName:'last-name',
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

        // files
        let result = premapper.process(FILES_SCHEMA, dataSet[0], {});
        result = premapper.process(FILES_SCHEMA, dataSet[1], result);
        result = premapper.process(FILES_SCHEMA, dataSet[2], result);
        // links
        result = premapper.process(LINK_COLUMN_SCHEMA, dataSet[3], result);
        result = premapper.process(LINK_COLUMN_SCHEMA, dataSet[4], result);
        result = premapper.process(LINK_COLUMN_SCHEMA, dataSet[5], result);
        // regular
        result = premapper.process(REGULAR_COLUMN_SCHEMA, dataSet[6], result);
        result = premapper.process(REGULAR_COLUMN_SCHEMA, dataSet[7], result);

        await postMapper.process(result);

        // console.dir(result, {depth:20});

        console.log(dataBase.readAll('users'));
        console.log(dataBase.readAll('files'));

    });

});

