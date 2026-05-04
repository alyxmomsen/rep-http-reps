const { randomBytes } = require('node:crypto');

class InMemoryDataBase {
    /**
     *
     * @param {string} tableName
     * @param {Object} data
     */
    create(tableName, data) {
        if (!this.#database.has(tableName)) {
            console.log(`\x1b[33mcreate new table < ${tableName} >\x1b[0m`);
            this.#database.set(tableName, new Map());
        }

        const table = this.#database.get(tableName);

        const rowId = randomBytes(32).toString('hex');

        table.set(rowId, data);

        console.log(`\x1b[32madded new row in table < ${tableName} >\x1b[0m`);

        return {
            tableName: tableName,
            rowId: rowId,
            data: data,
        };
    }

    readOne(tableName, rowId) {
        const Table = this.#database.get(tableName);
        if (!Table) {
            return {
                failure: {
                    message: 'no table by name',
                    details: {
                        crud: 'read',
                        tableName: tableName,
                    },
                },
            };
        }

        for (const [k, v] of Table.entries()) {
            console.log({ k, v });
        }

        const TableRowData = Table.get(rowId);

        if (TableRowData === undefined) {
            return {
                failure: {
                    message:`row by id ${rowId} is not exist` ,
                }
            }
        }

        return {
            success: {
                rowData: TableRowData,
            },
        };
    }

    readAll(tableName) {
        const table = this.#database.get(tableName);

        console.log({ table });

        if (!table) {
            return {
                success: {
                    rows: {},
                },
            };
        }

        const Rows = {};

        for (const [k, v] of table.entries()) {
            console.log({ k, v });
            Rows[k] = v;
        }

        return {
            success: {
                rows: Rows,
            },
        };
    }

    /**
     * @type {Map<string,Map<string,Object>>}
     */
    #database;

    constructor() {
        this.#database = new Map();
    }
}

module.exports = { InMemoryDataBase };
