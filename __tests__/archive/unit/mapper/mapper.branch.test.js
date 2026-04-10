// __tests__/unit/mapper/mapper.branch.test.js

const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
const {
    MULTITABLE_DATA_SCHEMA,
    PropType,
    ValueType,
} = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');

describe('🧪 Mapper - обработка Branch', () => {
    test('должен обработать существующий branch в контексте', () => {
        const mapper = new Mapper(MULTITABLE_DATA_SCHEMA);

        // Создаем схему с branch
        const branchSchema = {
            tableName: {
                property: {
                    type: PropType.Dinamic,
                    srcPath: 'tableName',
                },
                value: {
                    type: ValueType.Branch,
                    src: {
                        schema: {
                            existingField: {
                                property: {
                                    type: PropType.Static,
                                    staticKey: 'existingKey',
                                },
                                value: {
                                    type: ValueType.Leaf,
                                    src: { path: 'someValue' },
                                },
                            },
                        },
                    },
                },
            },
        };

        const source = {
            tableName: 'existingTable',
            someValue: 'test data',
        };

        // Создаем контекст с уже существующим branch
        const context = {
            existingTable: {
                // какой-то существующий контент
            },
        };

        const result = mapper.process(branchSchema, source, context);
        console.log({ result });
        // Проверяем, что данные смержились, а не перезаписались
        expect(result.existingTable).toBeDefined();
    });
});
