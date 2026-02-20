const ResponseDecorator = require("../../../app/services/router/services/response/response-decorator");
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
     * @returns {Promise<{error?:any ; success?:any}>}
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
     * @returns {Promise<{error?:any ; success?:any}>}
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
     * @param {string} crudType 
     * @param {string} tableName 
     * @param {*} payload 
     * @returns {Promise<{success?:any;error?:any}>}
     */
    async #execCRUD (crudType , tableName , payload) {
        
        const crudTypeHandlers = this.#crud.get(crudType);

        if(!crudTypeHandlers) {
            return {
                error: {
                    message:'incorrect crud type' ,
                    subject:crudType ,
                }
            }
        }
        
        const tablenameBundle = crudTypeHandlers.get(tableName);
        
        if(!tablenameBundle) {
            return {
                error: {
                    message:'incorrect table name' ,
                    subject:tableName ,
                }
            }
        }
        
        const {
            handler , 
            middleware ,
        } = tablenameBundle ;

        await this.#executeMiddleware({} ,middleware);
        const handlerResult = await handler(payload);

        return {
            success:{
                result:handlerResult ,
            }
        }
    }

    /**
     * 
     * @param {'CREATE'|'READ'|'UPDATE'|'DELETE'} crudType 
     * @param {string} tableName 
     * @param {((payload:any) => ({response?:any , error?:any}))[]} handlers 
     */
    addListener (crudType , tableName  , ...handlers) {

        const _crudType = crudType.toUpperCase();

        const crudTypeHandlers = this.#crud.get(_crudType);

        if(!crudTypeHandlers) {
            throw new Error(`this crud type ${crudType} is not ...`);
        }

        const bundle = {
            handler:handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
        }

        crudTypeHandlers.set(tableName , bundle);
    }

    /**
     * 
     * @param {((next:() => void) => Promise)[]} middleware 
     */
    async #executeMiddleware (middleware) {
        let index = 0 ;
        const next = async () => {
            const handlerLike = middleware[index++] ;
            if(!handlerLike) return ;
            await handlerLike(next);
        }
        await next();
    }
    
    #crud ;

    constructor () {

        const crudTypes = [
            crudType.CREATE ,
            crudType.READ ,
            crudType.UPDATE ,
            crudType.DELETE ,
        ] ;

        const tables = [
            table.FILES ,
            table.USERS ,
        ] ;

        this.#crud = new Map();

        crudTypes.forEach(type => {
            this.#crud.set(type , new Map());
        });

    }
}

const dbController = new DBController();

dbController.addListener(crudType.CREATE , table.FILES , (payload) => {
    
    console.log('create file handler' , { payload });

    const { row } = payload ;

    const { title , description , filename , file } = row || {} ;

    const databaseresult = database.createRow(table.FILES , {
        title:title?.value?.toString('utf-8') , 
        description:description?.value?.toString('utf-8') ,
        filename:filename?.value?.toString('utf-8') ,
    });

    return databaseresult ;
});

module.exports = { dbController }