/**
 * Compiles a route template into a RouteBundle with regex and keys.
 * 
 * @param {Object} deps - Dependencies (unused, kept for consistency)
 * @returns {(template: string, handlers: import("../router.model").RouteMiddleware[]) => import("../router.model").RouteBundle}
 */
function CompileRouteBundle(deps = {}) {
    /**
     * @param {string} template - Route template like "/users/:id/posts/:postId"
     * @param {import("../router.model").RouteMiddleware[]} handlers - Middleware chain + final handler
     * @returns {import("../router.model").RouteBundle}
     */
    const fn = function (template, handlers) {
        if (handlers.length < 1) {
            throw new Error(
                `Router::compileRouteBundle: handlers.length must be >= 1`
            );
        }

        const keys = [];

        // Step 1: Escape all regex special characters EXCEPT : and *
        let regexStr = template.replace(/[.+^${}()|[\]\\]/g, '\\$&');

        // Step 2: Replace wildcard * with .*
        regexStr = regexStr.replace(/\*/g, '.*');

        // Step 3: Replace :param with named capture groups
        regexStr = regexStr.replace(/:([^/]+)/g, (_, key) => {
            keys.push(key);
            return '([^/]+)';
        });

        return {
            keys: keys,
            regex: new RegExp(`^${regexStr}$`),
            middleware: handlers.length > 1 ? handlers.slice(0, -1) : [],
            finalHandler: handlers[handlers.length - 1],
            originalTemplate: template,
        };
    };

    return fn;
}

module.exports = { CompileRouteBundle };