const { randomBytes } = require('node:crypto');
const {
    DataTransformer_2_0,
} = require('../../../__dev-artefacts__/sand-box/data-transformer-2-0');
const {
    FILE_DATA_SET_SCHEMA,
    REGULAR_FIELD_DATA_SET,
    LINKED_FIELD_DATA_SET_SCHEMA,
} = require('../../../__dev-artefacts__/sand-box/dt.2.0.schema');
// const { FILE_DATA_SET_SCHEMA } = require("../../../app/services/_multipart-parser/services/data-transformer/schemas/file-data-set.schema");
const {
    dataSetProcessorFactory: dataSetMapperFactory,
    Actions,
} = require('../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller');
const {
    MultiTableGrouppingAgent,
} = require('../../../app/services/_multipart-parser/services/multi-table-gruping-agent/multi-table-gruping-agent');
const {
    multiTableProtocolParser,
} = require('../../../app/services/_multipart-parser/services/multi-table-gruping-agent/utils/extract-multitable-form-protocol-data');

// const { dataSetMapper: executor, Actions } = require("../../../app/services/_multipart-parser/utils/mapper/data-set-mapper.model");

describe('sandbox', () => {
    /**
     * @type {MultiTableGrouppingAgent}
     */
    let multitableGruppingAgent;

    /**
     * @type {Object}
     */
    let data;

    /**
     * @type {Object[]}
     */
    let fileGeneratedData;

    /**
     * @type {Object[]}
     */
    let regularDataSet;

    /**
     * @type {Object}
     */
    let filesContext;
    /**
     * @type {Object}
     */
    let regularContext;

    /**
     * @type {DataTransformer_2_0}
     */
    let dataTransformer;

    beforeEach(() => {
        fileGeneratedData = [];
        regularDataSet = [];

        /* -------------------------------------------- */

        filesContext = {};
        regularContext = {};

        dataTransformer = new DataTransformer_2_0();

        multitableGruppingAgent = new MultiTableGrouppingAgent({
            dataTransformer,
            multiTableProtocolParser: multiTableProtocolParser,
            fileDataSetSchema: FILE_DATA_SET_SCHEMA,
            regularFieldDataSetSchema: REGULAR_FIELD_DATA_SET,
            linkedFieldDataSetSchema: LINKED_FIELD_DATA_SET_SCHEMA,
        });

        // data = {
        //     files: {
        //         files: [
        //             Actions.TableName,
        //             {
        //                 '00': [
        //                     Actions.GroupIdAction,
        //                     {
        //                         mime: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'mime-1',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                         file: [
        //                             Actions.PropFile,
        //                             Buffer.from('foo bar baz'),
        //                         ],
        //                         linkId: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'linkid-1',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                         originalFileName: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'original-1.file.name.txt',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                     },
        //                 ],
        //                 '01': [
        //                     Actions.GroupIdAction,
        //                     {
        //                         mime: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'mime-2',
        //                                 dataType: 'string',
        //                             }
        //                         ],
        //                         file: [
        //                             Actions.PropFile,
        //                             Buffer.from('foo bar baz'),
        //                         ],
        //                         linkId: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'linkid-2',
        //                                 dataType: 'string',
        //                             }
        //                         ],
        //                         originalFileName: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'original-2.file.name.txt',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                     },
        //                 ],
        //             },
        //         ],
        //         users: [
        //             Actions.TableName,
        //             {
        //                 '00': [
        //                     Actions.GroupIdAction,
        //                     {
        //                         mime: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'mime-1',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                         file: [
        //                             Actions.PropFile,
        //                             Buffer.from('foo bar baz'),
        //                         ],
        //                         linkId: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'linkid-1',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                         originalFileName: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'orig-1.file.name.txt',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                     },
        //                 ],
        //                 '01': [
        //                     Actions.GroupIdAction,
        //                     {
        //                         mime: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'mime-2',
        //                                 dataType: 'string',
        //                             }
        //                         ],
        //                         file: [
        //                             Actions.PropFile,
        //                             Buffer.from('foo bar baz'),
        //                         ],
        //                         linkId: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'linkid-2',
        //                                 dataType: 'string',
        //                             }
        //                         ],
        //                         originalFileName: [
        //                             Actions.PropRegular,
        //                             {
        //                                 data: 'orig-2.file.name.txt',
        //                                 dataType: 'string',
        //                             },
        //                         ],
        //                     },
        //                 ],
        //             },
        //         ],
        //     },
        //     fields: {
        //         users: {
        //             action: () => {
        //                 console.log('action f 1');
        //             },
        //             '00': {
        //                 action() {
        //                     console.log('action f 2');
        //                 },
        //                 columnName: 'title',
        //                 data: Buffer.from('123-title'),
        //                 dataType: 'string',
        //             },
        //         },
        //     },
        // }
    });

    test('Itegration: ', async () => {
        // return;

        // fileGeneratedData.push(mapperInputDataSetGenerator({
        //     // groupId: '01',
        //     tableName: 'files',
        //     filename: 'foo.txt',
        //     contentType: 'mime/foo'
        // }));
        // fileGeneratedData.push(mapperInputDataSetGenerator({
        //     // groupId: '00',
        //     tableName: 'files',
        //     filename: 'bar.txt',
        //     contentType: 'mime/bar',
        // }));
        // fileGeneratedData.push(mapperInputDataSetGenerator({
        //     // groupId:'00',
        //     tableName: 'files',
        //     filename: 'baz.txt',
        //     contentType: 'mime/baz',
        // }));
        // fileGeneratedData.push(mapperInputDataSetGenerator({
        //     // groupId:'01',
        //     tableName: 'files',
        // }));

        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'play-list',
        //     groupId: '00',
        //     columnName: 'title-1',
        // }));
        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'play-list',
        //     groupId: '00',
        //     columnName: 'description-1',
        // }));
        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'users',
        //     groupId: '01',
        //     columnName: 'title-2',
        // }));
        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'users',
        //     groupId: '02',
        //     columnName: 'description-2',
        // }));

        // let i = 0;
        // do {
        //     filesContext = dataTransformer.process(FILE_DATA_SET_SCHEMA, fileGeneratedData[i++], filesContext);
        // } while (i < fileGeneratedData.length);

        // let i2 = 0;
        // do {
        //     regularContext = dataTransformer.process(REGULAR_FIELD_DATA_SET, regularDataSet[i2++], regularContext);
        // } while (i2 < regularDataSet.length);

        multitableGruppingAgent.handleFormDataPartParsedData({
            name: '2025.title.string',
            body: Buffer.from('1234-1234-1234-1234'),
            contentType: 'text/plain',
            filename: 'foo.txt',
        });

        multitableGruppingAgent.handleFormDataPartParsedData({
            name: '2025.description.string',
            body: Buffer.from('1234-1234-1234-1234'),
            contentType: null,
            filename: null,
        });

        multitableGruppingAgent.handleFormDataPartParsedData({
            name: '2025.title.string',
            body: Buffer.from('1234-1234-1234-1234'),
            contentType: null,
            filename: null,
        });

        const multitableAgentResult = multitableGruppingAgent.getGroups();

        console.dir(
            { result: multitableAgentResult },
            {
                depth: 20,
            }
        );

        const dataSetProcessor = dataSetMapperFactory();

        const datenow = Date.now();

        const execResult = await dataSetProcessor.process(
            multitableAgentResult.files,
            []
        );
    });

    test(`data must be merged`, () => {
        fileGeneratedData.push(
            mapperInputDataSetGenerator({
                // groupId: '01',
                tableName: 'files',
                filename: 'foo.txt',
                contentType: 'mime/foo',
            })
        );
        fileGeneratedData.push(
            mapperInputDataSetGenerator({
                // groupId: '00',
                tableName: 'files',
                filename: 'bar.txt',
                contentType: 'mime/bar',
            })
        );
        fileGeneratedData.push(
            mapperInputDataSetGenerator({
                // groupId:'00',
                tableName: 'files',
                filename: 'baz.txt',
                contentType: 'mime/baz',
            })
        );
        fileGeneratedData.push(
            mapperInputDataSetGenerator({
                // groupId:'01',
                tableName: 'files',
            })
        );

        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'play-list',
        //     groupId: '00',
        //     columnName: 'title-1',
        // }));
        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'play-list',
        //     groupId: '00',
        //     columnName: 'description-1',
        // }));
        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'users',
        //     groupId: '01',
        //     columnName: 'title-2',
        // }));
        // regularDataSet.push(mapperInputDataSetGenerator({
        //     tableName: 'users',
        //     groupId: '02',
        //     columnName: 'description-2',
        // }));

        // let i = 0;
        // do {
        //     filesContext = dataTransformer.process(FILE_DATA_SET_SCHEMA_2, fileGeneratedData[i++], filesContext);
        // } while (i < fileGeneratedData.length);

        // let i2 = 0;
        // do {
        //     regularContext = dataTransformer.process(REGULAR_FIELD_DATA_SET, regularDataSet[i2++], regularContext);
        // } while (i2 < regularDataSet.length);

        // console.dir(filesContext, {
        //     depth:10,
        // });

        // console.dir(regularContext, {
        //     depth:10,
        // });

        // expect(filesContext)./* tot. */toEqual({});
    });
});

/**
 * @param {{
 *  contentType:string;
 *  filename:string;
 *  body:Buffer<ArrayBuffer>;
 *  groupId:string;
 *  tableName:string;
 *  columnName:string;
 * }} [overrides={}]
 * @returns {{
 *  contentType:string;
 *  filename:string;
 *  body:Buffer<ArrayBuffer>;
 *  groupId:string;
 *  tableName:string;
 *  columnName:string;
 * }}
 */
function mapperInputDataSetGenerator(overrides = {}) {
    // const {
    //     body, columnName, contentType, filename, groupId, tableName
    // } = overrides;

    const result = {
        groupId: randomBytes(32).toString('hex'),
        tableName: 'files',
        //
        filename: 'filename.txt',
        contentType: 'text/plain',
        linkId: '123-123-123-123',
        body: Buffer.from('123-123-123-123'),
        file: Buffer.from(`hello world i am file data`),
        columnName: 'title',
        dataType: 'string',
        ...overrides,
    };

    return result;
}

/* 
    {
        groupId, 
        tableName,
        originalFileName:{data:filename,dataType:'string'}, 
        mime:{data:contentType,dataType:'string'}, 
        linkId:{data:linkId, dataType:'link'},
        body,
    }

*/
