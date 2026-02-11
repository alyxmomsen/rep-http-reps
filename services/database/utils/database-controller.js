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

    database.add('files' , {
        title , description , originalFileName , 
        filepath , filename , mime
    });
}