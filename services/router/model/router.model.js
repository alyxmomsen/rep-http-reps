/**
 * @typedef {Object} Foo
 * @property {string} bar
 */

/**
 *
 */
class Router {
    handleRequest(req, res) {}

    get(template, ...handlers) {
        this.#addRoute();
    }

    #addRoute() {}

    /**
     *
     * @param {string} template
     * @param {Function[]} handlers
     */
    #compileRouteBundle(template, handlers) {
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
            regex: LocalBuffer.RegExpTemaplate,
            middleware:
                Args.handlers.length > 1 ? Args.handlers.slice(0, -1) : [],
            finalHandler: Args.handlers[Args.handlers.length - 1],
            originalTemplate: Args.template,
        };
    }

    /**
     *
     */
    #routes;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.compileRouteBundle
     */
    constructor(deps) {
        this.#routes = new Map();
    }
}

module.exports = { Router };

const router = new Router();

router.get('/foo/bar', async (ctx) => {
    const ArgsContext = {
        HttpRequest: ctx.req,
        HttpResponse: ctx.res,
        Next: ctx.next,
    };

    const Params = {};

    ArgsContext.HttpRequest.params;

    router.get('/hello/world', (ctx) => {
        console.log('hello world');
    });
});
