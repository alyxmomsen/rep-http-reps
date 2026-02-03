
const {} = require('fs');
const fsadapter = require('./fs-adapter/fs-adapter');
const { join, extname, resolve } = require('path');
const { randomBytes } = require('crypto');

class Registry {

    async addItem (payload) {

        console.log('add item', {payload});

        const {
            semantic ,
            semanticName ,
            contentType ,
            body ,
            title ,
            description ,
            filename ,
        } = payload ;

        const ext = extname(filename);

        if(!ext) {
            console.log('no ext name'.toUpperCase());
            return {newItem,  status:1} ;
        }

        const newFileName = (title ? (title.toString('utf-8') + ext) : filename) || randomBytes(32).toString('hex') ;

        const newItem = {
            // ...payload ,
            semantic ,
            contentType ,
            title:(title && title.length) ? title : null ,
            filename:newFileName   ,
            description:(description && description.length) ? description : null ,
            originalFileName:filename ,
        }

        const newFilePath = resolve(join(this.#uploadDir , newItem.filename));
        
        const ifThisFileExist = await fsadapter.checkIfFileExist(newFilePath);

        if(ifThisFileExist) {
            console.log(`this file ${newFilePath} already exist !!`.toUpperCase() , {ifThisFileExist});
            return {newItem,  status:2} ;
        }

        const uploadresult = await fsadapter.upload(newFilePath , body);

        if(uploadresult) {

            console.log(`this file ${newFilePath} is not uploaded becose: ` , {uploadresult});
            return {newItem,  status:3} ;
        }

        console.log(`file uploaded!!`);

        newItem.uploadDir = this.#uploadDir ; // add another one property in new-item bundle

        this.#items.set(randomBytes(32).toString("hex") , newItem);

        console.log(`new item saved` , {newItem});

        return {newItem,  status:0} ;

    }

    #items;
    #fsadapter;
    #uploadDir;

    constructor (fsadapter , uploadDir) {
        this.#items = new Map();
        this.#fsadapter = fsadapter ;
        this.#uploadDir = uploadDir ;
    }
}

const registry = new Registry(fsadapter , join('.' , 'uploads'));

module.exports = registry ;