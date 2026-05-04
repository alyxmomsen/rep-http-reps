require("https");
const { readFile } = require("fs/promises");
const { HTTPRouter } = require("../model/router.model");

const router = new HTTPRouter();

const Factories = {
    Middleware: {
        demo: DemoMiddlewareFactory,
    },
    FilnalHandlers: {
        default: DefaultHandler,
        multitableForm: FormHandlerFactory,
        getMultitableForm: GetMultitableForm,
    },
};

let index = 0;

router.get(
    "/foo/:bar",
    ...Array(10)
        .fill(1)
        .map((elem) =>
            Factories.Middleware.demo({
                mwIndex: ++index,
            }),
        ),
    Factories.FilnalHandlers.default({}),
);

router.get("/demo-multitable", Factories.FilnalHandlers.getMultitableForm({ path: "assets/multitable-form.html" }));

router.post("/handle-multitable-form", Factories.FilnalHandlers.multitableForm());

module.exports = { router };

/**
 *
 * @param {Object} deps
 * @returns
 */
function DefaultHandler(deps = {}) {
    /**
     *
     * @type {import("../model/router.model").Middleware}
     */
    const fn = async function (ctx) {
        const { req, res, params, query, next } = ctx;

        res.writeHead(200, {
            "content-type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "foo bar baz",
            }),
        );
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {string} deps.mwIndex
 * @returns
 */
function DemoMiddlewareFactory(deps = {}) {
    if (deps.mwIndex === undefined) {
        throw new Error(`deps.mwIndex must be not undefined`);
    }

    /**
     * @type {import("../model/router.model").Middleware}
     */
    const fn = function (ctx) {
        const { next, params, query } = ctx;

        console.log(`middleware ${deps.mwIndex} called`, { query, params });

        next();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @returns
 */
function FormHandlerFactory(deps = {}) {
    /**
     *
     * @type {import("../model/router.model").Middleware}
     */
    const fn = async function (ctx) {
        const { req, res, params, query } = ctx;

        const parts = [];

        req.on("data", (chunk) => {
            console.log("chunk");
            parts.push(chunk);
        });

        req.on("end", () => {
            const wholeBuffer = Buffer.concat(parts);
        });

        res.writeHead(200, {
            "content-type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "done",
                data: {},
            }),
        );
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {Object} deps.path
 * @returns
 */
function GetMultitableForm(deps = {}) {
    if (!deps.path) {
        throw new Error(`deps.path required`);
    }

    /**
     * @type {import("../model/router.model").Middleware}
     */
    const fn = async function (ctx) {
        const { req, res, params, query } = ctx;

        try {
            const file = await readFile(deps.path, {
                encoding: "utf8",
            });

            res.writeHead(200, {
                "content-type": "text/html",
            });
            res.end(file);
            console.log({ file });
        } catch (err) {
            console.log("error");
        }

        res.end();
    };

    return fn;
}
