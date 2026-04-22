/**
 *
 * @param {Object} deps
 * @returns {(template:string,handlers:import("../router.model").RouteMiddleware[]) => import("../router.model").RouteBundle}
 */
function CompileRouteBundle(deps = {}) {
    /**
     *
     * @param {string} template
     * @param {import("../router.model").RouteMiddleware[]} handlers
     * @returns {import("../router.model").RouteBundle}
     */
    const fn = function (template, handlers) {
        if (handlers.length < 1) {
            throw new Error(
                `Router::compileRouteBundle handlers.length must be >= 1`
            );
        }

        const Args = {
            template: template,
            handlers: handlers,
        };

        const LocalBuffer = {
            RegExpTemaplate: '',
            BundleKeys: [],
            Middleware: [],
        };

        const Bundle = {
            keys: [],
        };

        LocalBuffer.RegExpTemaplate = Args.template.replace(/[+?.$^]/, '///$&');

        LocalBuffer.RegExpTemaplate = LocalBuffer.RegExpTemaplate.replace(
            /\*/,
            '.*'
        );

        LocalBuffer.RegExpTemaplate = LocalBuffer.RegExpTemaplate.replace(
            /:([^\/]+)/,
            (_, key) => {
                LocalBuffer.BundleKeys.push(key);

                return '([^\/]+)';
            }
        );

        return {
            keys: LocalBuffer.BundleKeys,
            regex: new RegExp(`^${LocalBuffer.RegExpTemaplate}$`),
            middleware:
                Args.handlers.length > 1 ? Args.handlers.slice(0, -1) : [],
            finalHandler: Args.handlers[Args.handlers.length - 1],
            originalTemplate: Args.template,
        };
    };

    return fn;
}

module.exports = { CompileRouteBundle };
