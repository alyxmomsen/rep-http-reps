const { randomBytes } = require('pg/lib/crypto/utils-legacy');
const {
    TransactionFactory,
} = require('../../../../../../../../../__dev-artefacts__/transactor/transactions.controller');
const {
    Transactions,
} = require('../../../../../../../../../__dev-artefacts__/transactor/transactions.model');
const {
    ResolveSuccessError,
} = require('../../../../../../../../utils/success-error-resolver/model/suc-err-res');
const {
    DBAdapter,
} = require('../../../../../../../database-adapter/models/db-adapter.model');
const {
    FileManager,
} = require('../../../../../../../filemanager.service.js/filemanager.service');
const {
    LinksBuffer,
} = require('../../../../../data-links-buffer/data-links-buffer.util');

/**
 * 

 * @param {Object} deps - dependeci injection container
 * @param {ResolveSuccessError} deps.resolveSuccesError - about
 * @param {FileManager} deps.filemanager - about
 * @param {Map<string,DBAdapter>} deps.dbControllersRouter - about
 * @param {LinksBuffer} deps.linksBufferInstance - about
 * @param {Transactions} deps.transactions - about
 * @returns 
*/
function BranchActionFactory(deps = {}) {
    const resolveSuccessError = deps.resolveSuccesError || null;
    const filemanager = deps.filemanager || null;
    const dbControllersRouter = deps.dbControllersRouter || null;
    const linksBufferInstance = deps.linksBufferInstance || null;

    // test

    const transactions = deps.transactions || null;

    if (!transactions || transactions instanceof Transactions === false) {
        throw new Error(`BranchActionFactory: transactions required`);
    }

    // ----

    if (!dbControllersRouter) {
    }

    if (!linksBufferInstance) {
        throw new Error(`BranchActionFactory: LinksBuffer instance required`);
    }

    if (!resolveSuccessError || !filemanager) {
        throw new Error(
            `BranchActionFactory: ResolveSuccessError & filemanager are required`
        );
    }

    resolveSuccessError.addSuccessResolver(async (success, next) => {
        const { filename } = success;

        return await next(success);
    });

    resolveSuccessError.addSuccessResolver(async (payload, next) => {
        // return await next(success);
        return payload;
    });

    /**
     *
     * @description
     * regFn: this action`s caller (Mapper)
     * callstack - содержит трассировку вызова рекурсивного коллера
     *
     * @param {{
     *  reqFn:(data:Object, parentCallStack:Object[], actions:Object) => Promise<any>;
     *  actionPayload:Object;
     *  callStack:{propDescriptionPath:string[];propKeyPath:string[]};
     *  actions:Object.<string,Function>;
     * }} payload
     * @returns
     * @throws {Error} - branch action: incorrect payload data
     */
    const fn = async (payload = {}) => {
        // console.log(`\x1b[33maction/AAction: `, { payload }, `\x1b[0m`);

        /**
         * консистентный ответ
         */
        const { reqFn, actionPayload, callStack } = payload;

        if (!reqFn || !actionPayload || !callStack) {
            console.log(`\x1b[33m`, payload, `\x1b[0m`);
            throw new Error(`branch action: incorrect payload data`);
        }

        // рекурсивно заходим дальше по ветке в сторону листьев
        // собираем данные
        /**
         * @type {Object}
         */
        const branchResult = await reqFn(actionPayload, callStack);

        /**
         * каждый Action (Branch action и Leaf action)
         * содержат объект
         *
         * {
         *  tree:BranchResul.tree,
         *  supply:Object
         * }
         *
         * supply и tree - это "рабочие" названия свойств (на скорую руку, - что бы не отвлекаться от разработки)
         *
         */
        const currentContextBranch = {
            tree: branchResult.tree,
            supply: { ...(branchResult.supply || {}) },
        };

        /**
         * аварийный выброс ошибки, на момент разработки
         */
        if (!branchResult) {
            throw new Error(
                `branch action: reqursive function returned falsy value`
            );
        }

        /**
         * @description
         *
         * содержит описательные сегменты:
         *
         * например , если структура объекта возвращенная первым Mapper
         * такая:
         *
         * 'video-playlist': [
         *      'branch',
         *      {
         *      meta: { title: 'tableName' },
         *      value: {
         *          '04': [ 'branch', { meta: [Object], value: [Object] } ],
         *          '05': [ 'branch', { meta: [Object], value: [Object] } ]
         *      }
         *      }
         *  ],
         *
         * то propDescriptionPath будет примерно такой: ['tableName', 'groupId']
         *
         * соответственно, propKeyPath ожидается такой: ['video-playlist','04']
         *
         * @type {string[]}
         */
        const propDescriptionPath = [];
        /**
         * @type {string[]}
         */
        const propKeyPath = [];
        callStack.forEach((elem) => {
            const { propDescription, propKey } = elem;
            propDescriptionPath.push(propDescription);
            propKeyPath.push(propKey);
        });

        /**
         * handle route "tableName/groupId"
         *
         * здесь роутинг по результирующим путям, что и так очевидно.
         * скоро это будет полноценный роутер
         *
         *
         */
        if (propDescriptionPath.join('/') === 'tableName/groupId') {
            /**
             * это опять хардкод, что бы набросать структуру
             *
             * преполагается то что в корне пути всегда tableName, далее groupId, columnName и тд
             *
             */
            const tableName = propKeyPath[0];
            // const groupId = propKeyPath[1];
            const groupId = randomBytes(32).toString('hex');

            /**
             *
             * когда мы находимся на 'tableName/groupId'
             * предполагается то что рекурсивная функция reqFn(...)
             * уже выполнила обход "листьев" и мы располагаем данными
             *
             * получив tableName `const tableName = propKeyPath[0]`
             * мы можем роутиться
             *
             *
             */

            switch (tableName) {
                case 'files':
                    /**
                     * предполагается что данные о файле являются консистентными
                     * так же как и branchResult.tree и branchResult.supply
                     * , то я просто беру их зная что где должно быть
                     */
                    /** */
                    const originalFileName = branchResult.tree.originalFileName;
                    const mime = branchResult.tree.mime;
                    const file = branchResult.tree.file;
                    const linkId = branchResult.tree.linkId;

                    /**
                     * проверка на момент тестирования, но возможно останется
                     */
                    if (!originalFileName || !mime || !file || !linkId) {
                        throw new Error(
                            `Branch action: reqursive caller must be return consistent data`
                        );
                    }

                    const transaction = transactions.getTransaction(
                        linkId.data
                    );
                    await transaction.processFile({
                        originalFileName,
                        mime,
                        file,
                        linkId,
                    });

                    break;

                    /**
                     * пока что, "на коленке",
                     * я здесь просто сохраняю результат в массив
                     * что бы было что выводить данные на клиенте
                     * но, на самом деле нужно данные сначала линковать
                     * запись о файле с записью о элементе плейлиста
                     *
                     * что касается нижеследующего кода
                     * `currentContextBranch.supply?.addedData`
                     * вообще я хотел сделать так что бы "supply" содержал разного рода информацию результатов
                     * проделанной работы рекурсивного обхода, но быстро это сделать не получилось и я захардкодил
                     * так как получился слишком большой контекст для одновременной разработки.
                     */
                    if (!currentContextBranch.supply?.addedData) {
                        currentContextBranch.supply.addedData = [
                            {
                                id: dbresponse.success.newRowIdHash,
                                tableName: 'files',
                                rowData: dbresponse.success.row,
                            },
                        ];
                    } else {
                        currentContextBranch.supply.addedData.push({
                            id: dbresponse.success.newRowIdHash,
                            tableName: 'files',
                            rowData: dbresponse.success.row,
                        });
                    }

                    break;
                case 'video-playlist': {
                    break;

                    const dbDataSet = {};

                    for (const [propKey, propValue] of Object.entries(
                        branchResult.tree
                    )) {
                        /**
                         * случай, если свойство будет содержать ссылку на другую запись в таблице.
                         */
                        if (propValue.dataType === 'link') {
                            /**
                             * ищем в буффере данные для ссылки
                             */
                            /** */
                            const result = linksBufferInstance.getLinkDataById(
                                propValue.data
                            );

                            /**
                             * пока отлаживаю, выбрасываю исключение, если данные не нашлись
                             * это может быть потому что данные обычных полей обрабатываются раньше чем
                             * данные файла.
                             *
                             * нужно обработать этот кейс! например создать observer.
                             * если файл будет обработан позже , то он должен будет инициировать довыполнение
                             * "замороженого" процесса
                             */
                            if (!result) {
                                console.log(
                                    `\x1b[31mlinks buffer: no data by id ${propValue.data}\x1b[0m`
                                );
                                throw new Error(
                                    `links buffer: no data by id ${propValue.data}`
                                );
                            }

                            /**
                             * заполняем datset для базы данных
                             *
                             * в базе данных (я пока что не думал как сделать лучше)
                             * ссылки на другие данные выглядят именно так , как выражено
                             * в нижеследующей процедуре
                             */

                            dbDataSet[propKey] = {
                                rowId: result.rowId,
                                tableName: result.tableName,
                            };

                            /**
                             * переходим к следующему property
                             */

                            continue;
                        }

                        /**
                         *
                         * кейс , если проперти не ссылка.
                         *
                         * что касается проверки "propValue.data instanceof Buffer"
                         * в базе данных я не планирую сохранять Buffer
                         * (я просто не размышлял над этим)
                         * скорее всего все значения я буду сохранять ввиде строк, но в метаданных указывать тип данных
                         *
                         * но, я не планирую разрабатывать базы даннх , и перейду на postgres или mongo, так что то как это выглядит сейчас
                         * это временно
                         */

                        dbDataSet[propKey] =
                            propValue.data instanceof Buffer
                                ? propValue.data.toString('utf-8')
                                : propValue.data;
                    }

                    const usersDBAdapter =
                        dbControllersRouter.get('video-playlist');

                    usersDBAdapter.createOne(dbDataSet);

                    console.log(
                        '\x1b[31m',
                        `tableName: users`,
                        branchResult,
                        '\x1b[0m'
                    );
                    break;
                }

                case 'users': {
                    const dataType = branchResult.tree.dataType;

                    console.log(
                        'branch action: users data: ',
                        branchResult.tree
                    );

                    /**
                     * объект куда собираются все поля
                     */
                    const dbDataSet = {
                        groupId: groupId,
                        columns: {},
                    };

                    for (const [columnName, columnValue] of Object.entries(
                        branchResult.tree
                    )) {
                        if (columnValue.dataType === 'link') {
                            const transaction = transactions.getTransaction(
                                columnValue.data
                            );

                            transaction.processField({ columnName, groupId });

                            columnsGroupTaggetWithID.columns[columnName] =
                                columnValue;
                        }

                        columnsGroupTaggetWithID.columns[columnName] =
                            columnValue;

                        dbDataSet[propKey] =
                            propValue.data instanceof Buffer
                                ? propValue.data.toString('utf-8')
                                : propValue.data;
                    }

                    break;

                    console.log({ dbDataSet });

                    const usersDBAdapter = dbControllersRouter.get('users');

                    usersDBAdapter.createOne(dbDataSet);

                    console.log(
                        '\x1b[31m',
                        `tableName: users`,
                        branchResult,
                        '\x1b[0m'
                    );
                    break;
                }
            }
        }

        console.log({ currentContextBranch });
        // return branchResult;
        return currentContextBranch;
    };

    return fn;
}

module.exports = { BranchActionFactory: BranchActionFactory };
