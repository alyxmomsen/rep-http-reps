// __tests__/unit/mapper/mapper.schema-format.test.js

const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
const { MULTITABLE_DATA_SCHEMA, PropType, ValueType } = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');

describe('🧪 Mapper - формат схемы', () => {
    test('документирует ожидаемый формат схемы', () => {
        // Это не столько тест, сколько документация
        const validSchema = {
            someKey: {                                // ключ может быть любым
                property: {                           // обязательное поле property
                    type: 'dinamic',                  // 'dinamic' или 'static'
                    staticKey: null,                   // для static типа
                    srcPath: 'source.field'            // для dinamic типа
                },
                value: {                               // обязательное поле value
                    type: 'leaf',                       // 'leaf' или 'branch'
                    src: {                               // источник данных
                        path: 'sourceField',             // для leaf типа
                        schema: {                         // для branch типа
                            // вложенная схема
                        }
                    }
                }
            }
        };

        // Проверяем, что с такой схемой все работает
        const mapper = new Mapper(validSchema);
        
        // Но сам validSchema нужно адаптировать под реальные нужды
        // Это просто шаблон для понимания
    });
});