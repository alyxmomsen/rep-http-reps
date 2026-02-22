const { filemanager } = require("../../../file-manager/file-manager");
const { database } = require("../../database");

const validationStrategies = new Map();

class Strategy {

    /**
     * 
     * @param {Object.<string,Object>} data
     * @returns {Promise<{success?:Object;error?:Object}>} 
     */
    async createRow (data) {
        console.log('default create row method');
        return {}
    }

    /**
     * 
     * @returns {{success?:Object;error?:Object}} 
     */
    readRow () {
        console.log('default read-row method');
        return {}
    }
    
    /**
     * @returns {{success?:Object;error?:Object}} 
     */
    readAllRows () {
        console.log('default read-row method');
        return {}
    }
    
}

class FilesStrategy extends Strategy {

    /**
     * Object.<string,{value:Buffer<ArrayBuffer>;contentType:string}>
     * @param {Object.<string,{value:Buffer<ArrayBuffer>;contentType:string}>} data
     * @returns {Promise<{success?:{id:string;row:Object};error?:{message:string;subject:{location:string}}>} 
     */
    async createRow (data) {

        const { title , description , filename , file } = data ;

        console.log('files strategy' ,{data});

        if(!file?.value?.length) {
            return {
                error: {
                    subject:{
                        location:'FilesStrategy::createRow' ,
                    } ,
                    message:'incorrect file data' ,
                } ,
            }
        }

        const { error , success } = await filemanager.write(file.value);

        if(error) {
            return {
                error: {
                    ...error ,
                } ,
            }
        }

        const { filename:FSFilename } = success ;

        const { success:dbsuccess } = database.createRow('files'.toUpperCase() , {
            title:title?.value?.toString('utf-8') || null ,
            description:description?.value?.toString('utf-8') || null ,
            originalFilename:filename?.value?.toString('utf-8') || null ,
            FSFilename:FSFilename || null ,
            title:title?.value?.toString('utf-8') || null ,
        });

        return {
            success:{
                ...dbsuccess ,
            }
        }
    }

    /**
     * 
     * @param {string} rowId 
     * @returns {{error?:{message:string;subject:{location:string}};success?:{row:Object.<string,any>}}}
     */
    readRow (rowId) {

        const { error , success } = database.readRow('files' , rowId);

        if(error) {
            return {
                error:{
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

    readAllRows() {
        const { error ,success } = database.readTable('files');
        
        if(error) {
            return {
                error:{
                    ...error ,
                } ,
            }
        }

        return {
            success:{
                ...success ,
            } ,
        }
    }

    constructor () {
        super();
    }
}

class UsersStrategy extends Strategy {

    
}

validationStrategies.set('files' , new FilesStrategy());
// validationStrategies.set('users' , new FilesStrategy());

module.exports = { validationStrategies , Strategy }