const database = require("../data-base/data-base");

function addFile ({
    originalFilename ,mime ,
    filepath ,title ,description
}) {

    if(!originalFilename || !mime || !filepath || !title) {
        throw new Error('DATABASE ERROR: requires originalFilename|contentType|filepath|title but no given');
    }
    
    database.add('files' ,{
        originalFilename:'string' ,
        mime:'string' ,
        filepath:'string' ,
        title:'string' ,
        description:'string' ,
    });

}

function addUser ({name , lastname , email , password}) {

    if(!name || !email || !password) {
        throw new Error('DATABASE ERROR: requires name|email|password but no given');
    }

    database.add('users' ,{
        name ,
        lastname ,
        email ,
        password ,
    });

}

function getTable(tableName) {
    database;
    return {

    }
}



module.exports = { addFile , addUser} ;