const { randomBytes } = require('crypto');
const { PreMapper, PreMapperSchemas } = require('./premapper.model');
require('https');
/**
 * @typedef {Object} PreMapperDataSet
 * @property {string|null} filename
 * @property {string|null} contentType
 * @property {string} columnName
 * @property {string} tableId
 * @property {string} groupId
 * @property {Buffer} body
 *
 */

class PremapperController {
    /**
     *
     * @description
     * определяет , если дата сет содержит файлову
     * в случае если это файл, то
     * формирует два дата-сет из одного исходного дата-сет
     *
     * @param {PreMapperDataSet} dataSet
     */
    process(dataSet, context) {
        if (dataSet.filename || dataSet.contentType) {
            if (dataSet.filename && !dataSet.contentType) {
                throw new Error(
                    `PremapperController::process dataSet.contentType required too`
                );
            }

            if (!dataSet.filename && dataSet.contentType) {
                throw new Error(
                    `PremapperController::process dataSet.filename required too`
                );
            }

            const fileGroupId = randomBytes(32).toString('hex');

            const FileDataSet = {
                ...dataSet,
                tableId: 'files-table-id',
                groupId: fileGroupId,
            };

            const LinkedDataSet = {
                ...dataSet,
                body: {
                    groupId: fileGroupId,
                    tableId: 'files-table-id',
                },
            };

            // throw new Error();

            const processedContext = this.#premapper.process(
                this.#Schemas.File,
                FileDataSet,
                context
            );

            return this.#premapper.process(
                this.#Schemas.Linked,
                LinkedDataSet,
                processedContext
            );
        }

        return this.#premapper.process(this.#Schemas.Regular, dataSet, context);
    }

    /**
     * @type {PreMapper}
     */
    #premapper;

    /**
     * @type {{File:Object;Linked:Object;Regular:Object}}
     */
    #Schemas;

    /**
     *
     * @param {Object} payload
     * @param {PreMapper} payload.PreMapper
     * @param {{File:Object;Linked:Object;Regular:Object}} payload.PreMapperSchemas
     */
    constructor(deps = {}) {
        if (!deps.PreMapper) {
            throw new Error(
                `PremapperController::constructor: deps.PreMapper required`
            );
        }

        if (!deps.PreMapperSchemas) {
            throw new Error(
                `PremapperController::constructor: deps.PreMapperSchemas required`
            );
        }

        this.#premapper = deps.PreMapper;
        this.#Schemas = deps.PreMapperSchemas;
    }
}

/**
 *
 * @param {Object} payload
 * @param {() => PreMapper} payload.PremapperFactory
 * @param {{File:Object;Linked:Object;Regular:Object}} payload.PreMapperSchemas
 * @returns {PremapperController}
 */
function PremapperControllerFactory(deps = {}) {
    if (!deps.PremapperFactory) {
        throw new Error(
            `PremapperControllerFactory: deps.PremapperFactory required`
        );
    }

    if (!deps.PreMapperSchemas) {
        throw new Error(
            `PremapperControllerFactory: deps.PreMapperSchemas required`
        );
    }

    const fn = function () {
        return new PremapperController({
            PreMapper: deps.PremapperFactory(),
            PreMapperSchemas: deps.PreMapperSchemas,
        });
    };

    return fn;
}

function PremapperFactory() {
    const fn = function () {
        return new PreMapper();
    };

    return fn;
}

module.exports = {
    PremapperControllerFactory,
    PremapperFactory,
    PremapperController,
};
