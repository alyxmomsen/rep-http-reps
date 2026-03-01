const { DBController } = require("../model/db-conroller.model");

const contentTypes = {
    TEXT_PLAIN:'text/plain' ,
}

const { TEXT_PLAIN } = contentTypes ;

const fileControllerModels = new Map();

const filesModel = new DBController({
    title:{
        type:'string' ,
        default:'untitled' ,
        required:false ,
    } ,
    description:{
        type:'string' ,
        default:'no description' ,
        required:false ,
    } ,
    filesistemFilename:{
        type:'required' ,
        default:undefined ,
        required:true ,
    } ,
    originaleFilename:{
        type:'string' ,
        default:undefined ,
        required:false ,
    } ,
    mime:{
        type:'string' ,
        default:undefined ,
        required:false ,
    } ,
});

const usersModel = new DBController({
    name:{
        type:'string' ,
        default:'no name' ,
        required:true ,
    } ,
    lastName:{
        type:'string' ,
        default:'no last name' ,
        required:true ,
    } 
});


module.exports = { usersModel , filesModel  }