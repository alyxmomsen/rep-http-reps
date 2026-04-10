const { PropertyKeyType, PropertyValueType } = require('./mapper');

const SCHEMA = {
    tables: {
        // Node
        type: '', // what is this
        keyPath: 'tables',
        valueSchema: {
            groups: {
                // Node
                type: NodeTypes.DINAMIC,
                keyPath: 'groupId',
                valueSchema: {
                    fields: {
                        // Node
                        type: NodeTypes.STATIC,
                        valueSchema: {
                            fileName: {
                                type: NodeTypes.LEAF,
                                source: 'fileName',
                            },
                            fileName: {
                                type: NodeTypes.LEAF,
                                source: 'fileMIME',
                            },
                            fileName: {
                                type: NodeTypes.LEAF,
                                source: 'fileBody',
                            },
                        },
                    },
                },
            },
        },
    },
};

module.exports = {
    SCHEMA,
};
