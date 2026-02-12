const { error } = require("node:console");
const { randomBytes } = require("node:crypto");

class DataBase {
    
    add(tableName ,payload) {

        const {} = payload ;
        // console.log({payload});

        return {
            success:{
                code:0 ,
                payload:{
                    tableName:tableName ,
                    fileId:randomBytes(32).toString('hex')
                }
            } , 
            error:null ,
        }
    }

    #files;

    constructor () {
        this.#files = new Map();
    }
}

const database = new DataBase ;

module.exports = database ;