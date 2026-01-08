const { randomBytes } = require('crypto');
const { readFile, stat, readdir } = require('fs/promises');
const { join } = require('path');

require('fs');
class _Registry {

    async update() {

        this.#items = [] ;
        await this.#parseDir(this.#rootDir);
        console.log('registry upated: ' , {items:this.#items});
    }

    async push (filename , dirPath) {

        this.#items.push({
            id:randomBytes(32).toString('hex') , 
            filename , 
            path:dirPath ,
        });

        console.log('registry pushed'.toUpperCase() , {items:this.#items});
    }

    async getItemById (id) {


        for (const item of this.#items) {

            console.log('compare items: ' , id , item.id);
    
            if(item.id === id) {
                return item ;
            }
        }
        
        return null ;
    }

    async getAllItems () {
        return this.#items ;
    }

    async #parseDir (path) {

        try {
            const filesLike = await readdir(path);

            for (const fileLike of filesLike) {

                const newFileLikeName = join(path , fileLike); 
                
                const stats = stat(newFileLikeName);

                if((await stats).isDirectory()) {

                    await this.#parseDir(newFileLikeName);
                    continue ;
                }

                const newItem = {
                    id:randomBytes(32).toString('hex'),
                    filename:fileLike ,
                    path ,
                }

                this.#items.push(newItem);

            }

        }
        catch (e) {
            console.log('registry update error: ' , e);
        }

    }

    #rootDir ;
    #items ;

    constructor (config) {

        const rootDir = config.rootDir ;

        if(rootDir === undefined) throw new Error('root dir required');

        this.#rootDir = rootDir ;
        this.#items = []; 
    }
}

module.exports = _Registry ;