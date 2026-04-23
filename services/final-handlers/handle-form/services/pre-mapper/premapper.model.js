class PreMapper {
    /**
     *
     * @param {Object} schema
     * @param {Object} dataSet
     * @param {Object} context
     */
    process(schema, dataSet, context) {
        const CurrentContext = { ...context };

        const Actions = {
            /**
             *
             * @param {string} value
             * @returns {}
             */
            Leaf: (value, dataSet) => {
                console.log({ value, dataSet });

                const { action, payload } = value;

                return {
                    action,
                    payload: payload.startsWith('__')
                        ? dataSet[payload.replace('__', '')]
                        : payload,
                };
            },
            Branch: (value, dataSet) => {
                this.process(value, dataSet, CurrentContext);
            },
        };

        for (const [propertyKey, Configuration] of Object.entries(schema)) {
            const { type: ActionType, value: ActionPayload } = Configuration;

            console.log({ Configuration });

            const newPropertyName = propertyKey.startsWith('__')
                ? dataSet[propertyKey.replace('__', '')]
                : propertyKey;

            if (ActionType === 'branch') {
                /**
                 * the option is that
                 * if newproperty is already exists in the current context
                 * then we never override this property
                 */

                if (CurrentContext[newPropertyName]) {
                    const InnerProcessResult = this.process(
                        ActionPayload,
                        dataSet,
                        CurrentContext[newPropertyName]
                    );

                    for (const [k, v] of Object.entries(InnerProcessResult)) {
                        CurrentContext[newPropertyName][k] = v;
                    }
                } else {
                    const InnerProcessResult = this.process(
                        ActionPayload,
                        dataSet,
                        {}
                    );
                    CurrentContext[newPropertyName] = InnerProcessResult;
                }
                continue;
            }

            CurrentContext[newPropertyName] = Actions['Leaf'](
                ActionPayload,
                dataSet
            );
        }

        return CurrentContext;
    }

    constructor(deps = {}) {}
}

const SchemaTypes = {
    Branch: 'branch',
    Leaf: 'leaf',
};

const PreMapperSchemas = {
    File: {
        __tableId: {
            type: SchemaTypes.Branch,
            value: {
                __groupId: {
                    type: SchemaTypes.Branch,
                    value: {
                        originalFileName: {
                            type: SchemaTypes.Leaf,
                            value: {
                                action: 'data',
                                payload: '__filename',
                            },
                        },
                        mime: {
                            type: SchemaTypes.Leaf,
                            value: {
                                action: 'data',
                                payload: '__contentType',
                            },
                        },
                        fileSystemFileName: {
                            type: SchemaTypes.Leaf,
                            value: {
                                action: 'file',
                                payload: '__body', // буферные данные для загрузки в файловую систему
                            },
                        },
                    },
                },
            },
        },
    },
    Linked: {
        __tableId: {
            type: SchemaTypes.Branch,
            value: {
                __groupId: {
                    type: SchemaTypes.Branch,
                    value: {
                        __columnName: {
                            type: SchemaTypes.Leaf,
                            value: {
                                action: 'link',
                                payload: '__body',
                            },
                        },
                    },
                },
            },
        },
    },
    Regular: {
        __tableId: {
            type: SchemaTypes.Branch,
            value: {
                __groupId: {
                    type: SchemaTypes.Branch,
                    value: {
                        __columnName: {
                            type: SchemaTypes.Leaf,
                            value: {
                                action: 'data',
                                payload: '__body',
                            },
                        },
                    },
                },
            },
        },
    },
};

module.exports = { PreMapper, PreMapperSchemas };
