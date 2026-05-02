const {
    SecondTryBehavior,
} = require('../../services/utit-of-work/v2/behaviors/second.behavior');
const {
    LeafTryBehavior,
    LeafRollbackBehavior,
} = require('../../services/utit-of-work/v2/behaviors/leaf.behavior');
const {
    StateControllerToo,
} = require('../../services/utit-of-work/v2/model/statecontroller.model');
const {
    StateControllerFactoryToo,
} = require('../../services/utit-of-work/v2/controller/statecontroller.controller');
const {
    FileManager,
} = require('../../services/file-manager/model/f-manager.model');
const {
    DBAdapter,
    ValidatiionSchemas,
} = require('../../services/db-adapter/db-adapter.model');
const {
    InMemoryDataBase,
} = require('../../services/in-memory-db/model/db.model');

describe('SecondTryBehavior', () => {
    /** @type {SecondTryBehavior} */
    let secondTryBehavior;
    /** @type {InMemoryDataBase} */
    let db;
    /** @type {DBAdapter} */
    let dbAdapter;

    beforeEach(() => {
        db = new InMemoryDataBase();
        dbAdapter = new DBAdapter({
            DataBase: db,
            ValidationSchemas: ValidatiionSchemas,
        });

        const fileManager = new FileManager({ rootDir: './test-uploads' });

        // Фабрика для листьев (LeafTryBehavior)
        const leafFactory = new StateControllerFactoryToo({
            tryBehavior: new LeafTryBehavior({ fileManager }),
            rollbackBehavior: new LeafRollbackBehavior(),
        });

        // Сам SecondTryBehavior
        secondTryBehavior = new SecondTryBehavior({
            stateControllerFactory: leafFactory,
            dBAdapter: dbAdapter,
        });
    });

    test('должен обработать группу с одним data-полем и вернуть done', async () => {
        let capturedStatus = null;
        let capturedData = null;

        const params = {
            interface: {
                setStatus: (status) => {
                    capturedStatus = status;
                },
                setData: (data) => {
                    capturedData = data;
                },
                setTryBehavior: () => {},
                setRollBackBehavior: () => {},
            },
            payload: {
                row: {
                    title: { action: 'data', payload: 'Knight Bus' },
                    description: {
                        action: 'data',
                        payload: 'test description',
                    },
                    video: {
                        action: 'data',
                        payload: { tableName: 'files', rowId: 'fake-id' },
                    },
                },
                tableId: '8e',
                stateControllersGlobalPool: new Map(),
            },
        };

        await secondTryBehavior.execute(params);

        expect(capturedStatus).toBe('done');
        expect(capturedData).toEqual({
            tableName: 'video-playlist',
            rowId: expect.any(String),
        });
    });

    test('должен обработать группу с несколькими полями и сохранить все в БД', async () => {
        let capturedData = null;

        const params = {
            interface: {
                setStatus: () => {},
                setData: (data) => {
                    capturedData = data;
                },
                setTryBehavior: () => {},
                setRollBackBehavior: () => {},
            },
            payload: {
                row: {
                    title: { action: 'data', payload: 'Test Video' },
                    description: {
                        action: 'data',
                        payload: 'A test description',
                    },
                    video: {
                        action: 'data',
                        payload: { tableName: 'files', rowId: 'fake-id' },
                    },
                },
                tableId: '8e',
                stateControllersGlobalPool: new Map(),
            },
        };

        await secondTryBehavior.execute(params);

        // Проверим, что данные реально сохранились в БД
        const dbResult = db.readOne('video-playlist', capturedData.rowId);

        expect(dbResult.success.rowData).toMatchObject({
            title: 'Test Video',
            description: 'A test description',
        });
    });

    test('должен вернуть rejected, если хотя бы одно поле rejected', async () => {
        let capturedStatus = null;

        const params = {
            interface: {
                setStatus: (status) => {
                    capturedStatus = status;
                },
                setData: () => {},
                setTryBehavior: () => {},
                setRollBackBehavior: () => {},
            },
            payload: {
                row: {
                    title: { action: 'unknown_action', payload: 'test' }, // ← вызовет rejected
                    description: { action: 'data', payload: 'test' },
                },
                tableId: '8e',
                stateControllersGlobalPool: new Map(),
            },
        };

        await secondTryBehavior.execute(params);

        expect(capturedStatus).toBe('rejected');
    });

    test('не должен сохранять в БД, если группа rejected', async () => {
        const params = {
            interface: {
                setStatus: () => {},
                setData: () => {},
                setTryBehavior: () => {},
                setRollBackBehavior: () => {},
            },
            payload: {
                row: {
                    bad_field: { action: 'unknown_action', payload: 'test' },
                },
                tableId: '8e',
                stateControllersGlobalPool: new Map(),
            },
        };

        await secondTryBehavior.execute(params);

        // БД должна быть пустой
        const dbResult = db.readAll('video-playlist');
        const rows = Object.values(dbResult.success.rows);
        expect(rows.length).toBe(0);
    });
});
