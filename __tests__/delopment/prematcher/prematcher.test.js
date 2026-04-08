
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
            // file data-set
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                filename:'foo.mpeg4',
                tableName:'files',
                groupId:'01',
                // columnName:'avatar',
            }),
            // file data-set
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                filename:'bar.mpeg4',
                tableName:'files',
                groupId:'00',
                // columnName:'avatar',
            }),
            // file data-set
            def1({
                // body:Buffer.from('hello world'),
                // contentType:'video/matroska',
                // filename:'hello.mpeg4',
                tableName:'files',
                // groupId:'00',
                // columnName:'avatar',
            }),
            // a link column
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
            // a link column
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
            // a link column
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
                    groupId:'01',
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
                    groupId:'01',
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
                    groupId:'01',
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
        let context = {}
        // files
        context = premapper.process(FILES_SCHEMA, dataSet[0], context);
        context = premapper.process(FILES_SCHEMA, dataSet[1], context);
        context = premapper.process(FILES_SCHEMA, dataSet[2], context);
        // links
        context = premapper.process(LINK_COLUMN_SCHEMA, dataSet[3], context);
        context = premapper.process(LINK_COLUMN_SCHEMA, dataSet[4], context);
        context = premapper.process(LINK_COLUMN_SCHEMA, dataSet[5], context);
        // regular
        context = premapper.process(REGULAR_COLUMN_SCHEMA, dataSet[6], context);
        context = premapper.process(REGULAR_COLUMN_SCHEMA, dataSet[7], context);
        // links
        context = premapper.process(LINK_COLUMN_SCHEMA, dataSet[8], context);
        context = premapper.process(LINK_COLUMN_SCHEMA, dataSet[9], context);
        context = premapper.process(LINK_COLUMN_SCHEMA, dataSet[10], context);
        // regular
        context = premapper.process(REGULAR_COLUMN_SCHEMA, dataSet[11], context);
        context = premapper.process(REGULAR_COLUMN_SCHEMA, dataSet[12], context);
        // // files
        // context = premapper.process(FILES_SCHEMA, dataSet[0], context);
        // context = premapper.process(FILES_SCHEMA, dataSet[1], context);
        // context = premapper.process(FILES_SCHEMA, dataSet[2], context);


        const postMapperDataSet = context;

        await postMapper.process(postMapperDataSet);

        console.dir(context, {depth:20});

        console.dir(dataBase.readAll('users'), {depth:20});
        console.dir(dataBase.readAll('files'), {depth:20});

    });

});

