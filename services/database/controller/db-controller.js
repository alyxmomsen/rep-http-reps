const ResponseDecorator = require("../../../app/services/router/services/response/response-decorator");
const { database } = require("../database");

class DBController {

    // async exec(crudtype , {tablename , payload}) {

    //     const tablenameHandlers = this.#createHandlers.get(tablename);
    //     if(!tablenameHandlers) {
    //         console.log('\x1b[48;2;255;0;255mno handlers by this tablename\x1b[0m');
    //         return ;
    //     }
    
    //     for (const handler of tablenameHandlers) {
    //         await handler(payload);
    //     }
    // }

    getRow (table , rowId , res) {
        for (const [a , b] of this.#getHandlers.entries()) {
            console.log({a , b});
        }
    }

    async setRow (tablename , payload , res) {

        const tablenameHandlers = this.#createHandlers.get(tablename);
        if(!tablenameHandlers) {
            console.log('\x1b[48;2;255;0;255mno handlers by this tablename\x1b[0m');
            return ;
        }

        for (const handler of tablenameHandlers) {
            await handler(payload , res);
        }
    }

    addGetter (tablename , handler , res) {

        this.#getHandlers.get(tablename);

    }

    addCreator (tablename , handler) {
        
        const tablenameHandlers  = this.#createHandlers.get(tablename);

        if(!tablenameHandlers) {
            this.#createHandlers.set(tablename , [handler]);
            return ;
        }

        tablenameHandlers.push(handler);
    }

    #createHandlers ;
    // #readHandlers;

    #getHandlers;

    constructor () {
        this.#createHandlers = new Map();
        this.#getHandlers = new Map();
    }
}

const dbController = new DBController();

dbController.addGetter('files' , () => {

    database.getAllByTableName();

});

dbController.addCreator('files' , (payload , res) => {
    
    
    const { title , description , file , filename } = payload ;
    
    console.log('db controller handler : create "file"' , {title , description , file , filename} , {payload});
    

    const addedRow = database.create('files' , {
        title:title?.value?.toString() || null ,
        description:description?.value?.toString() || null ,
        originalFilename:filename?.value?.toString() || null ,
        FSFilename:'no file name' ,
    });
    
    if(res instanceof ResponseDecorator === false) return ;

    let responsepayload = res.getPayload();
    const { files } = responsepayload ;
    if(!files) {
        responsepayload.files = {
            added:[addedRow] , 
        } ;
        return ;
    }
    if(!files.added) {
        files.added = [addedRow] ;
        return ;
    }
    files.added.push(addedRow);
    responsepayload = {...responsepayload , files} ;
    res.addPayloadValue('files' , files);

});

dbController.addCreator('users' , (payload , res) => {
    console.log('db controller handler : create "user"' , {payload});
    
    const { role , rights , name } = payload ;
    const lastname = payload['last-name'] ;

    const addedRow = database.create('users' , {
        role:role?.value?.toString() || null ,
        rights:rights?.value?.toString() || null ,
        name:name?.value?.toString() || null ,
        lastname:lastname?.value?.toString() || null ,
    });
    
    if(res instanceof ResponseDecorator === false) return ;

    let responsepayload = res.getPayload();
    const { users } = responsepayload ;
    if(!users) {
        responsepayload.users = {
            added:[addedRow] ,
        } ;
        return ;
    }
    if(!users.added) {
        users.added = [addedRow] ;
        return ;
    }
    users.added.push(addedRow);
    responsepayload = {...responsepayload , users} ;
    res.addPayloadValue('files' , users);
});

module.exports = { dbController }