const { dataBase } = require("../../../database/controller/db.controller");
const { DATABASE_TYPES, DATABASE_TABLES, DBAdapter } = require("../db-adapter.model");

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;
const { USERS } = DATABASE_TABLES;

const UsersValidationSchema = {
    tableName:USERS,
    schema:{
        title:{
            required:true,
            type:STRING,
            defaultValue:undefined,
            primary:false,
            autoIncrement:false,
        },
        description:{
            required:false,
            type:STRING,
            defaultValue:`no description`,
            primary:false,
            autoIncrement:false,
        },
    }
}

const usersController = new DBAdapter(UsersValidationSchema, { dataBase:dataBase });

module.exports = { usersController }