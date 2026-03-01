
class DataBase {

    createOne (tableId , data) {
        console.log('create one' ,{tableId , data});
    }

    readOne (tableId , rowId) {
        console.log('read one' ,{tableId , rowId});
    }
    
    readAll (tableId) {
        console.log('read all' ,{tableId});
    }

    updateOne (tableId , rowId , data) {
        console.log('update one' , {tableId , rowId , data});
    }

    deleteOne (tableId , rowId) {
        console.log('delete one' , {tableId , rowId});
    }

    deleteTable (tableId) {
        console.log('delete table' , tableId);
    }

    constructor () {}
}

const database = new DataBase ;

module.exports = { database }
