// __tests__/unit/mapper/mapper.error.test.js

const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
const {
    MULTITABLE_DATA_SCHEMA,
    PropType,
    ValueType,
} = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');

describe('🧪 Mapper - обработка ошибок', () => {
    test('должен обработать ошибку при доступе к несуществующему свойству', () => {
        const mapper = new Mapper(MULTITABLE_DATA_SCHEMA);
        const badSchema = {
            test: {
                property: {
                    type: PropType.Dinamic,
                    srcPath: 'nonexistent.path', // путь, которого нет
                },
                value: {
                    type: ValueType.Leaf,
                    src: { path: 'some.path' },
                },
            },
        };

        const source = { some: { path: 'value' } };
        const context = {};

        // Просто проверяем, что не падает
        expect(() => {
            mapper.process(badSchema, source, context);
        }).not.toThrow();

        // Или если должно падать - проверяем конкретную ошибку
        // expect(() => {
        //     mapper.process(badSchema, source, context);
        // }).toThrow();
    });
});
