const database = require("../database");

database ;

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

function addUser (payload) {

    const {
        name , lastname , email , password
    } = payload ;

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

module.exports = { addFile , addUser} ;