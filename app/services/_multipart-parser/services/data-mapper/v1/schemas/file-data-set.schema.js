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
    __tableName: {
        value: null,
        children: {
            __groupId: {
                value: null,
                children: {
                    originalFileName: {
                        value: {
                            key: '__originalFileName',
                        },
                        children: null,
                    },
                    mime: {
                        value: {
                            key: '__mime',
                        },
                        children: null,
                    },
                    file: {
                        value: {
                            key: '__body',
                        },
                        children: null,
                    },
                    linkId: {
                        value: {
                            key: '__linkId',
                        },
                    },
                },
            },
        },
    },
};

module.exports = { FILE_DATA_SET_SCHEMA };
