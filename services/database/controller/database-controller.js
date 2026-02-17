const { Readable } = require("stream");
const DataBase = require("../database");
const { randomBytes } = require("crypto");
const { resolve } = require("path");
const { createWriteStream } = require("fs");
const FileManager = require("../../file-manager/file-manager");

const database = new DataBase();

function createUser ({name , lastname}) {

    const TABLENAME = 'USERS' ;

    return database.create(TABLENAME , {name , lastname});
}   

async function createFile ({mime , originalFilename , title , description , file}) {
    
    if(!file || !file.length) {
        console.log('no file data provided');
    }

    const uploadResult = await (new FileManager().write(file));
    const {status , success , error} = uploadResult ;
    
    if(error) {
        console.log({error});
        return null ;
    }

    const { payload:{filename} } = success ;
    
    // console.log('create file'.toString() , {filename , mime , originalFilename , title , description , file} );

    const rowId = database.create('FILES' ,{filename , mime , originalFilename , title , description});

    return {
        id:rowId , filename , mime , 
        originalFilename ,title , description ,
    }
}

async function readFileById (id) {
    const file = database.getTableItemById('FILES' , id);

    if(!file) return null ;

    const { filename } = file ;

    const filemanager = new FileManager();

    const { error  , success } = await filemanager.read(filename);

    if(error) {
        
        console.log({error});
    }

    if(success) {
        
        console.log({success});

        const { file:filedataBuffer } = success ;

        file.file = filedataBuffer ;
    }

    console.log({file});

    return file ;
}

function readFiles () {
    const files = database.getTableItems('FILES');
    console.log({files});
    return 
}

module.exports = { createFile , createUser , readFileById , readFiles} ;