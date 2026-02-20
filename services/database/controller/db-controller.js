const ResponseDecorator = require("../../../app/services/router/services/response/response-decorator");
const { database } = require("../database");

const table = {
    FILES:'FILES' ,
    USERS:'USERS' ,
}

const crudType = {
    CREATE:'CREATE' ,
    READ:'READ' ,
    UPDATE:'UPDATE' ,
    DELETE:'DELETE' ,
}
class DBController {
    
    async addRow (tablename , payload) {

        const result = await this.#execCRUD(crudType.CREATE , tablename , payload);

        return result ;

    }

    async getRow (tablename , payload) {

        const result = await this.#execCRUD(crudType.READ , tablename , payload);

        return {
            ...result ,
        }
    }

    async #execCRUD (crudType , tablename , payload) {
        const crudTypeHandlers = this.#crud.get(crudType);
        if(!crudTypeHandlers) {
            return {error:'incorrect crud type'} ;
        }
        
        const tablenameBundle = crudTypeHandlers.get(tablename) ;

        if(!tablenameBundle) {
            return {error:'incorrect table name'};
        }

        const { middleware , handler } = tablenameBundle ;
        console.log({middleware , handler});
        await this.#executeMiddleware({} , middleware);
        const handlerResult = await handler(payload);

        return handlerResult;
    }

    async #executeMiddleware (payload , middleware) {
        let index = 0;
        const next = async () => {
            const handler = middleware[index++];
            if(!handler) return ;
            await handler(payload);
        }
        await next();
    }


    addHandler (type , tablename , ...handlers ) {
        console.log({type , tablename , handlers});
        const typeHandlers = this.#crud.get(type);
        if(!typeHandlers) {
            throw new Error('incorrect CRUD type');
        }

        // const tablenameBundle = typeHandlers.get(tablename);

        const bundle = {
            middleware:handlers.length > 1 ? handlers.slice(0 , -1) : [] ,
            handler:handlers[handlers.length - 1] ,
        } ;

        typeHandlers.set(tablename , bundle);

        // if(!tablenameBundle) {
        //     typeHandlers.set(tablename , bundle);
        //     return ;
        // }

        // tablenameBundle.set(tablename);
    }

    #crud ;

    constructor () {

        const crud = [
            crudType.CREATE  , crudType.READ ,
            crudType.UPDATE , crudType.DELETE ,
        ] ;

        this.#crud = new Map();

        crud.forEach(type => {
            this.#crud.set(
                type.toUpperCase() , 
                new Map()
            ) ;
        });

    }
}

const dbController = new DBController();

dbController.addHandler(crudType.CREATE , table.FILES , async (payload) => {
    const { row , res:response } = payload ;

    const { title , description , file , filename } = row ;

    const result = database.createRow(table.FILES , {
        title:title?.value?.toString('utf-8') ,
        description:description?.value?.toString('utf-8') ,
        filename:filename?.value?.toString('utf-8') ,
    });
    
    return result
}) ;

dbController.addHandler(crudType.READ , table.FILES , async (payload) => {
    const {  } = payload ;
    console.log(`${crudType.READ} ${table.FILES}` , {payload});
}) ;

module.exports = { dbController }