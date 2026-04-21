const {
    PostMapper,
} = require('../../../utils/data-mapper/post-mapper/post-mapper.model');

// const {
//     DataAction,
//     DataActionFactory,
//     FileActionFactory,
//     LinkActionFactory,
// } = require('../../../utils/data-mapper/post-mapper/post-mapper.controller');

const {
    StateContainerFactory: StateRollBackContainerFactory,
} = require('../../../utils/data-mapper/post-mapper/transactions/transaction.controller');

const { dataBase } = require('../../database/controller/db.controller');

/**
 * Middleware для финальной обработки: сохранение файлов и запись в БД
 * @param {Object} deps - dependency injection container
 * @param {PostMapper} deps.postMapper - postmapper
 * @returns {(payload:Object,next:(payload:Object) => Promise<any>) => Promise<any>} middleware
 */
module.exports = function onDataEndMiddleware(deps = {}) {
    if (!deps.postMapper) {
        throw new Error(`deps.postMapper required`);
    }

    /**
     *
     * @param {Object} payload
     * @param {(payload:Object,next:(payload:Object) => Promise<any>) => Promise<any>} next
     * @returns
     */
    const fn = async (payload, next) => {
        await deps.postMapper.processDataSet(payload);

        const result = deps.postMapper.getGlobalContainersPullStates();

        const clientResponsePull = {
            success: [],
            error: [],
        };

        for (const [addr, { rowId, tableName }] of Object.entries(result)) {
            if (tableName === 'files') continue;

            const DataBaseResponse = dataBase.readOne(tableName, rowId);

            if (DataBaseResponse.success) {
                const row = {};

                for (const [
                    prop,
                    value,
                ] of DataBaseResponse.success.rowById.entries()) {
                    row[prop] = value;
                }

                clientResponsePull.success.push({ tableName, row });

                continue;
            }

            if (DataBaseResponse.error) {
                const row = {};

                for (const [
                    prop,
                    value,
                ] of DataBaseResponse.error.rowById.entries()) {
                    row[prop] = value;
                }

                clientResponsePull.error.push(row);

                continue;
            }
        }

        return await next(clientResponsePull);
    };

    return fn;
};
