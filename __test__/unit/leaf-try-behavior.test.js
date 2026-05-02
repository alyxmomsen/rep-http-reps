const {
    LeafTryBehavior,
} = require('../../services/utit-of-work/v2/behaviors/leaf.behavior');
const {
    StateControllerToo,
} = require('../../services/utit-of-work/v2/model/statecontroller.model');
const {
    FileManager,
} = require('../../services/file-manager/model/f-manager.model');

describe('LeafTryBehavior', () => {
    /** @type {LeafTryBehavior} */
    let leafTryBehavior;

    beforeEach(() => {
        // Минимальный FileManager — он не понадобится для 'data', но нужен в конструкторе
        const fileManager = new FileManager({ rootDir: './test-uploads' });
        leafTryBehavior = new LeafTryBehavior({ fileManager });
    });

    test('должен обработать action "data" и вернуть done', async () => {
        // Arrange
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
                actionName: 'data',
                actionPayload: 'hello world',
                stateControllersGlobalPool: new Map(),
            },
        };

        // Act
        await leafTryBehavior.execute(params);

        // Assert
        expect(capturedStatus).toBe('done');
        expect(capturedData).toBe('hello world');
    });

    test('должен преобразовать Buffer в строку для action "data"', async () => {
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
                actionName: 'data',
                actionPayload: Buffer.from('hello buffer'),
                stateControllersGlobalPool: new Map(),
            },
        };

        await leafTryBehavior.execute(params);

        expect(capturedData).toBe('hello buffer');
        expect(typeof capturedData).toBe('string');
    });

    test('должен вернуть rejected для неизвестного action', async () => {
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
                actionName: 'unknown_action',
                actionPayload: 'test',
                stateControllersGlobalPool: new Map(),
            },
        };

        await leafTryBehavior.execute(params);

        expect(capturedStatus).toBe('rejected');
    });

    test('должен найти целевой контроллер в пуле для action "link" и вернуть done с его данными', async () => {
        const globalPool = new Map();

        // Создаём целевой контроллер и даём ему получить статус через try()
        const targetController = new StateControllerToo({
            tryBehavior: new LeafTryBehavior({
                fileManager: new FileManager({ rootDir: './test-uploads' }),
            }),
            rollBackBehavior: { execute: async () => {} },
        });

        // Проводим через try с data-действием — это естественный путь
        await targetController.try({
            actionName: 'data',
            actionPayload: { tableName: 'files', rowId: 'abc-123' },
            stateControllersGlobalPool: globalPool,
        });
        // Теперь targetController.status = 'done', targetController.data = { tableName: 'files', rowId: 'abc-123' }

        globalPool.set('25/abcd', targetController);

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
                actionName: 'link',
                actionPayload: { tableId: '25', groupId: 'abcd' },
                stateControllersGlobalPool: globalPool,
            },
        };

        await leafTryBehavior.execute(params);

        expect(capturedStatus).toBe('done');
        expect(capturedData).toEqual({ tableName: 'files', rowId: 'abc-123' });
    });

    test('должен вернуть rejected для action "link", если целевой контроллер rejected', async () => {
        const globalPool = new Map();

        const targetController = new StateControllerToo({
            tryBehavior: new LeafTryBehavior({
                fileManager: new FileManager({ rootDir: './test-uploads' }),
            }),
            rollBackBehavior: { execute: async () => {} },
        });

        // Делаем неизвестное действие — контроллер станет rejected
        await targetController.try({
            actionName: 'unknown_action',
            actionPayload: null,
            stateControllersGlobalPool: globalPool,
        });
        // Теперь targetController.status = 'rejected'

        globalPool.set('25/abcd', targetController);

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
                actionName: 'link',
                actionPayload: { tableId: '25', groupId: 'abcd' },
                stateControllersGlobalPool: globalPool,
            },
        };

        await leafTryBehavior.execute(params);

        expect(capturedStatus).toBe('rejected');
    });

    test('должен вернуть pending для action "link", если целевой контроллер не найден в пуле', async () => {
        const globalPool = new Map(); // пустой пул

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
                actionName: 'link',
                actionPayload: { tableId: '25', groupId: 'не_существует' },
                stateControllersGlobalPool: globalPool,
            },
        };

        await leafTryBehavior.execute(params);

        expect(capturedStatus).toBe('pending');
    });
});
