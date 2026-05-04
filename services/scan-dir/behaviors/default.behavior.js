const { statSync } = require("fs");
const { ScanBehavior } = require("../scan-dir.model");
const { readdir, stat } = require("fs/promises");
const { join } = require("path");

class DefaulScan extends ScanBehavior {
    async execute() {
        try {
            const files = await readdir(this.#path);
            for (const file of files) {
                const Actions = {
                    file: () => {
                        console.log("file");
                    },
                    dir: () => {
                        console.log("directory");
                    },
                };

                const stats = await stat(join(this.#path, file));

                if (stats.isDirectory()) {
                    const executor =
                        Actions["file"] ||
                        (() => {
                            console.log("no file action");
                        });

                    executor();
                } else if (stats.isFile()) {
                    const executor =
                        Actions["dir"] ||
                        (() => {
                            console.log("no dir action");
                        });

                    executor();
                }
            }
        } catch (err) {
            console.log({ err });
        }
    }
    /**
     * @type {string}
     */
    #path;

    /**
     * @type {() => any}
     */
    #fileAction;
    /**
     * @type {() => any}
     */
    #dirAction;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.path
     */
    constructor(deps = {}) {
        super();
        if (!deps.path) {
            throw new Error(`deps.path required`);
        }

        statSync(deps.path);

        this.#path = deps.path;
    }
}

module.exports = { DefaulScan };
