const { InMemoryDataBase } = require('../../services/in-memory-db/model/db.model');

describe('InMemoryDataBase', () => {
    /** @type {InMemoryDataBase} */
    let db;

    beforeEach(() => {
        db = new InMemoryDataBase();
    });

    test('должен создать таблицу и добавить строку', () => {
        const result = db.create('test_table', { name: 'John' });

        expect(result).toMatchObject({
            tableName: 'test_table',
            rowId: expect.any(String),
            data: { name: 'John' },
        });
    });

    test('должен прочитать строку по ID', () => {
        const created = db.create('test_table', { name: 'John' });
        const result = db.readOne('test_table', created.rowId);

        expect(result.success.rowData).toEqual({ name: 'John' });
    });

    test('должен вернуть failure, если таблица не существует', () => {
        const result = db.readOne('non_existent_table', 'some_id');

        expect(result.failure).toBeDefined();
        expect(result.failure.message).toBe('no table by name');
    });

    test('должен вернуть success с undefined, если строка не найдена (баг)', () => {
        db.create('test_table', { name: 'John' });
        const result = db.readOne('test_table', 'non_existent_row');

        // Это текущее поведение — баг. Тест документирует его.
        // Когда починишь — изменишь expected на failure.
        expect(result.success).toBeDefined();
        expect(result.success.rowData).toBeUndefined();
    });

    test('readAll должен вернуть все строки таблицы', () => {
        db.create('test_table', { name: 'John' });
        db.create('test_table', { name: 'Jane' });

        const result = db.readAll('test_table');

        const rows = Object.values(result.success.rows);
        expect(rows.length).toBe(2);
        expect(rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'John' }),
                expect.objectContaining({ name: 'Jane' }),
            ])
        );
    });

    test('readAll должен вернуть пустой объект для несуществующей таблицы', () => {
        const result = db.readAll('non_existent');

        expect(result.success.rows).toEqual({});
    });
});