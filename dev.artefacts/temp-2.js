const { loggerFactory } = require("../../../../utils/logger");
const { filemanager } = require("../../../file-manager/file-manager");
const { database } = require("../../database");
const log = loggerFactory('validation strategies' , '-u') ;

const validationStrategies = new Map();

const tablename = {
    FILES:'FILES' ,
}

class Strategy {
    /**
     * @param {Object.<string,{value:Buffer<ArrayBuffer>;contentType:string}>} data
     * @returns {Promise<{error?:{location:string;message:string;subject:Object};sucess:Object}>} 
     */
    async createRow (data) {
        console.log(`default Strategy::createRow`);
        return {}
    }
    
    /**
     * @returns {{error?:{location:string;message:string;subject:Object};success?:Object}}
    */
    readRow () {
        console.log(`default Strategy::readRow`);
        return {}
    }
    
    /**
     * 
     * @returns {{error?:{location:string;message:string;subject:Object};success?:Object}}
     */
    readAllRowsByTableName () {
        console.log(`default Strategy::readAllRowsByTableName`);
        return {}
    }
    constructor () {}
}

class FilesStrategy extends Strategy {

    /**
     * @param {Object.<string,{value:Buffer<ArrayBuffer>;contentType:string}>} data 
     * @returns {{error?:{loacation:string;message:string;subject:Object};success?:Object}}
     */
    async createRow (data) {

        const { title , description  , filename , file } = data ;

        log('r' , {data});

        const filedata = file?.value ;

        if(!filedata?.length) {
            return {
                error:{
                    loacation:`FilesStrategy::createRow` ,
                    message:'incorrect file data' ,
                    subject:{file} ,
                } ,
            }
        }

        const { error , success } = await filemanager.write(filedata);

        if(error) {
            return {
                error ,
            }
        }

        const { filename:filesystemFilename } = success ;

        const {error:dbError  ,success:dbsuccess} = database.createRow(tablename.FILES ,{
            title:title?.value?.toString('utf-8') || null ,
            description:description?.value?.toString('utf-8') || null ,
            filesystemFilename:filesystemFilename || null ,
            originalFilename:filename?.value?.toString('utf-8') || null ,
        });

        if(dbError) {
            return {
                error:dbError ,
            }
        }

        log()

        return {
            success:dbsuccess ,
        }
    }
    
    /**
     * @param {string} rowId 
     * @returns {{error?:{location:string;message:string;subject:Object};success:any}}
    */
    readRow (rowId) {
        log('y' , `FilesStrategy::readRow` , rowId);
        const { error , success } = database.readRow(tablename.FILES , rowId);
        if(error) {
            return {
                error ,
            }
        }

        return {success}
    }
    
    /**
     * 
     * @returns {{error?:{location:string;message:string;subject:Object};success?:Object}
    */
    readAllRowsByTableName () {
        log('y' , `FilesStrategy::readAllRowsByTableName`);
        const {error , success} = database.readTable(tablename.FILES);
        if(error) {
            return {
                error ,
            }
        }

        return {success}
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

validationStrategies.set(tablename.FILES , new FilesStrategy());
// validationStrategies.set('users' , new FilesStrategy());

module.exports = { validationStrategies , Strategy }