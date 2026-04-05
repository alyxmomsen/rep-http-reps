const {
    dataSetProcessorFactory,
} = require('../../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller');
const {
    BranchActionFactory,
} = require('../../../../app/services/_multipart-parser/utils/mapper/model/actions/branch-action/model/branch-action.model');
const {
    dbControllersRouter,
} = require('../../../../app/services/database-adapter/controller/db-adapter.controller');
const {
    DBAdapter,
} = require('../../../../app/services/database-adapter/models/db-adapter.model');
const {
    filemanager,
} = require('../../../../app/services/filemanager.service.js/fmanager.controller');

const {
    Transactions,
    Transaction,
} = require('../../../../app/services/transactor/transactions.model');

describe('branch action', () => {
    /**
     *
     */
    let branchAction;
    /**
     * @type {Transactions}
     */
    let mockTransactions;
    /**
     * @type {Transaction}
     */
    let transaction;

    beforeEach(() => {
        transaction = {
            processField: jest.fn().mockReturnValue(),
            processFile: jest.fn().mockReturnValue(),
            showResolved: jest.fn().mockReturnValue(),
        };

        mockTransactions = {
            getTransaction: jest.fn().mockReturnValue(transaction),
        };

        mockTransactions = new Transactions({
            dataBaseControllersRouter: new Map([
                ['files', () => {}],
                ['users', () => {}],
                ['video-playlist', () => {}],
            ]),
            fileManager: {
                read: jest.fn(),
                write: jest.fn(),
            },
        });

        const mockaddSuccessResolver = jest.fn();
        const mockaddErrorResolver = jest.fn();
        const mockonBadResponse = jest.fn();
        branchAction = BranchActionFactory({
            resolveSuccesError: {
                addSuccessResolver: mockaddSuccessResolver,
                addErrorResolver: mockaddErrorResolver,
                onBadResponse: mockonBadResponse,
            },
            dbControllersRouter: new Map(),
            filemanager: {},
            linksBufferInstance: {},
            transactions: mockTransactions,
        });
    });

    const dataSetProcessor = dataSetProcessorFactory({
        linksBuffer: {},
        transactions: new Transactions({
            dataBaseControllersRouter: dbControllersRouter,
            fileManager: filemanager,
        }),
    });

    const struct = {
        users: [
            'branch',
            {
                meta: {
                    title: 'tableName',
                },
                value: {
                    '01': [
                        'branch',
                        {
                            meta: {
                                title: 'groupId',
                            },
                            value: {
                                title: [
                                    'leaf',
                                    {
                                        meta: {
                                            title: 'columnName',
                                        },
                                        value: {
                                            data: 'my-fa-king-title',
                                            dataType: 'string',
                                        },
                                    },
                                ],
                                avatar: [
                                    'leaf',
                                    {
                                        meta: {
                                            title: 'columnName',
                                        },
                                        value: {
                                            data: '123-123-123-123',
                                            dataType: 'link',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
        files: [
            'branch',
            {
                meta: {
                    title: 'tableName',
                },
                value: {
                    '1982379108237192319283912837': [
                        'branch',
                        {
                            meta: {
                                title: 'groupId',
                            },
                            value: {
                                originalFileName: [
                                    'leaf',
                                    {
                                        meta: {
                                            title: 'columnName',
                                        },
                                        value: {
                                            data: 'originalFileName.jpeg',
                                            dataType: 'string',
                                        },
                                    },
                                ],
                                file: [
                                    'leaf',
                                    {
                                        meta: {
                                            title: 'columnName',
                                        },
                                        value: {
                                            data: Buffer.from('hello world'),
                                            dataType: 'string',
                                        },
                                    },
                                ],
                                mime: [
                                    'leaf',
                                    {
                                        meta: {
                                            title: 'columnName',
                                        },
                                        value: {
                                            data: 'mime/mime',
                                            dataType: 'string',
                                        },
                                    },
                                ],
                                linkId: [
                                    'leaf',
                                    {
                                        meta: {
                                            title: 'columnName',
                                        },
                                        value: {
                                            data: '123-123-123-123',
                                            dataType: 'string',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    };

    test('13', () => {
        branchAction({
            actionCaller: dataSetProcessor.process.bind(dataSetProcessor),
            payloadToCaller: struct,
            trace: [],
        });

        expect(1).toEqual(1);
    });
});
