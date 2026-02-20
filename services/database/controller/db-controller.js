const ResponseDecorator = require("../../../app/services/router/services/response/response-decorator");
const { filemanager } = require("../../file-manager/file-manager");
const { database } = require("../database");

const crudType = {
    CREATE:'CREATE',
    READ:'READ',
    UPDATE:'UPDATE',
    DELETE:'DELETE',
}

const table = {
    FILES:'FILES' ,
    USERS:'USERS' ,
}

class DBController {

    /**
     * 
     * @param {string} tableName 
     * @param {any} payload 
     * @returns {Promise<{error?:any; success?:any}>}
     */
    async createRow (tableName , payload) {
        const { error , success } = await this.#execCRUD(crudType.CREATE , tableName , payload);

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
     * 
     * @param {string} tableName 
     * @param {any} payload 
     * @returns {Promise<{error?:any; success?:any}>}
     */
    async readRow (tableName , payload) {
        const { error , success } = await this.#execCRUD(crudType.READ , tableName , payload);
        
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
     * 
     * @param {'CREATE'|'READ' |'UPDATE' |'DELETE'} crudType 
     * @param {string} tablename 
     * @param {any} payload 
     * @returns {Promise<{success?:{result:any};error?:{message:string;subject:string}}>}
     */
    async #execCRUD (crudType , tablename , payload) {

        const crudTypeHandlers = this.#crud.get(crudType);

        if(!crudTypeHandlers) {
            return {
                error:{
                    message:'incorrect CRUD type' ,
                    subject:crudType ,
                }
            }
        }

        const tablenameBundle = crudTypeHandlers.get(tablename);

        if(!tablenameBundle) {
            return {
                error:{
                    message:'incorrect table name' ,
                    subject:tablename ,
                } ,
            }
        }

        const { handler , middleware } = tablenameBundle ;

        await this.#executeMiddleware(middleware , {});
        
        const { success , error } = await handler(payload) ;

        return {
            success ,
        }
    }

    /**
     * 
     * @param {((context:any , next:() => Promise<any>) => Promise<any>)[]} middleware 
     * @param {any} context 
     */
    async #executeMiddleware (middleware , context) {
        let index = 0 ;
        const next = async () => {
            const handlerLike = middleware[index++] ;
            if(!handlerLike) return ;
            await handlerLike(context  , next);
        }
        await next();
    }

    /**
     * 
     * @param {'CREATE'|'READ' |'UPDATE' |'DELETE'} crudType 
     * @param {string} tableName 
     * @param {((payload:any) => Promise<{success?:any;error?:any}>)[]} handlers 
     */
    addListener (crudType , tableName , ...handlers) {

        const _crudType = crudType.toUpperCase() ;

        const crudTypeHandlers = this.#crud.get(_crudType);

        if(!crudTypeHandlers) {
            throw new Error(`crud type ${_crudType}`);
        }

        const bundle = {
            handler:handlers[handlers.length - 1] , 
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] , 
        }

        crudTypeHandlers.set(tableName , bundle);
    }

    #crud ;
    
    constructor () {

        this.#crud = new Map();

        const crudTypes = [
            crudType.CREATE ,
            crudType.READ ,
            crudType.UPDATE ,
            crudType.DELETE ,
        ] ;

        crudTypes.forEach(crudType => {
            
            this.#crud.set(crudType , new Map());
        });
    }
}

const dbController = new DBController();

dbController.addListener(crudType.CREATE , table.FILES , async (payload) => {

    const { row } = payload ;

    const { title , filename: originalFilename , file , description } = row || {} ;

    if(false) {
        return {
            error:{

            }
        }
    }

    if(!file) {
        return {
            error:{
                message:`file data is not given` ,
                subject:{
                    file ,
                } ,
            } ,
        }
    }

    const { value:fileData , contentType } = file ;

    if(!contentType) {
        return {
            error:{
                message:`file mime is not given` ,
                subject:{
                    contentType ,
                } ,
            } ,
        }
    }

    const { status , error  , success } = await filemanager.write(fileData);

    if(error) {
        return {
            error:{
                message:`smth wrong with fileuploading` ,
            }
        }
    }

    const { filename } = success || {} ;

    const databaseResult = database.createRow(table.FILES , {
        title:title?.value?.toString('utf-8') ,
        description:description?.value?.toString('utf-8') , 
        filename:originalFilename?.value?.toString('utf-8') , 
        mime:contentType || null ,
        filename:filename || null ,
    } );

    return {
        success:{
            ...databaseResult ,
        }
    } ;

});

dbController.addListener(crudType.READ , table.FILES , async (payload) => {

    const { fileId } = payload ;

    const { error , success } = database.readRow(table.FILES , fileId);

    if(error) {
        return {
            error ,
        }
    }

    return {
        success ,
    }

});

module.exports = { dbController }