const { InMemoryDataBase } = require('../in-memory-db/model/db.model');

class DBAdapter {
    createOne(tableId, dataSet) {
        console.log({ tableId });

        const Schema =
            this.#validationSchemas[tableId] ||
            (() => {
                throw new Error(`DBAdapter::create: incorrect tableId`);
            });

        const tableName = DBAdapter.TablesMap[tableId];

        const IncorrectPropsPool = {};
        const ProcessedDataPool = {};

        for (const [schemaProp, schemaConfig] of Object.entries(Schema)) {
            const dataSetProp = dataSet[schemaProp];

            if (!dataSetProp) {
                IncorrectPropsPool[schemaProp] = {
                    message: 'required but not provided',
                };
                continue;
            }

            if (typeof schemaConfig.dataType !== typeof dataSetProp) {
                IncorrectPropsPool[schemaProp] = {
                    message: 'incoming prop type is not correct',
                };
                continue;
            }
        }

        const IncorrectEntries = Object.entries(IncorrectPropsPool);
        if (IncorrectEntries.length) {
            for (const [prop, val] of IncorrectEntries) {
                console.log('IncorrectEntry: ', { prop, val });
            }
            throw new Error(`DBAdapter::create: invalid properties detected`);
        }

        const dbTransactionResult = this.#database.create(
            DBAdapter.TablesMap[tableId],
            dataSet
        );

        const DBAdapterResult = {
            tableId,
            ...dbTransactionResult,
        };

        console.log({ DBAdapterResult });

        return DBAdapterResult;
    }

    readOne(tableId, rowId) {
        const tableName = DBAdapter.TablesMap[tableId];

        if (!tableName) {
            return {
                failure: {
                    message: 'incorrect table-id',
                    details: {
                        tableId: tableId,
                    },
                },
            };
        }

        return {
            ...this.#database.readOne(DBAdapter.TablesMap[tableId], rowId),
        };
    }

    readAll (tableId) {
        const tableName = DBAdapter.TablesMap[tableId];

        console.log({tableName});

        const dataBaseResult = this.#database.readAll(tableName)

        console.log({dataBaseResult});

        return {
            success:dataBaseResult.success,
        }
    }

    static TablesNames = {
        FILES: 'files',
        VIDEO_PLAYLIST: 'video-playlist',
    };

    static TablesMap = {
        25: DBAdapter.TablesNames.FILES,
        '8e': DBAdapter.TablesNames.VIDEO_PLAYLIST,
        Code: {
            Files: '25',
            PlayList: '8e',
        },
        TableName: {
            25: DBAdapter.TablesNames.FILES,
            '8e': DBAdapter.TablesNames.VIDEO_PLAYLIST,
        },
    };

    /**
     * @type {Object.<string,{required:boolean}}
     */
    #validationSchemas;

    /**
     * @type {InMemoryDataBase}
     */
    #database;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.ValidationSchemas
     * @param {InMemoryDataBase} deps.DataBase
     */
    constructor(deps = {}) {
        if (!deps.ValidationSchemas) {
            throw new Error(
                `DBAdapter::constructor: deps.ValidationSchemas required`
            );
        }

        if (!deps.DataBase) {
            throw new Error(`DBAdapter::constructor: deps.DataBase required`);
        }

        this.#validationSchemas = deps.ValidationSchemas;
        this.#database = deps.DataBase;
    }
}

const ValidatiionSchemas = {
    25: {
        originalFileName: {
            required: true,
            dataType: 'string',
        },
        fileSystemFileName: {
            required: true,
            dataType: 'string',
        },
        mime: {
            required: true,
            dataType: 'string',
        },
    },
    '8e': {
        title: {
            required: true,
            dataType: 'string',
        },
        description: {
            required: true,
            dataType: 'string',
        },
        video: {
            required: true,
            dataType: {
                tableId: 'string',
                rowId: 'string',
            },
        },
    },
};

module.exports = { DBAdapter, ValidatiionSchemas };
