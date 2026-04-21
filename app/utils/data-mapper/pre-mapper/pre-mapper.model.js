const ValueType = {
    Leaf: 'leaf',
    Branch: 'branch',
};

const REGULAR_COLUMN_SCHEMA = {
    __tableName: {
        type: ValueType.Branch,
        value: {
            __groupId: {
                type: ValueType.Branch,
                value: {
                    __columnName: {
                        type: ValueType.Leaf,
                        value: {
                            action: 'data',
                            payload: '__body',
                        },
                    },
                },
            },
        },
    },
};

const LINK_COLUMN_SCHEMA = {
    __tableName: {
        type: ValueType.Branch,
        value: {
            __groupId: {
                type: ValueType.Branch,
                value: {
                    __columnName: {
                        type: ValueType.Leaf,
                        value: {
                            action: 'link',
                            payload: '__body',
                        },
                    },
                },
            },
        },
    },
};

const FILES_SCHEMA = {
    __tableName: {
        type: ValueType.Branch,
        value: {
            __groupId: {
                type: ValueType.Branch,
                value: {
                    originalFileName: {
                        type: ValueType.Leaf,
                        value: {
                            action: 'data',
                            payload: '__filename',
                        },
                    },
                    mime: {
                        type: ValueType.Leaf,
                        value: {
                            action: 'data',
                            payload: '__contentType',
                        },
                    },
                    fileSystemFilename: {
                        type: ValueType.Leaf,
                        value: {
                            action: 'file',
                            payload: '__body',
                        },
                    },
                },
            },
        },
    },
};

class PreMapper {
    process(schema, dataSet, parentContext = {}) {
        const currentContext = { ...parentContext };

        for (const [prop, config] of Object.entries(schema)) {
            const { type, value } = config;

            const newProp = prop.startsWith('__')
                ? dataSet[prop.replace('__', '')]
                : prop;

            if (type === ValueType.Branch) {
                const nextSchema = value;

                if (currentContext[newProp]) {
                    const branchHandlerResult = this.#branchHandler(
                        nextSchema,
                        dataSet,
                        currentContext[newProp]
                    );
                    for (const [k, v] of Object.entries(branchHandlerResult)) {
                        currentContext[newProp][k] = v;
                    }
                } else {
                    const branchHandlerResult = this.#branchHandler(
                        nextSchema,
                        dataSet,
                        {}
                    );
                    currentContext[newProp] = branchHandlerResult;
                }
            } else {
                if (currentContext[newProp]) {
                    const leafHandlerResult = this.#leafHandler(
                        value,
                        dataSet,
                        currentContext[newProp]
                    );
                    for (const [k, v] of Object.entries(leafHandlerResult)) {
                        currentContext[newProp][k] = v;
                    }
                } else {
                    const leafHandlerResult = this.#leafHandler(
                        value,
                        dataSet,
                        {}
                    );
                    currentContext[newProp] = leafHandlerResult;
                }
            }
        }

        return currentContext;
    }

    #branchHandler(schema, dataSet, context) {
        const result = this.process(schema, dataSet, context);
        return result;
    }

    #leafHandler(leafData, dataSet, context) {
        const fn = () => {
            /**
             * @type {Object}
             */
            const returnValue = {
                action: leafData.action,
            };

            if (typeof leafData.payload === 'object') {
                returnValue.payload = leafData.payload;
                return returnValue;
            }

            returnValue.payload = leafData.payload.startsWith('__')
                ? dataSet[leafData.payload.replace('__', '')]
                : leafData.payload;

            return returnValue;
        };

        return fn();
    }

    constructor() {}
}

module.exports = {
    PreMapper,
    FILES_SCHEMA,
    LINK_COLUMN_SCHEMA,
    REGULAR_COLUMN_SCHEMA,
};
