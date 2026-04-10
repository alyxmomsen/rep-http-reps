const LINKED_FIELD_DATA_SET_SCHEMA = {
    __tableName: {
        value: null,
        children: {
            __groupId: {
                value: null,
                children: {
                    __columnName: {
                        value: null,
                        children: {
                            data: {
                                value: {
                                    key: '__body',
                                },
                                children: null,
                            },
                            dataType: {
                                value: {
                                    key: '__dataType',
                                },
                                children: null,
                            },
                        },
                    },
                },
            },
        },
    },
};

module.exports = { LINKED_FIELD_DATA_SET_SCHEMA };
