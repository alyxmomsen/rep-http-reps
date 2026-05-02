const { LeafTryBehavior } = require('../../services/utit-of-work/v2/behaviors/leaf.behavior');
const { StateControllerToo } = require('../../services/utit-of-work/v2/model/statecontroller.model');
const { FileManager } = require('../../services/file-manager/model/f-manager.model');

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
                setStatus: (status) => { capturedStatus = status; },
                setData: (data) => { capturedData = data; },
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
                setData: (data) => { capturedData = data; },
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
                setStatus: (status) => { capturedStatus = status; },
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
});