const onDataEndMw = require('../../../../../app/services/_multipart-parser/middleware/on-data-end.mw');
const {
    LinksBuffer,
} = require('../../../../../app/services/_multipart-parser/utils/data-links-buffer/data-links-buffer.util');
const {
    DBAdapter,
} = require('../../../../../app/services/database-adapter/models/db-adapter.model');
const {
    FileManager,
} = require('../../../../../app/services/filemanager.service.js/filemanager.service');

/**
 * @typedef {Object} OriginalFilename
 * @property {string} data;
 * @property {string} dataType
 */

describe('on-data-end middleware', () => {
    /**
     * @type {Map<string,DBAdapter>}
     */
    let dbRouter;

    /**
     * @type {DBAdapter}
     */
    let dbAdapter;

    /**
     * @type {FileManager}
     */
    let filemanager;

    /**
     * @type {(payload:Object, next:(payload:Object) => Promise<any>) => Promise<any>}
     */
    let middleware;

    /**
     * @type {LinksBuffer}
     */
    let linksBuffer;

    /**
     * @type {() => LinksBuffer}
     */
    let formDataLinksBufferFactory;

    beforeEach(() => {
        dbAdapter = {
            createOne: jest.fn().mockReturnValue({
                success: {
                    rowIdHash: '123-123-123',
                },
            }),
        };

        dbRouter = new Map();
        dbRouter.set('files', dbAdapter);
        dbRouter.set('users', dbAdapter);

        filemanager = {
            write: jest.fn().mockResolvedValue({
                success: {
                    filename: 'filename-123',
                },
            }),
        };

        linksBuffer = {
            push: jest.fn().mockReturnValue({
                linkId: '123',
                tableName: 'users',
                rowId: 'abcdef',
            }),
            getAllLinks: jest.fn().mockReturnValue([]),
            getLinkDataById: jest.fn().mockReturnValue({
                linkId: '123',
                tableName: 'users',
                rowId: 'abcdef',
            }),
        };

        formDataLinksBufferFactory = jest.fn(() => linksBuffer);

        middleware = onDataEndMw({
            dbRouter,
            filemanager,
            formDataLinksBufferFactory,
        });
    });

    test('test #1', async () => {
        let next = jest.fn().mockResolvedValue(undefined);

        await middleware(
            {
                mergedGroups: {
                    files: {
                        files: {
                            '00': createFileData(),
                            '01': createFileData(),
                        },
                    },
                    fields: {
                        users: {
                            '00': createFieldData(),
                            '01': createFieldData(),
                        },
                    },
                },
            },
            next
        );

        expect(linksBuffer.getAllLinks()).toEqual([]);
        expect(formDataLinksBufferFactory).toHaveBeenCalled();
        expect(filemanager.write).toHaveBeenCalledTimes(2);
    });

    test('test #2', async () => {
        let next = jest.fn().mockResolvedValue(undefined);

        await middleware(
            {
                mergedGroups: {
                    wrongProp: {
                        files: {
                            '00': createFileData(),
                            '01': createFileData(),
                        },
                    },
                    fields: {
                        users: {
                            '00': createFieldData(),
                            '01': createFieldData(),
                        },
                    },
                },
            },
            next
        );
    });
});

/**
 *
 * @param {Object.<string,any>} overrides
 * @returns {{
 *  originalFileName:OriginalFilename;
 *  file:Buffer;
 *  mime:{data:string;dataType:string};
 *  linkId:{data:string;dataType:string}
 * }}
 */
function createFileData(overrides = {}) {
    return {
        file: Buffer.from('1234 1234 1234 1234'),
        linkId: {
            data: '12345678',
            dataType: 'string',
        },
        mime: {
            data: 'test/mime',
            dataType: 'string',
        },
        originalFileName: {
            data: 'filename-123',
            dataType: 'string',
        },
        ...overrides,
    };
}

/**
 *
 * @param {Object.<string,any>} overrides
 * @returns {{
 *  originalFileName:OriginalFilename;
 *  file:Buffer;
 *  mime:{data:string;dataType:string};
 *  linkId:{data:string;dataType:string}
 * }}
 */
function createFieldData(overrides = {}) {
    return {
        columnName: 'title',
        data: Buffer.from('test data'),
        dataType: 'string',
        ...overrides,
    };
}
