const { randomBytes } = require("node:crypto");
const { DataTransformer_2_0 } = require("../../../__dev-artefacts__/sand-box/data-transformer-2-0");
const { FILE_DATA_SET_SCHEMA_2 } = require("../../../__dev-artefacts__/sand-box/dt.2.0.schema");
// const { FILE_DATA_SET_SCHEMA } = require("../../../app/services/_multipart-parser/services/data-transformer/schemas/file-data-set.schema");
const { dataSetMapperFactory,  Actions } = require("../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller");

FILE_DATA_SET_SCHEMA_2
// const { dataSetMapper: executor, Actions } = require("../../../app/services/_multipart-parser/utils/mapper/data-set-mapper.model");

describe('sandbox', () => {

    /**
     * @type {Object}
     */
    let data;

    let collections = [];

    beforeEach(() => {

        const generatedData = [];

        generatedData.push(mapperInputDataSetGenerator({
            groupId: '01',
            tableName:'files',
        }));
        generatedData.push(mapperInputDataSetGenerator({
            groupId: '00',
            tableName:'files',
        }));
        generatedData.push(mapperInputDataSetGenerator({
            groupId:'00',
            tableName:'users',
        }));
        generatedData.push(mapperInputDataSetGenerator({
            groupId:'01',
            tableName:'users',
        }));
        
        let context = {};

        const dataTransformer = new DataTransformer_2_0();

        let i = 0;        
        do {
            context = dataTransformer.process(FILE_DATA_SET_SCHEMA_2, generatedData[i++], context);
        } while (i < generatedData.length);

        console.dir(context, {
            depth:10,
        });

        data = {
            files: {
                files: [
                    Actions.TableName,
                    {
                        '00': [
                            Actions.GroupIdAction,
                            {
                                mime: [
                                    Actions.PropRegular,
                                    {
                                        data: 'mime-1',
                                        dataType: 'string',
                                    },
                                ],
                                file: [
                                    Actions.PropFile,
                                    Buffer.from('foo bar baz'),
                                ],
                                linkId: [
                                    Actions.PropRegular,
                                    {
                                        data: 'linkid-1',
                                        dataType: 'string',
                                    },
                                ],
                                originalFileName: [
                                    Actions.PropRegular,
                                    {
                                        data: 'original-1.file.name.txt',
                                        dataType: 'string',
                                    },
                                ],
                            },
                        ],
                        '01': [
                            Actions.GroupIdAction,
                            {
                                mime: [
                                    Actions.PropRegular,
                                    {
                                        data: 'mime-2',
                                        dataType: 'string',
                                    }
                                ],
                                file: [
                                    Actions.PropFile,
                                    Buffer.from('foo bar baz'),
                                ],
                                linkId: [
                                    Actions.PropRegular,
                                    {
                                        data: 'linkid-2',
                                        dataType: 'string',
                                    }
                                ],
                                originalFileName: [
                                    Actions.PropRegular,
                                    {
                                        data: 'original-2.file.name.txt',
                                        dataType: 'string',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                users: [
                    Actions.TableName,
                    {
                        '00': [
                            Actions.GroupIdAction,
                            {
                                mime: [
                                    Actions.PropRegular,
                                    {
                                        data: 'mime-1',
                                        dataType: 'string',
                                    },
                                ],
                                file: [
                                    Actions.PropFile,
                                    Buffer.from('foo bar baz'),
                                ],
                                linkId: [
                                    Actions.PropRegular,
                                    {
                                        data: 'linkid-1',
                                        dataType: 'string',
                                    },
                                ],
                                originalFileName: [
                                    Actions.PropRegular,
                                    {
                                        data: 'orig-1.file.name.txt',
                                        dataType: 'string',
                                    },
                                ],
                            },
                        ],
                        '01': [
                            Actions.GroupIdAction,
                            {
                                mime: [
                                    Actions.PropRegular,
                                    {
                                        data: 'mime-2',
                                        dataType: 'string',
                                    }
                                ],
                                file: [
                                    Actions.PropFile,
                                    Buffer.from('foo bar baz'),
                                ],
                                linkId: [
                                    Actions.PropRegular,
                                    {
                                        data: 'linkid-2',
                                        dataType: 'string',
                                    }
                                ],
                                originalFileName: [
                                    Actions.PropRegular,
                                    {
                                        data: 'orig-2.file.name.txt',
                                        dataType: 'string',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            fields: {
                users: {
                    action: () => {
                        console.log('action f 1');
                    },
                    '00': {
                        action() {
                            console.log('action f 2');
                        },
                        columnName: 'title',
                        data: Buffer.from('123-title'),
                        dataType: 'string',
                    },
                },
            },
        }
    });
    
    test('#1', () => {

        

        // const executor = dataSetMapperFactory();

        // const datenow = Date.now();

        // const execResult = executor(data.files, []);
        // collections.push('context', { execResult });
        
        // for (const item of collections) {
        //     const { execResult } = item;
            
        //     execResult.forEach(item => {
        //         console.log('collections item: ' + datenow ,item);
        //     });

        // }

        // console.log(`run-time/result: `, execResult);
        
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
        originalFileName:'filename.txt', 
        mime:'text/plain', 
        linkId:'123-123-123-123',
        body: Buffer.from('123-123-123-123'),
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