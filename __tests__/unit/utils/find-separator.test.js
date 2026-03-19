// __tests__/unit/utils/find-separator.test.js

const { findSeparatorIndexInBuffer } = require('../../../app/utils/find-separator-index-in-buffer.util');

describe('🧪 findSeparatorIndexInBuffer', () => {
    // ===========================================
    // ТЕСТ 1: Исследуем, как функция работает
    // ===========================================
    test('должен найти разделитель в буфере', () => {
        // 1️⃣ ARRANGE
        const data = Buffer.from('hello world');
        const separator = Buffer.from('world');
        
        // Выведем HEX значения, чтобы увидеть, что ищем
        console.log('data HEX:', data);
        console.log('separator HEX:', separator);
        
        // 2️⃣ ACT
        const result = findSeparatorIndexInBuffer(data, separator);
        
        console.log('result:', result);
        
        // 3️⃣ ASSERT - пока не знаем точное значение, просто проверяем,
        // что результат не -1 (то есть что-то нашли)
        expect(result).not.toBe(-1);
    });

    // ===========================================
    // ТЕСТ 2: Проверим с другим разделителем
    // ===========================================
    test('должен найти пробел', () => {
        const data = Buffer.from('hello world');
        const separator = Buffer.from(' ');
        
        const result = findSeparatorIndexInBuffer(data, separator);
        
        console.log('space index:', result); // Должен быть 5
        
        expect(result).toBe(5);
    });

    // ===========================================
    // ТЕСТ 3: Проверим с началом строки
    // ===========================================
    test('должен найти "hello"', () => {
        const data = Buffer.from('hello world');
        const separator = Buffer.from('hello');
        
        const result = findSeparatorIndexInBuffer(data, separator);
        
        console.log('hello index:', result); // Должен быть 0
        
        expect(result).toBe(0);
    });
});