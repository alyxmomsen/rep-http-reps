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

    async setRow (tablename , payload , res) {

        const tablenameHandlers = this.#createHandlers.get(tablename);
        if(!tablenameHandlers) {
            console.log('\x1b[48;2;255;0;255mno handlers by this tablename\x1b[0m');
            return ;
        }

        for (const handler of tablenameHandlers) {
            await handler(payload);
        }
    }

    onCreate (tablename , handler) {
        
        const tablenameHandlers  = this.#createHandlers.get(tablename);

        if(!tablenameHandlers) {
            this.#createHandlers.set(tablename , [handler]);
            return ;
        }

        tablenameHandlers.push(handler);
    }

    #createHandlers ;
    #readHandlers;

    constructor () {
        this.#createHandlers = new Map();
    }
}

const dbController = new DBController ;

dbController.onCreate('files' , (payload) => {
    
    console.log('db controller handler : create' , {payload});
    
    const { title , description , file , filename } = payload ;

    database.create('files' , {
        title:title?.value?.toString() || null ,
        description:description?.value?.toString() || null ,
        originalFilename:filename?.value?.toString() || null ,
        FSFilename:'no file name' ,
    });
    

});

// dbController.addHandler('files' , () => {

// });

// dbController.addHandler('files' , () => {

// });



module.exports = dbController ;