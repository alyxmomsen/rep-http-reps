const {
    DBAdapter,
} = require('../../../app/services/database-adapter/models/db-adapter.model');
const {
    FileManager,
} = require('../../../app/services/filemanager.service.js/filemanager.service');
const {
    Transaction,
    Transactor,
} = require('../../../app/services/transactor/v2/model/transactor.model');

describe('transaction', () => {
    /**
     * @type {Transactor}
     */
    let transactor;
    /**
     * @type {Map<string,DBAdapter>}
     */
    let dbcontrollersRouter;
    /**
     * @type {FileManager}
     */
    let filemanager;

    /**
     * @type {() => ({error?:{},success?:{}})}}
     */
    let mockFManagerWriteOne;

    /**
     * @type {DBAdapter}
     */
    let dbadapter;

    beforeEach(() => {
        dbadapter = {
            createOne: jest.fn(),
            readOne: jest.fn(),
            readAllRows: jest.fn(),
        };

        dbcontrollersRouter = new Map();
        dbcontrollersRouter.set('files', dbadapter);

        dbcontrollersRouter.set('users', dbadapter);

        filemanager = {
            read: jest.fn(),
            write: jest.fn(),
        };

        transactor = new Transactor({
            dbControllersRouter: dbcontrollersRouter,
            fileManager: filemanager,
        });
    });

    afterEach(() => {});

    test('default', async () => {
        const transaction = transactor.useTransaction('123-123-123-123');
        expect(transaction).toBeDefined();

        mockFManagerWriteOne = jest.fn().mockReturnValue({
            success: {
                filename: '123123123123',
            },
        });

        filemanager.write = mockFManagerWriteOne;

        dbadapter.createOne = jest.fn().mockReturnValue({
            success: {
                newRowIdHash: '123-123-123-123',
                row: { foo: 'bar' },
            },
        });

        const dataset = {
            fileData: Buffer.from(`return to Salem’s Lot`),
            originalFileName: 'text.txt',
            mime: 'foo/mime',
            linkId: '123-123',
        };

        await transaction.processFile(dataset);

        expect(mockFManagerWriteOne).toBeCalled();
        expect(mockFManagerWriteOne).toBeCalledWith(dataset.fileData);

        expect(dbadapter.createOne).toBeCalled();
        expect(dbadapter.createOne).toBeCalledWith({
            originalFileName: 'text.txt',
            mime: 'foo/mime',
            fileSystemFilename: '123123123123',
        });
    });

    test('shuld trhow error if the transaction aleady failed', async () => {
        const transaction = transactor.useTransaction('123-123-123-123');
        expect(transaction).toBeDefined();

        mockFManagerWriteOne = jest.fn().mockReturnValue({
            error: {},
        });

        filemanager.write = mockFManagerWriteOne;

        await expect(async () =>
            transaction.processFile({
                fileData: Buffer.from(`hello world`),
                mime: 'text/plain',
                originalFileName: 'foo.bar',
                linkId: '123-123',
            })
        ).rejects.toThrow(`Transaction: filemanager failed`);

        expect(mockFManagerWriteOne).toBeCalled();
        expect(mockFManagerWriteOne).toBeCalledWith(Buffer.from(`hello world`));

        const newTrans = transactor.useTransaction('123-123-123-123');

        expect(transaction === newTrans).toBe(true);

        // filemanager.write = jest.fn().mockReturnValue({ success: { filename: 'test.txt' } });

        await expect(async () =>
            newTrans.processFile({
                fileData: Buffer.from(`hello world`),
            })
        ).rejects.toThrow(`Transaction: this transaction is already failed`);
    });

    test('chain', async () => {
        const transaction = transactor.useTransaction('123-123');

        mockFManagerWriteOne = jest.fn().mockReturnValue({
            success: {
                filename: 'abcdefg',
            },
        });

        filemanager.write = mockFManagerWriteOne;

        dbadapter.createOne = jest.fn().mockReturnValue({
            success: {
                newRowIdHash: '123-123-123-123',
                row: { foo: 'bar' },
            },
        });

        await transaction.processFile({
            fileData: Buffer.from('hello world'),
            linkId: '_',
            mime: 'mime/mime',
            originalFileName: 'file.txt',
        });

        const transaction2 = transactor.useTransaction('123-123');

        await transaction.processLinkedField({
            ft,
        });

        // await transaction.processLinkedField();

        // expect()
    });
});
