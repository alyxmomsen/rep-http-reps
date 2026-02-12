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
    title , description , originalFileName , filename, filepath , mime
}) {

    // --- validate

    if (!title || !description || !originalFileName || !filename || !filepath || !mime) {
        throw new Error('some arguments are no valid');
    }

    // ============

    database.add('files' , {
        title , description , originalFileName , 
        filepath , filename , mime
    });
}

module.exports = { addFile , addUser } ;