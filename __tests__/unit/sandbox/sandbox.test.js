const { randomBytes } = require("node:crypto");
const { DataTransformer_2_0 } = require("../../../__dev-artefacts__/sand-box/data-transformer-2-0");
const { FILE_DATA_SET_SCHEMA_2, REGULAR_FIELD_DATA_SET } = require("../../../__dev-artefacts__/sand-box/dt.2.0.schema");
// const { FILE_DATA_SET_SCHEMA } = require("../../../app/services/_multipart-parser/services/data-transformer/schemas/file-data-set.schema");
const { dataSetMapperFactory,  Actions } = require("../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller");

// const { dataSetMapper: executor, Actions } = require("../../../app/services/_multipart-parser/utils/mapper/data-set-mapper.model");

describe('sandbox', () => {

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
    
    test('Itegration: ', () => {

        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId: '01',
            tableName: 'files',
            filename: 'foo.txt',
            contentType:'mime/foo'
        }));
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId: '00',
            tableName: 'files',
            filename:'bar.txt',
            contentType:'mime/bar',
        }));
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId:'00',
            tableName: 'files',
            filename:'baz.txt',
            contentType:'mime/baz',
        }));
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId:'01',
            tableName:'files',
        }));

        regularDataSet.push(mapperInputDataSetGenerator({
            tableName: 'play-list',
            groupId: '00',
            columnName: 'title-1',
        }));
        regularDataSet.push(mapperInputDataSetGenerator({
            tableName: 'play-list',
            groupId: '00',
            columnName: 'description-1',
        }));
        regularDataSet.push(mapperInputDataSetGenerator({
            tableName: 'users',
            groupId: '01',
            columnName: 'title-2',
        }));
        regularDataSet.push(mapperInputDataSetGenerator({
            tableName: 'users',
            groupId: '02',
            columnName: 'description-2',
        }));

        let i = 0;        
        do {
            filesContext = dataTransformer.process(FILE_DATA_SET_SCHEMA_2, fileGeneratedData[i++], filesContext);
        } while (i < fileGeneratedData.length);
        
        let i2 = 0;
        do {
            regularContext = dataTransformer.process(REGULAR_FIELD_DATA_SET, regularDataSet[i2++], regularContext);
        } while (i2 < regularDataSet.length);

        // data = filesContext;

        // const executor = dataSetMapperFactory();

        // const datenow = Date.now();

        // const execResult = executor(data, []);
        // collections.push('context', { execResult });
        
        // for (const item of collections) {
        //     const { execResult } = item;
            
        //     execResult.forEach(item => {
        //         console.log('collections item: ' + datenow ,item);
        //     });

        // }

        // console.log(`run-time/result: `, execResult);
        
    });

    test(`data must be merged`, () => {
        
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId: '01',
            tableName: 'files',
            filename: 'foo.txt',
            contentType:'mime/foo'
        }));
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId: '00',
            tableName: 'files',
            filename:'bar.txt',
            contentType:'mime/bar',
        }));
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId:'00',
            tableName: 'files',
            filename:'baz.txt',
            contentType:'mime/baz',
        }));
        fileGeneratedData.push(mapperInputDataSetGenerator({
            // groupId:'01',
            tableName:'files',
        }));

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

        let i = 0;        
        do {
            filesContext = dataTransformer.process(FILE_DATA_SET_SCHEMA_2, fileGeneratedData[i++], filesContext);
        } while (i < fileGeneratedData.length);
        
        // let i2 = 0;
        // do {
        //     regularContext = dataTransformer.process(REGULAR_FIELD_DATA_SET, regularDataSet[i2++], regularContext);
        // } while (i2 < regularDataSet.length);

        console.dir(filesContext, {
            depth:10,
        });

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
        filename:'filename.txt', 
        contentType:'text/plain', 
        linkId:'123-123-123-123',
        body: Buffer.from('123-123-123-123'),
        file: Buffer.from(`hello world i am file data`),
        columnName: 'title',
        dataType:'string',
        ...overrides
    }

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

