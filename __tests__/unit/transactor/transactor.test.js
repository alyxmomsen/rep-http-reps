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
     * @type {Function}
     */
    let mockFManagerReadOne;

    beforeEach(() => {
        dbcontrollersRouter = new Map();
        dbcontrollersRouter.set('files', {
            createOne: jest.fn(),
            readOne: jest.fn(),
            readAllRows: jest.fn(),
        });

        dbcontrollersRouter.set('users', {
            createOne: jest.fn(),
            readOne: jest.fn(),
            readAllRows: jest.fn(),
        });

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

        mockFManagerReadOne = jest.fn().mockReturnValue({
            success: {
                filename: 'return to Salem’s Lot',
            },
        });

        filemanager.write = mockFManagerReadOne;

        await transaction.processFile({
            fileData: Buffer.from(`hello world`),
        });

        expect(mockFManagerReadOne).toBeCalled();
        expect(mockFManagerReadOne).toBeCalledWith(Buffer.from(`hello world`));
    });

    test('shuld trhow error if the transaction aleady failed', async () => {
        const transaction = transactor.useTransaction('123-123-123-123');
        expect(transaction).toBeDefined();

        mockFManagerReadOne = jest.fn().mockReturnValue({
            error: {},
        });

        filemanager.write = mockFManagerReadOne;

        expect(async () => {
            await transaction.processFile({
                fileData: Buffer.from(`hello world`),
            });
        }).rejects.toThrow(`Transaction: filemanager failed`);

        expect(mockFManagerReadOne).toBeCalled();
        expect(mockFManagerReadOne).toBeCalledWith(Buffer.from(`hello world`));

        const newTrans = transactor.useTransaction('123-123-123-123');

        expect(transaction === newTrans).toBe(true);

        expect(async () => {
            await newTrans.processFile({
                fileData: Buffer.from(`hello world`),
            });
        }).rejects.toThrow(`Transaction: this transaction is already failed`);
    });

    test(`3`, async () => {
        return;
        const transaction = transactor.useTransaction('123-123-123-123');
        expect(transaction).toBeDefined();

        mockFManagerReadOne = jest.fn().mockReturnValue({
            error: {},
        });

        filemanager.write = mockFManagerReadOne;

        await transaction.processFile({
            fileData: Buffer.from(`hello world`),
        });

        expect(mockFManagerReadOne).toBeCalled();
        expect(mockFManagerReadOne).toBeCalledWith(Buffer.from(`hello world`));

        transactor.useTransaction('123-123-123-123');

        expect(async () => {
            await transaction.processFile({
                fileData: Buffer.from(`hello world`),
            });
        }).rejects.toThrow(`Transaction: this transaction is already failed`);
    });
});
