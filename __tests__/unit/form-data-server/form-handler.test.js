// __tests__/unit/form-data-server/form-handler.test.js

const { IncomingMessage, ServerResponse } = require('node:http');
const { FormHandler } = require('../../../app/services/form-data-server/form-parser.router.entry-point');
const { sendFallBack } = require('../../../app/utils/error-factory');
const { contentTypeHandlersRouter } = require('../../../app/services/form-data-server/controller/content-type.controller');

// Мокаем sendFallBack, чтобы не мешал тестам
jest.mock('../../../app/utils/error-factory', () => ({
    sendFallBack: jest.fn()
}));

describe('🧪 FormHandler.processForm', () => {
    let req;
    let res;
    let mockRouter;
    let mockHandlerController;

    beforeEach(() => {
        // Создаём реальные req/res для тестов
        req = new IncomingMessage(null);
        res = new ServerResponse(req);
        
        // Мокаем методы res
        res.writeHead = jest.fn().mockReturnThis();
        res.end = jest.fn().mockReturnThis();
        
        // Сбрасываем мок sendFallBack перед каждым тестом
        sendFallBack.mockClear();
        
        // Создаём мок контроллера, который будет возвращать handler
        mockHandlerController = {
            handle: jest.fn()
        };
        
        // Создаём мок роутера
        mockRouter = {
            getHandlerController: jest.fn().mockReturnValue(mockHandlerController)
        };
    });

    // ===========================================
    // ТЕСТ 1: Успешная обработка
    // ===========================================
    test('✅ должен успешно обработать запрос с валидным content-type', async () => {
        // Подготовка
        req.headers = {
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary'
        };
        
        mockHandlerController.handle.mockResolvedValue({
            success: { data: 'test' },
            error: null
        });
        
        // Действие
        await FormHandler.processForm(req, res, { contentTypeHandlersRouter:mockRouter });
        
        // Проверки
        expect(mockRouter.getHandlerController).toHaveBeenCalledWith('multipart/form-data');
        expect(mockHandlerController.handle).toHaveBeenCalled();
        expect(res.writeHead).toHaveBeenCalledWith(200, {
            'content-type': 'application/json'
        });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({
            success: { data: 'test' }
        }));
    });

    // // ===========================================
    // // ТЕСТ 2: Отсутствует content-type заголовок
    // // ===========================================
    // test('❌ должен вернуть 400, если нет content-type заголовка', async () => {
    //     // Подготовка
    //     req.headers = {}; // нет content-type
        
    //     // Действие
    //     await FormHandler.processForm(req, res, { contentTypeHandlersRouter:mockRouter });
        
    //     // Проверки
    //     expect(sendFallBack).toHaveBeenCalledWith(
    //         res, 400,
    //         'FormHandler::processForm',
    //         'no content-type header',
    //         { conttentTypeHeader: undefined }
    //     );
    //     expect(mockRouter.getHandlerController).not.toHaveBeenCalled();
    // });

    // ===========================================
    // ТЕСТ 3: Неизвестный content-type
    // ===========================================
    test('❌ должен обработать ошибку при неизвестном content-type', async () => {
        // Подготовка
        req.headers = {
            'content-type': 'unknown/type'
        };
        
        mockRouter.getHandlerController.mockImplementation(() => {
            throw new Error('no handler for <unknown/type> content-type');
        });
        
        // Действие
        await FormHandler.processForm(req, res, { contentTypeHandlersRouter:mockRouter });
        
        // Проверки
        expect(mockRouter.getHandlerController).toHaveBeenCalledWith('unknown/type');
        expect(res.writeHead).toHaveBeenCalledWith(520, {
            'content-type': 'application/json'
        });
        expect(res.end).toHaveBeenCalled();
        
        // // Проверяем, что в ответе есть ошибка
        const responseBody = JSON.parse(res.end.mock.calls[0][0]);
        expect(responseBody).toHaveProperty('message', 'unknown error');
        expect(responseBody).toHaveProperty('error');
    });

    // // ===========================================
    // // ТЕСТ 4: Обработчик вернул ошибку
    // // ===========================================
    // test('❌ должен обработать случай, когда handler вернул error', async () => {
    //     // Подготовка
    //     req.headers = {
    //         'content-type': 'multipart/form-data; boundary=----'
    //     };
        
    //     mockHandlerController.handle.mockResolvedValue({
    //         success: null,
    //         error: { message: 'something went wrong' }
    //     });
        
    //     // Действие
    //     await FormHandler.processForm(req, res, { contentTypeHandlersRouter:mockRouter });
        
    //     // Проверки
    //     expect(res.end).toHaveBeenCalledWith(JSON.stringify({ foo: 'bar' }));
    // });

    // ===========================================
    // ТЕСТ 5: Обработчик вернул null success
    // ===========================================
    test('❌ должен вернуть 500, если success = null', async () => {
        // Подготовка
        req.headers = {
            'content-type': 'multipart/form-data; boundary=----'
        };
        
        mockHandlerController.handle.mockResolvedValue({
            success: null,
            error: null
        });
        
        // Действие
        await FormHandler.processForm(req, res, { contentTypeHandlersRouter:mockRouter });
        
        // Проверки
        expect(res.writeHead).toHaveBeenCalledWith(500, {
            'content-type': 'application/json'
        });
        // expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: 'internal error' }));
    });
});