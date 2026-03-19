// __tests__/unit/mapper/mapper.test.js

const { describe } = require('node:test');
const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
const { MULTITABLE_DATA_SCHEMA, PropType, ValueType } = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');

// 1. Тестовые данные - как в реальном приложении
const createTestData = (overrides = {}) => ({
    fileMIME: 'video/mp4',
    fileName: 'test.mp4',
    fileBody: Buffer.from('test data'),
    dataType: 'string',
    columnName: 'title',
    groupId: '25', // как в DB_TABLES_MAP_SCHEMA
    tableName: 'video-files',
    ...overrides
});

describe('🧪 Mapper в контексте приложения', () => {
    let mapper;
    let context;

    beforeEach(() => {
        mapper = new Mapper(MULTITABLE_DATA_SCHEMA);
        context = {};
    });

    // ===========================================
    // ТЕСТ 1: Базовое преобразование
    // ===========================================
    test('должен преобразовать данные видео-файла в иерархию', () => {
        const data = createTestData({
            tableName: 'video-files',
            groupId: '25',
            columnName: 'title',
            fileMIME: 'video/mp4',  // обратите внимание: fileMIME, а не contentType
            fileBody: Buffer.from('file content'),
            dataType: 'string'
        });

        mapper.process(MULTITABLE_DATA_SCHEMA, data, context);

        expect(context).toHaveProperty('video-files');
        expect(context['video-files']).toHaveProperty('25');
        expect(context['video-files']['25']).toHaveProperty('title');
    
        const titleData = context['video-files']['25']['title'];
    
        // Исправляем ожидание: fileMIME вместо contentType
        expect(titleData).toEqual({
            fileMIME: 'video/mp4',        // было contentType, стало fileMIME
            fileBody: Buffer.from('file content'),
            dataType: 'string'
        });
    });

    // ===========================================
    // ТЕСТ 2: Накопление данных одной группы
    // ===========================================
    test('должен накопить несколько полей одной группы', () => {
        // Первое поле - title
        mapper.process(MULTITABLE_DATA_SCHEMA, createTestData({
            tableName: 'video-files',
            groupId: '25',
            columnName: 'title',
            fileBody: Buffer.from('title data'),
            fileMIME: 'text/plain'
        }), context);

        // Второе поле - description
        mapper.process(MULTITABLE_DATA_SCHEMA, createTestData({
            tableName: 'video-files',
            groupId: '25',
            columnName: 'description',
            fileBody: Buffer.from('description data'),
            fileMIME: 'text/plain'
        }), context);

        // Проверяем, что оба поля на месте
        expect(context['video-files']['25']).toHaveProperty('title');
        expect(context['video-files']['25']).toHaveProperty('description');
        
        // Данные не перемешались
        expect(context['video-files']['25']['title'].fileBody)
            .toEqual(Buffer.from('title data'));
        expect(context['video-files']['25']['description'].fileBody)
            .toEqual(Buffer.from('description data'));
    });

    // ===========================================
    // ТЕСТ 3: Разные таблицы
    // ===========================================
    test('должен разделять данные по разным таблицам', () => {
        // Данные для video-files
        mapper.process(MULTITABLE_DATA_SCHEMA, createTestData({
            tableName: 'video-files',
            groupId: '25',
            columnName: 'title',
            fileBody: Buffer.from('video data')
        }), context);

        // Данные для users
        mapper.process(MULTITABLE_DATA_SCHEMA, {
            fileMIME: 'text/plain',
            fileName: 'avatar.jpg',
            fileBody: Buffer.from('avatar data'),
            dataType: 'string',
            columnName: 'avatar',
            groupId: '25',
            tableName: 'users'
        }, context);

        expect(context).toHaveProperty('video-files');
        expect(context).toHaveProperty('users');
        expect(context['video-files']['25']['title']).toBeDefined();
        expect(context['users']['25']['avatar']).toBeDefined();
    });
});