const DataBase = require("../database");

const database = new DataBase();

function createUser ({name , lastname}) {

    const TABLENAME = 'USERS' ;

    return database.create(TABLENAME , {name , lastname});
}   

function createFile ({filename , mime , originalFilename , title , description}) {

    return database.create('FILES' ,{filename , mime , originalFilename , title , description});
}

function readFileById (id) {
    return database.getTableItemById('FILES' , id);
}

function readFiles () {
    return database.getTableItems('FILES');
}

module.exports = { createFile , createUser , readFileById , readFiles} ;