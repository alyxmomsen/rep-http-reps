const { MiddlewareExecutor } = require('../model/mw-executor.model');

/**
 *
 * @param {Object} options
 * @param {{}} options.option
 * @returns {() => MiddlewareExecutor}
 */
function MiddlewareExecutorDIContainer(options = {}) {
    if (!options.option) {
        throw new Error(`deps.dependency required`);
    }

    const fn = function () {
        return new MiddlewareExecutor({});
    };

    return fn;
}

module.exports = { MiddlewareExecutorDIContainer };
