const ResponseDecorator = require("../../../app/services/router/services/response/response-decorator");
const { filemanager } = require("../../file-manager/file-manager");
const { database } = require("../database");

const transaction = {
    CREATE:'CREATE' ,
    READ:'READ' ,
    UPDATE:'UPDATE' ,
    DELETE:'DELETE' ,
}

const tablename = {
    FILES:'FILES' ,
    USERS:'USERS' ,
}
class DBController {

    /**
     * 
     * @param {'CREATE'|'READ'|'UPDATE'|'DELETE'} transactionType 
     * @param {string} tableName 
     * @param  {((payload) => Promise<any>)[]} handlers 
     */
    addListener (transactionType , tableName , ...handlers) {

        const _transactionType = transactionType.toUpperCase();

        const transactionBundle = {
            handler:handlers[handlers.length - 1] ,
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
        }

        const typeTransactions = this.#transactions.get(_transactionType);

        if(!typeTransactions) {
            throw new Error(`incorrect transaction type ${_transactionType}`);
        }

        typeTransactions.set(tableName , transactionBundle) ;

    }

    useMiddleware (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    /**
     * 
     * @param {'CREATE'|'READ'|'UPDATE'|'DELETE'} transactionType 
     * @param {string} tableName 
     * @param {any} payload 
     */
    async execTransaction (transactionType , tableName , payload) {

        const _transactionType = transactionType.toUpperCase();
        const _tableName = tableName.toUpperCase();
        
        const typeTransactions = this.#transactions.get(transactionType);
        
        if(!typeTransactions) {
            return {
                error:{
                    mesage:`no transaction type ${_transactionType}` ,
                } ,
            }
        }

        const transactionBundle =  typeTransactions.get(_tableName);

        if(!transactionBundle) {
            return {
                error: {
                    message:`no tablename transaction` ,
                    subjects:{
                        tableName:_tableName ,
                    }
                }
            }
        }

        const { handler , middleware } = transactionBundle ;

        const { success , error } = await handler(payload);

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
     * @param {((payload) => Promise<void>)[]} middleware 
     * @param {*} payload 
     */
    async #executeMiddleware (middleware , payload) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(payload);
        }
        await next() ;
    }

    #transactions;
    #middleware;

    constructor () {

        this.#transactions = new Map();
        this.#middleware = [] ;

        const transactions = [
            transaction.CREATE ,
            transaction.READ ,
            transaction.UPDATE ,
            transaction.DELETE ,
        ];

        transactions.forEach(transactionType => {
            this.#transactions.set(transactionType , new Map());
        });
    }
}

const dbController = new DBController();

dbController.addListener(transaction.READ , tablename.FILES , async (payload) => {
    const { rowId } = payload ;
    const { error , success } = database.readRow(tablename.FILES , rowId );

    if(error) {
        console.log({error});
        return {
            error ,
        }
    }

    const { row } = success ;
    console.log({row});
    return {
        success ,
    }
});

dbController.addListener(transaction.CREATE , tablename.FILES , async (payload) => {

    const { row:tableRowData ,  } = payload ;

    const { title , description , file , filename } = tableRowData ;

    if(!file || !file?.value) {
        return {
            error:{

            }
        }
    }

    const { status , error , success } = await filemanager.write(file.value);

    if(error) {
        return {
            error ,
        }
    }

    const { filename:dbFilename } = success ;

    const databaseResult = database.createRow(tablename.FILES , {
        title:title?.value?.toString('utf-8') ,
        description:description?.value?.toString('utf-8') ,
        originalFileName:filename?.value?.toString('utf-8') ,
        filename:dbFilename ,
    });
    
    const { id , row } = databaseResult ;

    console.log('create file' , {tableRowData , id , row});

    return {
        success:{
            data:{
                rowId:id ,
                row ,
            }
        }
    }

});

module.exports = { dbController }
