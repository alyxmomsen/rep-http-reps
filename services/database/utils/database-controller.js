const LOG_PREFIX = 'DATABASE CONTROLLER: ';
const database = require("../database")

function addUser ({
    name , lastname , email , password
}) {

    database.add('users' , {
        name:'string' ,
        lastname:'string' ,
        email:'string' ,
        password:'string' ,
    });
}

function addFile ({
    title , description , originalFileName , savedFileName, mime
}) {

    // --- validate

    if (!title || !description || !originalFileName || !savedFileName || !mime) {
        throw new Error('some arguments are no valid');
    }

    // ============

    console.log(LOG_PREFIX , {title , description , originalFileName , savedFileName, mime});

    const { success , error} = database.add('files' , {
        title , description , originalFileName , 
        savedFileName , mime
    });

    return {
        success , error 
    }

}

module.exports = { addFile , addUser } ;