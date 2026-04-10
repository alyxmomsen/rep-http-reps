// __tests__/unit/mapper/mapper.constructor.test.js

const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
const {
    MULTITABLE_DATA_SCHEMA,
    PropType,
    ValueType,
} = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');

describe('🧪 Mapper - конструктор', () => {
    test('должен создать экземпляр класса', () => {
        const mapper = new Mapper({});
        expect(mapper).toBeInstanceOf(Mapper);
    });

    test('должен принять любую схему без ошибок при создании', () => {
        const schemas = [
            {},
            { test: 'schema' },
            MULTITABLE_DATA_SCHEMA,
            { complex: { nested: { schema: true } } },
        ];

        schemas.forEach((schema) => {
            expect(() => {
                new Mapper(schema); // создание всегда работает
            }).not.toThrow();
        });
    });

    test('созданный экземпляр должен обрабатывать данные с правильной схемой', () => {
        const mapper = new Mapper(MULTITABLE_DATA_SCHEMA);

        const testData = {
            tableName: 'test-table',
            groupId: 'test-group',
            columnName: 'test-column',
            fileMIME: 'text/plain',
            fileBody: Buffer.from('test content'),
            dataType: 'string',
        };

        const context = {};

        const result = mapper.process(
            MULTITABLE_DATA_SCHEMA,
            testData,
            context
        );

        expect(result).toBeDefined();
    });

    test('разные экземпляры не должны влиять друг на друга', () => {
        const mapper1 = new Mapper(MULTITABLE_DATA_SCHEMA);
        const mapper2 = new Mapper(MULTITABLE_DATA_SCHEMA); // та же схема

        const context1 = {};
        const context2 = {};

        const data1 = {
            tableName: 'table1',
            groupId: 'group1',
            columnName: 'col1',
            fileMIME: 'text/plain',
            fileBody: Buffer.from('data1'),
            dataType: 'string',
        };

        const data2 = {
            tableName: 'table2',
            groupId: 'group2',
            columnName: 'col2',
            fileMIME: 'text/plain',
            fileBody: Buffer.from('data2'),
            dataType: 'string',
        };

        mapper1.process(MULTITABLE_DATA_SCHEMA, data1, context1);
        mapper2.process(MULTITABLE_DATA_SCHEMA, data2, context2); // та же схема

        // Контексты разные и содержат разные данные
        expect(context1).toHaveProperty('table1');
        expect(context2).toHaveProperty('table2');
        expect(context1).not.toHaveProperty('table2');
        expect(context2).not.toHaveProperty('table1');
    });

    // Новый тест: проверяем, что валидная схема работает
    test('должен работать с минимальной валидной схемой', () => {
        // Создаем минимальную валидную схему
        const minimalSchema = {
            test: {
                property: {
                    type: PropType.Static,
                    staticKey: 'result',
                    srcPath: null,
                },
                value: {
                    type: ValueType.Leaf,
                    src: { path: 'data' },
                },
            },
        };

        const mapper = new Mapper(minimalSchema);
        const context = {};
        const source = { data: 'test value' };

        const result = mapper.process(minimalSchema, source, context);

        expect(result).toHaveProperty('result', 'test value');
    });

    // Тест на невалидную схему
    test('должен выбросить ошибку при process с невалидной схемой', () => {
        const mapper = new Mapper({ invalid: 'schema' });
        const context = {};
        const source = {};

        expect(() => {
            mapper.process({ invalid: 'schema' }, source, context);
        }).toThrow('INCORRECT SCHEMA');
    });
});
