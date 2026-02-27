const { extname } = require("node:path");
const { filemanager } = require("../../file-manager/controller/fm-controller");
const { database } = require("../database");

const dataBaseControllerBehaviors = new Map();

const DB_CONTROLLER_BEHAVIORS_NAMES = {
    FILES:'files' ,
    USERS:'users' ,
}

const DB_CONTROLLER_FILE_BEHAVIOR = {

}

const FILE_TABLE_COLUMNS_KEYS = {
    TITLE:'title',
    DESCRIPTION:'description',
    ORIGINAL_FILENAME:'originalFilename',
    STORAGE_FILENAME:'storageFilename',
    MIME:'mime',
    EXTNAME:'extname',
    FILE_DATA:'fileData' ,
}

class DataBaseControllerStrategy {

    /**
     * 
     * @param {string} tableId 
     * @param {Object} data 
     * @returns {Promise<{success:Object}|{error:Object}>}
     */
    createRow (tableId , data) {
        return {}
    }
    
    readRow (tableId , rowId) {
        return {}
    }

    readTableRows (tableId) {
        return {}
    }

    constructor () {}
}

class FilesStrategyBehavior extends DataBaseControllerStrategy {


    /**
     * 
     * @param {*} tableId 
     * @param {*} data 
     * @returns 
     */
    async createRow (tableId , data) {

        console.log('FilesStrategyBehavior::createRow' , {data});

        const { title , description , file , filename } = data ;

        if(!file?.value?.length || !file?.contentType) {
            return {
                error:{
                    location:'create row file behavior' ,
                    subjects:{file} ,
                    message:'incorrect file-data' ,
                } ,
            }
        }
            
        if(!filename?.value?.length) {
            return {
                error:{
                    location:'create row file behavior' ,
                    subjects:{file} ,
                    message:'provided no file-name' ,
                } ,
            }
        }

        const { value:fileData , contentType:fileContentType } = file ;
    
        const { error , success } = await filemanager.write(fileData);

        if(error) {
            return {
                error ,
            }
        }

        const { filename:storageFilename } = success ;

        const mime = fileContentType || null ;
        const originalFilename = filename.value.toString('utf-8') || null ;
        const ext = extname(originalFilename) || null ;

        const dbresponse = database.createRow(tableId  , {
            title:title?.value?.toString('utf-8') || null ,
            description:description?.value?.toString('utf-8') || null ,
            originalFilename:filename?.value?.toString('utf-8') || null ,
            storageFilename:storageFilename || null ,
            mime:mime || null ,
            ext:ext || null ,
        });

        const { row: {id:dbRowId , columns:dbRowIColumns} } = dbresponse ;

        if(!dbRowId || !dbRowIColumns) {
            return {
                error:{
                    message:'smth wrong with dbresponse' ,
                }
            }
        }

        return {
            success:{
                row:{
                    id:dbRowId ,
                    columns:dbRowIColumns ,
                }
            }
        };
    }
    
    readRow (tableId , rowId) {
        console.log('FilesStrategyBehavior::readRow');
        return {}
    }
    
    readTableRows (tableId) {
        console.log('FilesStrategyBehavior:readTableRows');
        return {}
    }

    constructor () {
        super();
    }
}

dataBaseControllerBehaviors.set(DB_CONTROLLER_BEHAVIORS_NAMES.FILES , new FilesStrategyBehavior());

module.exports = { dataBaseControllerBehaviors , DataBaseControllerStrategy , DB_CONTROLLER_BEHAVIORS_NAMES }