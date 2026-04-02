
const ActionsKeys = {
    TABLE_NAME: {
        Auto:'__tableName',
        Manual:'tableName',
    },
    GROUP_ID:{
        Auto:'__groupId',
        Manual:'groupId',
    },
    COLUMN_NAME:{
        Auto:'__columnName',
        Manual:'columnName',
    },
    // TABLE_NAME:{
    //     Auto:'',
    //     Manual:'',
    // },
}

/**
 * @type {Object}
 * @example
 * final sructure example:
 * {
 *   files: {
 *     'abc123...': {
 *       originalFileName: { data: 'photo.jpg', type: 'string' },
 *       mime: { data: 'image/jpeg', type: 'string' },
 *       body: { data: Buffer, type: 'binary' },
 *       linkId: { data: 'abc123...', type: 'string' }
 *     }
 *   }
 * }
 */
const FILE_DATA_SET_SCHEMA = {

    __tableName: [
        'branch', {
            __groupId: [
                'branch', {
                    originalFileName: [
                        'leaf', {
                            data: '__filename',
                            dataType:'string',
                        }, 
                    ],
                    mime: [
                        'leaf', {
                            data: '__contentType',
                            dataType:'string',
                        }, 
                    ],
                    file: [
                        'leaf', {
                            data: '__body',
                            dataType:'buffer',
                        }, 
                    ],
                    linkId: [
                        'leaf', {
                            data: '__linkId',
                            dataType:'string',
                        }, 
                    ],
                }
            ]
        }
    ]
};

/**
 * @type {}
 */
const LINKED_FIELD_DATA_SET_SCHEMA = {
    __tableName: [
        'branch', {
            __groupId: [
                'branch', {
                    __columnName: [
                        'leaf', {
                            data: '__body',
                            dataType:'link',
                        }
                    ]
                }
            ]
        }
    ]
}

const REGULAR_FIELD_DATA_SET = {
    __tableName: [
        'branch', {
            __groupId: [
                'branch', {
                    __columnName: [
                        'leaf', {
                            data: '__body',
                            dataType:'__dataType',
                        }
                    ]
                }
            ]
        }
    ]
}

module.exports = { FILE_DATA_SET_SCHEMA: FILE_DATA_SET_SCHEMA, REGULAR_FIELD_DATA_SET, LINKED_FIELD_DATA_SET_SCHEMA }