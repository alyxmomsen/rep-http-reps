const { PostMapper } = require('../../services/final-handlers/handle-form/services/post-mapper/post-mapper.model');
const { StateControllerFactoryToo } = require('../../services/utit-of-work/v2/controller/statecontroller.controller');
const { LeafTryBehavior, LeafRollbackBehavior } = require('../../services/utit-of-work/v2/behaviors/leaf.behavior');
const { SecondTryBehavior, SecondRollbackBehavior } = require('../../services/utit-of-work/v2/behaviors/second.behavior');
const { FileManager } = require('../../services/file-manager/model/f-manager.model');
const { DBAdapter, ValidatiionSchemas } = require('../../services/db-adapter/db-adapter.model');
const { InMemoryDataBase } = require('../../services/in-memory-db/model/db.model');

describe('PostMapper', () => {
    /** @type {PostMapper} */
    let postMapper;
    /** @type {InMemoryDataBase} */
    let db;

    beforeEach(() => {
        db = new InMemoryDataBase();
        const dbAdapter = new DBAdapter({
            DataBase: db,
            ValidationSchemas: ValidatiionSchemas,
        });

        const fileManager = new FileManager({ rootDir: './test-uploads' });

        // Фабрика для листьев (LeafTryBehavior)
        const leafFactory = new StateControllerFactoryToo({
            tryBehavior: new LeafTryBehavior({ fileManager }),
            rollbackBehavior: new LeafRollbackBehavior(),
        });

        // Фабрика для групп (SecondTryBehavior)
        const groupFactory = new StateControllerFactoryToo({
            tryBehavior: new SecondTryBehavior({
                stateControllerFactory: leafFactory,
                dBAdapter: dbAdapter,
            }),
            rollbackBehavior: new SecondRollbackBehavior(),
        });

        // Сам PostMapper
        postMapper = new PostMapper({
            StateControllerFactory: groupFactory,
            DBAdapter: dbAdapter,
            LeafActions: new Map(), // не используется в новой версии, но нужно для конструктора
        });
    });

    test('должен обработать dataSet с одной группой и вернуть результат', async () => {
        const dataSet = {
            '8e': {
                '01': {
                    title: { action: 'data', payload: 'Test Title' },
                    description: { action: 'data', payload: 'Test Description' },
                    video: { action: 'data', payload: { tableName: 'files', rowId: 'fake-id' } },
                },
            },
        };

        const results = await postMapper.process(dataSet);

        expect(results).toBeDefined();
        expect(results.length).toBe(1);
        expect(results[0]).toMatchObject({
            tableName: 'video-playlist',
            rowId: expect.any(String),
        });
    });

    test('должен обработать dataSet с несколькими группами', async () => {
        const dataSet = {
            '8e': {
                '01': {
                    title: { action: 'data', payload: 'First' },
                    description: { action: 'data', payload: 'First Desc' },
                    video: { action: 'data', payload: { tableName: 'files', rowId: 'id-1' } },
                },
                '02': {
                    title: { action: 'data', payload: 'Second' },
                    description: { action: 'data', payload: 'Second Desc' },
                    video: { action: 'data', payload: { tableName: 'files', rowId: 'id-2' } },
                },
            },
        };

        const results = await postMapper.process(dataSet);

        expect(results.length).toBe(2);
        expect(results[0].tableName).toBe('video-playlist');
        expect(results[1].tableName).toBe('video-playlist');
    });

    test('должен вернуть пустой массив для пустого dataSet', async () => {
        const dataSet = {};

        const results = await postMapper.process(dataSet);

        expect(results).toBeDefined();
        expect(results.length).toBe(0);
    });

    test('не должен возвращать rejected контроллеры в результатах', async () => {
        const dataSet = {
            '8e': {
                'bad_group': {
                    bad_field: { action: 'unknown_action', payload: 'test' },
                },
            },
        };

        const results = await postMapper.process(dataSet);

        // rejected группы не попадают в результаты
        expect(results.length).toBe(0);
    });

    test('должен сохранить данные в БД через DBAdapter', async () => {
        const dataSet = {
            '8e': {
                '01': {
                    title: { action: 'data', payload: 'DB Test' },
                    description: { action: 'data', payload: 'DB Description' },
                    video: { action: 'data', payload: { tableName: 'files', rowId: 'db-fake' } },
                },
            },
        };

        const results = await postMapper.process(dataSet);
        const rowId = results[0].rowId;

        // Проверяем, что данные реально в БД
        const dbResult = db.readOne('video-playlist', rowId);
        expect(dbResult.success.rowData).toMatchObject({
            title: 'DB Test',
            description: 'DB Description',
        });
    });
});