const { randomBytes } = require('node:crypto');
const { statSync, createWriteStream } = require('node:fs');
const { join } = require('node:path');
const { Readable } = require('node:stream');

class FileManager {
    /**
     *
     * @param {Buffer<ArrayBuffer>} data
     */
    async save(data) {
        return await new Promise((resolve, reject) => {
            const randomFileName = randomBytes(32).toString('hex');

            try {
                const rs = Readable.from(data);
                const ws = createWriteStream(
                    join(this.#rootDir, randomFileName)
                );

                rs.on('end', () => {
                    resolve({
                        success: {
                            filename: randomFileName,
                        },
                    });
                });

                rs.pipe(ws);
            } catch (err) {
                console.log({ err });

                reject({
                    failure: {
                        message: err,
                    },
                });
            }
        });
    }

    /**
     * @type {string}
     */
    #rootDir;

    /**
     * @param {Object} config
     * @param {string} config.rootDir
     */
    constructor(config = {}) {
        if (!config.rootDir) {
            throw new Error(
                `FileManager::constructor: config.rootDir required`
            );
        }

        this.#rootDir = config.rootDir;
    }
}

module.exports = { FileManager };
