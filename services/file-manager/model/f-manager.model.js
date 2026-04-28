const { randomBytes } = require('node:crypto');
const {
    statSync,
    createWriteStream,
    createReadStream,
    ReadStream,
    Stats,
} = require('node:fs');
const { stat } = require('node:fs/promises');
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
     *
     * @param {string} filename
     * @returns {{
     *  stream: ReadStream,
     *  fileSize: number,
     * }}
     */
    async getStream(filename) {
        const filePath = join(this.#rootDir, filename);

        const stats = await stat(filePath);

        const fileSize = stats.size;

        return new Promise((resolve, reject) => {
            const rs = createReadStream(filePath);

            resolve({
                stream: rs,
                fileSize: fileSize,
            });
        });
    }

    async getFileStats(filename) {
        const fileFullPath = join(this.#rootDir, filename);

        try {
            const stats = await stat(fileFullPath);
            const FileData = {
                filePath: fileFullPath,
            };

            return {
                success: {
                    stats,
                    fullpath: FileData.filePath,
                },
                failure: undefined,
            };
        } catch (err) {
            return {
                failure: {
                    details: err,
                },
                success: undefined,
            };
        }
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
