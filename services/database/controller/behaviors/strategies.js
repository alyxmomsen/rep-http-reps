const { filemanager } = require("../../../file-manager/file-manager");
const { database } = require("../../database");

const validationStrategies = new Map();

class Strategy {

    /**
     * 
     * @param {} data 
     * @returns {Promise<{error:any;success:any}>} 
     */
    async createRow (data) {
        console.log(`default method createRow`);
        return 
    }

    /**
     * @param {string} id 
     * @returns {{error:{message:string;subjects:any};success:{row:any}}}
     */
    readRow (id) {
        console.log(`default method readRow`);
        return 
    }
    
    readAllRowsByTableName () {
        console.log(`default method readAllRowsByTableName`);
        return
    }

    constructor () {}
}

class FilesStrategy extends Strategy {

    // overwrite
    /**
     * 
     * @param {{title?:{value:string;contentType:string};description?:{value:string;contentType:string};file?:{value:Buffer<ArrayBuffer>;contentType:string};filename?:{value:string;contentType?:string}}} data 
     * @returns {Promise<{error?:any;success?:{filename:string}}>}
     */
    async createRow (data) {
        console.log('file strategy' , {data});
        const { title , description , file , filename } = data ;
        
        if(!file?.value?.length) {
            return {
                error:{
                    message:'incorrect file data' ,
                    subjects:{file} ,
                }
            }
        }

        const { status , error , success } = await filemanager.write(file.value);

        console.log({status , error , success});

        if(error) {
            return {
                error:{
                    ...error ,
                } ,
            }
        }

        const { filename:dbFilename } = success || {} ;

        const { error:dberror , success:dbsuccess } = database.createRow('files' ,{
            title:title?.value?.toString('utf-8') || null ,
            description:description?.value?.toString('utf-8') || null ,
            originalFilename:filename?.value?.toString('utf-8') || null ,
            dbFilename:dbFilename || null ,
        }) ;

        console.log('dbresponse' ,{dbsuccess , dberror});

        if(dberror) {
            return {
                error:{
                    ...dberror ,
                } ,
            }
        }

        return {
            success:{
                ...dbsuccess ,
            } ,
        }

    }

    /**
     * 
     * @param {string} id 
     * @returns {{error:{message:string;subjects:any};success:{row:any}}}
     */
    readRow (id) {
        const { success , error } = database.getRow_('files' , id);

        if(error) {
            return {
                error: {
                    ...error ,
                } ,
            }
        }

        return {
            success:{
                ...success ,
            }
        }
    }

    constructor () {
        super();
    }
}

class UsersStrategy extends Strategy {

    // overwrite
    /**
     * 
     * @param {string} data 
     */
    createRow (data) {

        console.log('users strategy');

        const {  } = data ; 

        // database.createRow();
    }

    constructor () {
        super();
    }
}

validationStrategies.set('files' , new FilesStrategy());
validationStrategies.set('users' , new UsersStrategy());

module.exports = { validationStrategies , Strategy }