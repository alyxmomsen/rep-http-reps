const { randomBytes } = require("node:crypto");
const { createWriteStream, createReadStream } = require("node:fs");
const { resolve, join } = require("node:path");
const { Readable } = require("node:stream");

class FileManager {

	/**
	 * 
	 * @param {Buffer<ArrayBuffer>} dataBuffer 
	 * @returns {Promise<{error?:Object}|{success?:{filename:string}}>}
	 */
	async write (dataBuffer) {
		return await (new Promise((res, rej) => {
			try {
				const randomname = randomBytes(32).toString('hex');
				const destinationFilename = join(this.#uploadsRootDir, randomname);
				const readStream = Readable.from(dataBuffer);
				const writeStream = createWriteStream(destinationFilename);
				readStream.pipe(writeStream);
				readStream.on("end", () => {
					res({success:{
						filename:randomname ,
					}});
				});
				readStream.on("error", (err) => {
					rej({error:err});
				});
			} catch (e) {
				console.log({e});
				rej({error:e})
			}
		}));
	}
	
	async read (filename) {
		try {
			const filePath = join(this.#uploadsRootDir, filename);
			const readStream = createReadStream(filePath);

			readStream.on("ready", () => {
				console.log('ready');
			});

			readStream.on("readable", () => {
				console.log('readable');
			});

			return {
				success:{
					readStream:readStream ,
				}
			} ;
		}
		catch (err) {
			console.log({err});
			return {
				error:err,
			}
		}
	}

	#uploadsRootDir;

    constructor () {
        this.#uploadsRootDir = resolve('./uploads');
    }
}

const fileManager = new FileManager();

module.exports = { fileManager }