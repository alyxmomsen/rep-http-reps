const { DataMapper } = require('../model/data-mapper.v2.model');

/**
 *
 * @returns {DataMapper}
 */
const factory = () => {
    return new DataMapper();
};

module.exports = { dataMapperFactory: factory };
