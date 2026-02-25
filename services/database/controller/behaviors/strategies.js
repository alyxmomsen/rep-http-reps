const { extname:pathExtname, extname } = require("path");
const { loggerFactory } = require("../../../../utils/logger");
const { filemanager } = require("../../../file-manager/file-manager");
const { database, DB_CONSTANTS } = require("../../database");
const { errorFactory } = require("../db-controller");
const log = loggerFactory('validation strategies' , '-u') ;

const validationStrategies = new Map();

// const DB_TABLES_FIELDSNAMES = {
//     FILE:{
//         TITLE:'title' ,
//         DESCRIPTION:'description',
//         ORIGINAL_FILENAME:'originalFilename',
//         FILESYSTEM_FILENAME:'fileSystemFilename',
//         MIME:'mime',
//         EXTNAME:'extname',
//         CONTENT_TYPE:'content-type' ,
//     }
// }


class Strategy {
    /**
     * 
     * @param {Object.<string,any>} data 
     * @returns {Promise<{error:{location:string;message:string;subjects:Object.<string,any>}}|{success:Object.<string,any>}>}
     */
    async createRow (data) {
        return {
            success:{} ,
        }
    }

    /**
     * 
     * @param {string} rowId 
     * @returns {{error:{location:string;message:string;subjects:Object.<string,any>}}|{success:Object.<string,any>}}
     */
    readRow (rowId) {
        return {
            success:{} ,
        }
    }

    /**
     * @returns {{error:{location:string;message:string;subjects:Object.<string,any>}}|{success:Object.<string,any>}}
     */
    readAllRowsByTableName () {
        return {
            success:{} ,
        }
    }

}

class FilesStrategy extends Strategy {

    /**
     * 
     * @param {Object.<string,any>} data 
     * @returns {Promise<{error:{location:string;message:string;subjects:Object.<string,any>}}|{success:Object.<string,any>}>}
     */
    async createRow (data) {

        const { title , description  , file , filename } = data ;

        if (!file?.value?.length) {
            return errorFactory({
                location:'FilesStrategy::createRow' ,
                message:'incorrect file data' ,
                subjects:{file}
            })
        }

        const { value:fileData , contentType } = file ; 

        if(fileData instanceof Buffer === false) {
            return errorFactory({
                location:'FilesStrategy::createRow' ,
                message:'file data is not a Buffer instance' ,
                subjects:{file}
            })
        }


        const { success , error } = await filemanager.write(fileData);

        if(error) {
            return {
                error ,
            }
        }

        if(!success) {

            throw new Error(`incorrect "succes" data`);

            //     return errorFactory({
            //     location:'FilesStrategy::createRow' ,
            //     message:'incorrect success' ,
            //     subjects:{file}
            // })
        }

        const { filename:fileSystemFilename } = success || {} ;
        // console.log({filename});
        const ext = extname(filename.value.toString('utf-8')) ;

        // const { FILE:_FIELDNAME } = DB_TABLES_FIELDSNAMES ;
        const { keys: filednames } = DB_CONSTANTS.tables.FILES ;

        const { success:dbSuccess } = database.createRow(DB_CONSTANTS.tables.FILES.tablename , {
            [filednames.TITLE]:title?.value?.toString('utf-8') || null ,
            [filednames.DESCRIPTION]:description?.value?.toString('utf-8') || null ,
            [filednames.ORIGINAL_FILENAME]:filename?.value?.toString('utf-8') || null ,
            [filednames.FILESYSTEM_FILENAME]:fileSystemFilename || null ,
            [filednames.CONTENT_TYPE]:contentType || null ,
            [filednames.EXTNAME]:ext || null ,
        });

        return {
            success:dbSuccess ,
        }

    }

    /**
     * 
     * @param {string} rowId 
     * @returns {{error:{location:string;message:string;subjects:Object.<string,any>}}|{success:Object.<string,any>}}
     */
    readRow (rowId) {

        const { success , error } = database.readRow(DB_CONSTANTS.tables.FILES.tablename , rowId);

        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,
        }
    }

    /**
     * @returns {{error:{location:string;message:string;subjects:Object.<string,any>}}|{success:Object.<string,any>}}
     */
    readAllRowsByTableName () {

        const { error , success } = database.readTable(DB_CONSTANTS.tables.FILES.tablename);

        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,            
        }
    }


    constructor () {
        super();
    }
}

class UsersStrategy extends Strategy {

    constructor () {
        super();
    }
}

validationStrategies.set(DB_CONSTANTS.tables.FILES.tablename , new FilesStrategy());
// validationStrategies.set(dbtablename.FILES , new FilesStrategy());

module.exports = { validationStrategies , Strategy }