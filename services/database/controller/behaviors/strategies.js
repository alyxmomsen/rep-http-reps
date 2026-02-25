const { extname:pathExtname } = require("path");
const { loggerFactory } = require("../../../../utils/logger");
const { filemanager } = require("../../../file-manager/file-manager");
const { database } = require("../../database");
const log = loggerFactory('validation strategies' , '-u') ;

const validationStrategies = new Map();

const dbtablename = {
    FILES:'FILES' ,
    USERS:'USERS' ,
}

class Strategy {
    
    /**
     * @param {Object.<string,any>} data 
     * @returns {Promise<{success?:Object.<string,any>;error?:{location:string;message:string;subjects:Object.<string,any>}}>}
     */
    async createRow(data) {
        console.log(`default method: Strategy::createRow` , {data});
        return {
            success:{}
        };
    }

    /**
     * @param {string} rowId 
     * @returns {{success?:Object.<string,any>;error?:{location:string;message:string;subjects:Object.<string,any>}}}
     */
    async readRow(rowId) {
        console.log(`default method: Strategy::readRow` , {rowId});
        return {
            success:{}
        };
    }

    /**
     * @returns {{success?:Object.<string,any>;error?:{location:string;message:string;subjects:Object.<string,any>}}}
     */
    async readAllRowsByTableName() {
        console.log(`default method: Strategy::readAllRowsByTableName`);
        return {
            success:{}
        };
    }
}

class FilesStrategy extends Strategy {

    /**
     * 
     * @param {{
     *     title?:{value:Buffer<ArrayBuffer>;contentType:string};
     *     description?:{value:Buffer<ArrayBuffer>;contentType:string};
     *     file?:{value:Buffer<ArrayBuffer>;contentType:string};
     *     filename?:{value:Buffer<ArrayBuffer>;contentType:string};
     * }} data 
     * @returns {Promise<{
     *     success?:{
     *          id: string;
     *          row: string;
     *     };
     *     error?:{location:string;message:string;subject:Object};
     * }>}
     */
    async createRow (data) {

        const { title, description, filename:originalFilename, file } = data ;

        if(!file?.value?.length) {
            return {
                error:{
                    location:'FilesStrategy::createRow',
                    message:'incorrect file',
                    subject:file ,
                }
            }
        }

        const { value:fileBody , contentType } = file ;
        
        if(fileBody instanceof Buffer === false) {
            return {
                error:{
                    location:'FilesStrategy::createRow',
                    message:'file body is not a Buffer',
                    subject:{file} ,
                }
            }
        }

        const { success , error } = await filemanager.write(fileBody);

        if(error) {
            return {
                error ,
            }
        }

        if(!success) {
            return {
                error:{
                    location:'FilesStrategy::createRow',
                    message:'incorrect a success object',
                    subject:{success} ,
                }
            }
        }

        const { filename } = success ;

        const originalFilenameValueString = originalFilename?.value?.toString('utf-8') ;

        const extname = originalFilenameValueString && pathExtname(originalFilenameValueString) ;

        const { success:dbsuccess } = database.createRow(dbtablename.FILES ,{
            title:title?.value?.toString('utf-8') || null ,
            description:description?.value?.toString('utf-8') || null ,
            originalFilename:originalFilename?.value?.toString('utf-8') || null ,
            filesystemFilename:filename || null ,
            mime:contentType || null ,
            extname:extname || null ,
        });

        log('r'  , {dbsuccess})

        return {
            success:dbsuccess ,
        }
    }

    /**
     * 
     * @param {string} rowId 
     * @returns {{
     *     success?:{row:Object.<string,any>};
     *     error?:{location:string;message:string;subject:Object};
     * }}
     */
    readRow (rowId) {

        const { error , success } = database.readRow(dbtablename.FILES , rowId);

        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,
        };
    }

    /**
     * 
     * @returns {{
     *     success?:{row:Object.<string,any>};
     *     error?:{location:string;message:string;subject:Object};
     * }}
     */
    readAllRowsByTableName () {
        const { error , success } = database.readTable(dbtablename.FILES);
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

validationStrategies.set(dbtablename.FILES , new FilesStrategy());
// validationStrategies.set('users' , new FilesStrategy());

module.exports = { validationStrategies , Strategy }