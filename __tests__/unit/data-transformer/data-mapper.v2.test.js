const { randomBytes } = require('pg/lib/crypto/utils-legacy')
const {
    dataMapperFactory,
} = require('../../../app/services/_multipart-parser/services/data-mapper/v2/controller/data-mapper.controller')
const {
    DataMapper,
} = require('../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model')
const {
    FILE_DATA_SET_SCHEMA,
    LINKED_FIELD_DATA_SET_SCHEMA,
    REGULAR_FIELD_DATA_SET,
} = require('../../../app/services/_multipart-parser/services/data-mapper/v2/model/schemas/dm.schema')
const {
    dataSetProcessorFactory,
} = require('../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller')
const {
    DataSetProcessor,
} = require('../../../app/services/_multipart-parser/utils/mapper/model/data-set-processor.model')
const {
    dataBase,
} = require('../../../app/services/database/controller/db.controller')
const {
    HTTPRouter,
} = require('../../../app/services/router/v2/model/router.model')
const { IncomingMessage, ServerResponse } = require('http')
// const { router } = require("../../../app/services/router/controller/http-controller");

/**
 * @typedef {{
 *  tableName:string;
 *  groupId:string;
 *  columnName:string;
 *  dataType:string;
 *  body:any;
 *  filename:string;
 *  contentType:string;
 *  linkId:string;
 *  columnName:string;
 * }} DataSet
 */

