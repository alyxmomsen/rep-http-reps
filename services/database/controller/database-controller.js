const { Readable } = require("stream");
const DataBase = require("../database");
const { randomBytes } = require("crypto");
const { resolve } = require("path");
const { createWriteStream } = require("fs");

const database = new DataBase();

function createUser ({name , lastname}) {

    const TABLENAME = 'USERS' ;

    return database.create(TABLENAME , {name , lastname});
}   

function createFile ({filename , mime , originalFilename , title , description , file}) {
    
    if(file && file.length) {

        // const newFIlePath = resolve(join('.' , 'uploads' , randomBytes(32).toString('utf-8')));

        // const rs = Readable.from(file);
        // const ws = createWriteStream(newFIlePath);
        // rs.on('end' , () => {

        // });
        
    }
    
    console.log('create file'.toString() , {filename , mime , originalFilename , title , description , file} );
    return database.create('FILES' ,{filename , mime , originalFilename , title , description});

}

function readFileById (id) {
    return database.getTableItemById('FILES' , id);
}

function readFiles () {
    return database.getTableItems('FILES');
}

module.exports = { createFile , createUser , readFileById , readFiles} ;