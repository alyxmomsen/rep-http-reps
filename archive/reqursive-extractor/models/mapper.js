class Mapper {
    process(data, context) {
        console.log({ data });

        const Types = dataTypes();

        for (const [k, v] of Object.entries(this.#schema)) {
            const { type, keyPath } = v;

            if (type === Types.Dinamic) {
                const dataPropertyValue = data[keyPath];

                if (dataPropertyValue === undefined) {
                    throw new Error(`no property ${keyPath}`);
                }

                if (context[dataPropertyValue] === undefined) {
                }

                console.log({ dataPropertyValue });
            }
        }

        return {};
    }

    #schema;

    constructor(schema) {
        this.#schema = schema;
    }
}

const mapper = new Mapper(schemaProducer(), dataTypes());

const context = {};

for (const chunk of dataHash()) {
    mapper.process(chunk, context);
}

function DataProperties() {
    return {
        TABLE_NAME: 'tableName',
        GROUP_ID: 'groupId',
        COLUMN_NAME: 'columnName',
        FILE_NAME: 'fileName',
        CONTENT_TYPE: 'fileMIME',
        BODY: 'fileBody',
    };
}

function dataHash() {
    const Keys = DataProperties();

    return [
        {
            [Keys.TABLE_NAME]: 'table_1',
            [Keys.GROUP_ID]: 'group_1',
            [Keys.COLUMN_NAME]: 'title',
            [Keys.FILE_NAME]: 'hello world 0',
            [Keys.CONTENT_TYPE]: 'text/plain',
            [Keys.BODY]: '0101011100100101',
        },
        {
            [Keys.TABLE_NAME]: 'table_1',
            [Keys.GROUP_ID]: 'group_1',
            [Keys.COLUMN_NAME]: 'descriptiom',
            [Keys.FILE_NAME]: 'hello world 1',
            [Keys.CONTENT_TYPE]: 'text/plain',
            [Keys.BODY]: '0010001011110101',
        },
        {
            [Keys.TABLE_NAME]: 'table_1',
            [Keys.GROUP_ID]: 'group_2',
            [Keys.COLUMN_NAME]: 'title',
            [Keys.FILE_NAME]: 'hello world 3',
            [Keys.CONTENT_TYPE]: 'text/plain',
            [Keys.BODY]: '0101011010001101',
        },
        {
            [Keys.TABLE_NAME]: 'table_1',
            [Keys.GROUP_ID]: 'group_2',
            [Keys.COLUMN_NAME]: 'description',
            [Keys.FILE_NAME]: 'hello world 4',
            [Keys.CONTENT_TYPE]: 'text/plain',
            [Keys.BODY]: '0101011100100101',
        },
    ];
}

function dataTypes() {
    return {
        Dinamic: 'dinamic',
        Static: 'static',
    };
}

function schemaProducer() {
    const DataTypes = dataTypes();
    return {
        tableName: {
            type: DataTypes.Dinamic,
            keyPath: 'tableName',
        },
    };
}
