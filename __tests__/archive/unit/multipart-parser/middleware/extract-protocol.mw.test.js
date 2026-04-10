const extractProtocolMiddleware = require('../../../../app/services/_multipart-parser/middleware/extract-protocol.mw');
const {
    extractProtocolName,
} = require('../../../../app/services/_multipart-parser/services/name-attribute-parser/utlils/extract-protocol-name');

// Мокаем extractProtocolName, чтобы изолировать тест
jest.mock(
    '../../../../app/services/_multipart-parser/services/name-attribute-parser/utlils/extract-protocol-name'
);

describe('🧪 extractProtocolMiddleware', () => {
    let middleware;
    let mockExtractProtocolName;

    beforeEach(() => {
        // Очищаем мок перед каждым тестом
        jest.clearAllMocks();

        // Создаём мок для extractProtocolName
        mockExtractProtocolName = jest.fn();

        // Создаём middleware с моком
        middleware = extractProtocolMiddleware({
            extractProtocolName: mockExtractProtocolName,
        });
    });

    // ===========================================
    // ТЕСТ 1: Успешный сценарий
    // ===========================================
    test('✅ должен успешно извлечь протокол и передать данные дальше', async () => {
        // Подготовка
        const payload = {
            data: {
                body: Buffer.from('test'),
                contentType: 'text/plain',
                filename: 'test.txt',
                name: 'multitable://R=0025.title.string',
            },
        };

        const nextMock = jest.fn().mockResolvedValue('next result');

        mockExtractProtocolName.mockReturnValue({
            protocolName: 'multitable',
            data: 'R=0025.title.string',
        });

        // Действие
        const result = await middleware(payload, nextMock);

        // Проверки
        expect(mockExtractProtocolName).toHaveBeenCalledWith(
            'multitable://R=0025.title.string'
        );
        expect(nextMock).toHaveBeenCalledWith({
            body: Buffer.from('test'),
            contentType: 'text/plain',
            filename: 'test.txt',
            nameAttrValue: 'R=0025.title.string',
        });
        expect(result).toBe('next result');
    });

    // ===========================================
    // ТЕСТ 2: Неизвестный протокол
    // ===========================================
    test('❌ должен вернуть "no name-protocol" если протокол не "multitable"', async () => {
        const payload = {
            data: {
                body: Buffer.from('test'),
                contentType: 'text/plain',
                filename: 'test.txt',
                name: 'unknown://some.data',
            },
        };

        const nextMock = jest.fn();

        mockExtractProtocolName.mockReturnValue({
            protocolName: 'unknown',
            data: 'some.data',
        });

        const result = await middleware(payload, nextMock);

        expect(result).toBe('no name-protocol');
        expect(nextMock).not.toHaveBeenCalled();
    });

    // ===========================================
    // ТЕСТ 3: Пустой name атрибут
    // ===========================================
    test('❌ должен обработать отсутствие name атрибута', async () => {
        const payload = {
            data: {
                body: Buffer.from('test'),
                contentType: 'text/plain',
                filename: 'test.txt',
                name: undefined,
            },
        };

        const nextMock = jest.fn();

        mockExtractProtocolName.mockReturnValue({
            protocolName: '',
            data: undefined,
        });

        const result = await middleware(payload, nextMock);

        expect(result).toBe('no name-protocol');
        expect(nextMock).not.toHaveBeenCalled();
    });

    // ===========================================
    // ТЕСТ 4: Отсутствие payload.data
    // ===========================================
    test('❌ должен обработать отсутствие payload.data', async () => {
        const payload = {};
        const nextMock = jest.fn();

        mockExtractProtocolName.mockReturnValue({
            protocolName: '',
            data: undefined,
        });

        const result = await middleware(payload, nextMock);

        expect(result).toBe('no name-protocol');
        expect(nextMock).not.toHaveBeenCalled();
    });

    // ===========================================
    // ТЕСТ 5: Использование реального extractProtocolName (интеграционный)
    // ===========================================
    test('✅ должен работать с реальным extractProtocolName', async () => {
        // Создаём middleware без мока (используем реальную функцию)
        const realMiddleware = extractProtocolMiddleware({});

        const payload = {
            data: {
                body: Buffer.from('test'),
                contentType: 'text/plain',
                filename: 'test.txt',
                name: 'multitable://R=0025.title.string',
            },
        };

        const nextMock = jest.fn().mockResolvedValue('ok');

        const result = await realMiddleware(payload, nextMock);

        expect(nextMock).toHaveBeenCalledWith({
            body: payload.data.body,
            contentType: payload.data.contentType,
            filename: payload.data.filename,
            nameAttrValue: 'R=0025.title.string',
        });
        expect(result).toBe('ok');
    });
});