describe('data mapper v2', () => {
    /**
     * @type {DataMapper}
     */
    let dataMapper

    /**
     * @type {DataSetProcessor}
     */
    let dataSetProccessor

    const Schema = {
        File: FILE_DATA_SET_SCHEMA,
        LinkedField: LINKED_FIELD_DATA_SET_SCHEMA,
        RegularField: REGULAR_FIELD_DATA_SET,
    }

    /**
     * @type {Function}
     */
    let dataSetMaker

    let context

    let arr

    let fn

    beforeEach(() => {
        dataMapper = dataMapperFactory()
        dataSetProccessor = dataSetProcessorFactory()

        context = {}
    })

    test('should smth', async () => {
        let context = {}

        /**
         * @description
         * для каждого <file-data-set> нужны уникальные группы
         * по причине того что "группа"="набор столбцов для одной строки в таблице",
         * а в <file-data-set> уже содержатся все нужные столбцы
         *
         * но если будет нужно расширить набор колонок в строке таблицы, то
         * тогда нужно будет дублировать [groupId] в дополяющем data-set
         * @type {Array<string>}
         *
         */
        const FILE_RANDOM_UNIQUE_GROUPS = [
            randomBytes(32).toString('hex'),
            randomBytes(32).toString('hex'),
        ]

        const fileDataSetProducer = dataSetDecorator({
            body: Buffer.from('buffer data'), // данные файла
            contentType: 'image/jpeg',
            filename: 'avatar.jpeg',
            groupId: FILE_RANDOM_UNIQUE_GROUPS[0],
            tableName: 'files',
            linkId: 'link-id-123-123-123-123', // идентификатор для
            columnName: 'image', // будет проигнорировано для файла
            dataType: 'string', // будет проигнорировано для файла
        })

        context = dataMapper.process(
            Schema.File,
            fileDataSetProducer(),
            context
        )
        context = dataMapper.process(
            Schema.File,
            fileDataSetProducer({
                groupId: FILE_RANDOM_UNIQUE_GROUPS[1],
                linkId: 'link-id-123-123-123-123',
            }),
            context
        )

        // context = dataMapper.process(Schema.RegularField, dataSetDecorator({
        //     body:Buffer.from('blarg-blarg-blarg'),
        //     columnName:'secret-column',
        //     dataType:'string',
        //     groupId:FILE_RANDOM_UNIQUE_GROUPS[0],
        //     tableName:'files',
        // })(), context);

        const usersDataSetProducer = dataSetDecorator({
            body: Buffer.from('buffer data'),
            columnName: 'name',
            dataType: 'string',
            groupId: '00',
            tableName: 'users',
            contentType: 'image/jpeg', // будет проигнорировано
            filename: 'avatar.jpeg', // будет проигнорировано
            linkId: 'link-id-123-123-123-123', // будет проигнорировано
        })

        context = dataMapper.process(
            Schema.RegularField,
            usersDataSetProducer(),
            context
        )
        context = dataMapper.process(
            Schema.LinkedField,
            usersDataSetProducer({
                body: 'link-id-123-123-123-123',
                columnName: 'avatar',
                contentType: 'image/jpeg', // будет проигнорировано
                filename: 'avatar.jpeg', // будет проигнорировано
            }),
            context
        )

        console.dir(context, { depth: 10 })

        const result = {
            files: [
                'branch',
                {
                    meta: { title: 'tableName' },
                    value: {
                        [FILE_RANDOM_UNIQUE_GROUPS[0]]: [
                            'branch',
                            {
                                meta: { title: 'groupId' },
                                value: {
                                    originalFileName: [
                                        'leaf',
                                        {
                                            meta: { title: 'originalFileName' },
                                            value: {
                                                data: 'avatar.jpeg',
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                    mime: [
                                        'leaf',
                                        {
                                            meta: { title: 'mime' },
                                            value: {
                                                data: 'image/jpeg',
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                    file: [
                                        'leaf',
                                        {
                                            meta: { title: 'file' },
                                            value: {
                                                data: Buffer.from(
                                                    'buffer data'
                                                ),
                                                dataType: 'buffer',
                                            },
                                        },
                                    ],
                                    linkId: [
                                        'leaf',
                                        {
                                            meta: { title: 'linkId' },
                                            value: {
                                                data: 'link-id-123-123-123-123',
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                    // ['secret-column']: [
                                    //     'leaf',
                                    //     {
                                    //         meta: { title: 'columnName' },
                                    //         value: { data: Buffer.from('blarg-blarg-blarg'), dataType: 'string' }
                                    //     },
                                    // ],
                                },
                            },
                        ],
                        [FILE_RANDOM_UNIQUE_GROUPS[1]]: [
                            'branch',
                            {
                                meta: { title: 'groupId' },
                                value: {
                                    originalFileName: [
                                        'leaf',
                                        {
                                            meta: { title: 'originalFileName' },
                                            value: {
                                                data: 'avatar.jpeg',
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                    mime: [
                                        'leaf',
                                        {
                                            meta: { title: 'mime' },
                                            value: {
                                                data: 'image/jpeg',
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                    file: [
                                        'leaf',
                                        {
                                            meta: { title: 'file' },
                                            value: {
                                                data: Buffer.from(
                                                    'buffer data'
                                                ),
                                                dataType: 'buffer',
                                            },
                                        },
                                    ],
                                    linkId: [
                                        'leaf',
                                        {
                                            meta: { title: 'linkId' },
                                            value: {
                                                data: 'link-id-123-123-123-123',
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
            users: [
                'branch',
                {
                    meta: { title: 'tableName' },
                    value: {
                        '00': [
                            'branch',
                            {
                                meta: { title: 'groupId' },
                                value: {
                                    name: [
                                        'leaf',
                                        {
                                            meta: { title: 'columnName' },
                                            value: {
                                                data: Buffer.from(
                                                    'buffer data'
                                                ),
                                                dataType: 'string',
                                            },
                                        },
                                    ],
                                    avatar: [
                                        'leaf',
                                        {
                                            meta: { title: 'columnName' },
                                            value: {
                                                data: 'link-id-123-123-123-123',
                                                dataType: 'link',
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        }

        expect(context).toEqual(result)
    })
})

/**
 *
 * @param {DataSet} overrides
 * @returns
 */
function dataSetProducer(overrides = {}) {
    return {
        columnName: 'name',
        body: Buffer.from('buffer data'),
        dataType: 'string',
        contentType: 'image/jpeg',
        filename: 'avatar.jpeg',
        tableName: 'files',
        groupId: '00',
        linkId: 'link-id-123-123-123-123',
        ...overrides,
    }
}

/**
 *
 * @param {DataSet} defaultDataSetMod
 * @returns {(overrides?:DataSet) => DataSet}
 */
function dataSetDecorator(defaultDataSetMod = {}) {
    /**
     *
     * @param {DataSet} overrides
     * @returns {DataSet}
     */
    const fn = (overrides = {}) =>
        dataSetProducer({ ...defaultDataSetMod, ...overrides })

    return fn
}
