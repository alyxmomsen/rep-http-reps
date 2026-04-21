const { randomBytes } = require('node:crypto');
const { printDataUtil } = require('./utils/print-data.util');

/**
 * @param {number|string} r
 * @param {number|string} g
 * @param {number|string} b
 * @returns {string}
 */
const createColorizerString = (r, g, b) => {
    return `\x1b[38;2;${r};${g};${b}m`;
};

const COLORS = {
    A: createColorizerString(166, 57, 140),
    B: createColorizerString(30, 64, 105),
    C: createColorizerString(141, 168, 46),
    D: `\x1b[0m`,
};

class DataBase {
    /**
     *
     * @param {string} event
     * @param {(event:{data:Map<string,Object>}) => void} listener
     */
    addEventListener(event, listener) {
        // ⚠️ override event listener
        this.#eventListeners.set(event, listener);
    }

    /**
     * data:Object.<columnName,columnValue>
     * returns: new row Id
     * @param {string} tableId
     * @param {Object.<string,string>} data
     * @returns {string}
     */
    createOne(tableId, data) {
        if (typeof data !== 'object') {
            throw new Error(
                `DataBase.createOne: required an Object but provided not`
            );
        }

        /**
         * @type {Map<string,string>}
         */
        const newRow = new Map();
        for (const [columnName, columnValue] of Object.entries(data)) {
            newRow.set(columnName, columnValue);
        }

        const newRowIdHash = randomBytes(32).toString('hex');

        const tableByTableId = this.#data.get(tableId);
        /* на всякий случай, проверяем что такого ID не существует */
        if (!tableByTableId) {
            /* если таблицы с таким именем не существует
            заводим новую и сразу же добавляем строку, с уникальным Id */
            this.#data.set(tableId, new Map([[newRowIdHash, newRow]]));
            /* вывод в консоль для отладки */
            // printDataUtil(this.#data);
            /* микротранзакция выполнена, выходим из метода */
            return {
                success: {
                    newRowIdHash,
                    // для вывода используем те же данные что пришли,
                    // так как они уже прошли валидацию
                    row: data,
                },
            };
        }

        /* если таблица существует, пушим строку */
        tableByTableId.set(newRowIdHash, newRow);
        /* вывод в консоль для отладки */
        // printDataUtil(this.#data);
        // на момент разработки , выводим всю базу данных
        this.#emit('onOperationEnd');
        return {
            success: {
                newRowIdHash,
                // для вывода используем те же данные что пришли,
                // так как они уже прошли валидацию
                row: data,
            },
        };
    }

    /**
     *
     * @param {string} tableId
     * @param {string} rowId
     */
    readOne(tableId, rowId) {
        const tableById = this.#data.get(tableId);
        if (!tableById) {
            return {
                error: {
                    message: `table by id ${tableById} is not exist`,
                },
            };
        }

        const rowById = tableById.get(rowId);

        if (!rowById) {
            return {
                error: {
                    message: `row by id ${rowId} is not exist`,
                },
            };
        }

        return {
            success: {
                rowById,
            },
        };
    }

    readAll(tableId) {
        const tableRows = this.#data.get(tableId);

        if (!tableRows) {
            return {
                error: {
                    message: `DataBase.readAll: no table by id ${tableId}`,
                },
            };
        }

        return {
            success: {
                tableRows,
            },
        };
    }

    updateOne(tableId, rowId, data) {
        return {};
    }

    deleteOne(tableId, rowId) {
        return {};
    }

    deleteTable(tableId) {
        return {};
    }

    #emit(eventName) {
        for (const [name, handler] of this.#eventListeners.entries()) {
            if (name === eventName) {
                handler({ data: this.#data });
                break;
            }
        }
        return;
    }

    /**
     * @type {Map<string,Object>}
     */
    #data;

    // eventListeners

    /**
     * @type {Map<string,(event:{data:Object}) => void>}
     */
    #eventListeners;

    constructor() {
        this.#data = new Map();

        this.#eventListeners = new Map();
    }
}

module.exports = { DataBase };
