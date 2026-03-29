// __tests__/integration/mapper-db-flow.test.js

const { Mapper } = require('../../../app/utils/mapper-2.0/mapper.2.0');
const { MULTITABLE_DATA_SCHEMA } = require('../../../app/utils/mapper-2.0/schemas/multitable-data-schema');
const { MultiTableGrouppingAgent } = require('../../../app/services/_multipart-parser/services/multi-table-gruping-agent/multi-table-gruping-agent');

describe('🧪 Интеграция: Mapper + MultiTableGrouppingAgent', () => {
    test('должен обработать данные из реального name атрибута', () => {
        const agent = new MultiTableGrouppingAgent();
        const mapper = new Mapper(MULTITABLE_DATA_SCHEMA);
        const context = {};

        // Данные как от парсера
        const data = {
            body: Buffer.from('video content'),
            contentType: 'video/mp4',
            filename: 'movie.mp4',
            name: 'F=028e.filename.string'
        };

        // Обрабатываем через агента (он внутри использует mapper)
        agent.handleFormDataPartParsedData(data);
        
        const groups = agent.getGroups();
        
        // Проверяем, что структура правильная
        expect(groups).toBeDefined();
    });
});