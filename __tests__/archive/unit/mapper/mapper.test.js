// __tests__/unit/mapper/mapper.test.js

const { describe } = require('node:test');
// const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
// const { MULTITABLE_DATA_SCHEMA, PropType, ValueType } = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');
const {
    DataTransformer,
} = require('../../../app/services/_multipart-parser/services/data-transformer/data-transfromer');
const {
    fileDataSetFactory,
} = require('../../../app/services/_multipart-parser/utils/factrories/file-data-set.factory');
const {
    FILE_DATA_SET_SCHEMA,
} = require('../../../app/services/_multipart-parser/services/data-transformer/schemas/file-data-set.schema');

// 1. Тестовые данные - как в реальном приложении
const createTestData = (overrides = {}) => ({
    mime: 'video/mp4',
    filename: 'test.mp4',
    body: Buffer.from('test data'),
    columnName: 'title',
    groupId: '25', // как в DB_TABLES_MAP_SCHEMA
    tableName: 'files',
    ...overrides,
});

describe('🧪 Mapper в контексте приложения', () => {
    let dataTransformer;
    let context;

    beforeEach(() => {
        dataTransformer = new DataTransformer();
        context = {};
    });

    // ===========================================
    // ТЕСТ 1: Базовое преобразование
    // ===========================================
    test('должен преобразовать данные видео-файла в иерархию', () => {
        const dataSet = fileDataSetFactory({
            body: Buffer.from('hello world'),
            contentType: 'text/plain',
            filename: 'foobar.txt',
            groupId: '00',
            linkId: '123',
            tableName: 'files',
        });

        dataTransformer.process(FILE_DATA_SET_SCHEMA, dataSet, context);

        expect(context).toHaveProperty('files');
        expect(context['files']).toHaveProperty('00');
        expect(context['files']['00']).toHaveProperty('mime');

        const mimeData = context['files']['00']['mime'];

        // Исправляем ожидание: fileMIME вместо contentType
        expect(mimeData).toEqual({ data: 'text/plain', dataType: 'string' });
    });

    // // ===========================================
    // // ТЕСТ 2: Накопление данных одной группы
    // // ===========================================
    // test('должен накопить несколько полей одной группы', () => {
    //     // Первое поле - title
    //     dataTransformer.process(MULTITABLE_DATA_SCHEMA, createTestData({
    //         tableName: 'video-files',
    //         groupId: '25',
    //         columnName: 'title',
    //         fileBody: Buffer.from('title data'),
    //         fileMIME: 'text/plain'
    //     }), context);

    //     // Второе поле - description
    //     dataTransformer.process(MULTITABLE_DATA_SCHEMA, createTestData({
    //         tableName: 'video-files',
    //         groupId: '25',
    //         columnName: 'description',
    //         fileBody: Buffer.from('description data'),
    //         fileMIME: 'text/plain'
    //     }), context);

    //     // Проверяем, что оба поля на месте
    //     expect(context['video-files']['25']).toHaveProperty('title');
    //     expect(context['video-files']['25']).toHaveProperty('description');

    //     // Данные не перемешались
    //     expect(context['video-files']['25']['title'].fileBody)
    //         .toEqual(Buffer.from('title data'));
    //     expect(context['video-files']['25']['description'].fileBody)
    //         .toEqual(Buffer.from('description data'));
    // });

    // // ===========================================
    // // ТЕСТ 3: Разные таблицы
    // // ===========================================
    // test('должен разделять данные по разным таблицам', () => {
    //     // Данные для video-files
    //     dataTransformer.process(MULTITABLE_DATA_SCHEMA, createTestData({
    //         tableName: 'video-files',
    //         groupId: '25',
    //         columnName: 'title',
    //         fileBody: Buffer.from('video data')
    //     }), context);

    //     // Данные для users
    //     dataTransformer.process(MULTITABLE_DATA_SCHEMA, {
    //         fileMIME: 'text/plain',
    //         fileName: 'avatar.jpg',
    //         fileBody: Buffer.from('avatar data'),
    //         dataType: 'string',
    //         columnName: 'avatar',
    //         groupId: '25',
    //         tableName: 'users'
    //     }, context);

    //     expect(context).toHaveProperty('video-files');
    //     expect(context).toHaveProperty('users');
    //     expect(context['video-files']['25']['title']).toBeDefined();
    //     expect(context['users']['25']['avatar']).toBeDefined();
    // });
});
