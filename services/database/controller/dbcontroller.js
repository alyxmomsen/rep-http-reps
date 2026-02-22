const { database, DataBase } = require("../database");

class DBController_ {

    getAll () {
        const db = this.#dbinstance;
        const databaseresponse = db.getAllRows_(this.#tablename);
        return databaseresponse ;
    }

    #tablename;
    #dbinstance;

    /**
     * 
     * @param {string} tablename 
     * @param {DataBase} db 
     */
    constructor (tablename , db) {
        this.#dbinstance = db ;
        this.#tablename = tablename.toUpperCase() ;
    }
}


const table = new DBController_('FILES'  , db);

class ControllerRouter {

    getControllerByTablename (tablename) {
        const controllerByTableName =  this.#controllers.get(tablename);
        if(!controllerByTableName) {
            return {
                error:{
                    m:'no by table' + tablename ,
                    subjects:{tablename , controllerByTableName} ,
                }
            }
        }
        
        return {
            success: {
                controller:controllerByTableName , 
            }
        }
    }

    #controllers;

    /**
     * 
     * @param {string} tablename 
     * @param {DataBase} db 
     */
    addByTableName (tablename , db) {
        this.#controllers.set(tablename , new DBController_(db));
    }

    constructor () {
        this.#controllers = new Map();
    }
}

const controllerRouter = new ControllerRouter (); 


controllerRouter.addByTableName('FILES' , db);
controllerRouter.getControllerByTablename('FILES').success.controller;


class MyClass {

    addRow (tablename) {
        this.#listeneres.get(tablename);
    }

    addListener (tableName , handler) {
        this.#listeneres.set(tableName , handler);

    }

    #listeneres;

    constructor () {
        this.#listeneres = new Map();
    }
}

new MyClass().addListener()


class RouterForControllers {

    /**
     * 
     * @param {*} tablename 
     * @returns {DatabaseController}
     */
    getController (tablename) {
        return this.#controllers.get(tablename);
    }

    /**
     * 
     * @param {string} tablename 
     * @param {DatabaseController} controller 
     */
    addTableController (tablename , controller) {
        this.#controllers.set(tablename , controller);
    }

    #controllers;

    constructor () {
        this.#controllers = new Map ();
    }
}

const router__controllers = new RouterForControllers()
router__controllers.addTableController('FILES');
const somedata = {foo:'bar'} ;
const controller__files = router__controllers.getController("files");
controller__files.addRow(somedata);
controller__files.getRows();

class DatabaseController {

    addRow (data) {}
    getRows() {}

    #database ;
    #tablename ;

    /**
     * 
     * @param {DataBase} db 
     * @param {string} tablename 
     */
    constructor (db , tablename) {
        this.#database = db ;
        this.#tablename = tablename ;
    }
}

class Controller__files__decorator {
    /**
     * 
     * @param {any} data 
     */
    addRow (data) {

        const { title , description } = data ;

        this.#database.createRow('files' , {
            title , description ,
        });

    }

    getRows () {
        this.#database.getAllRows_(this.#tablename);
        return {

        }
    }

    #database ;
    #tablename ;

    /**
     * 
     * @param {DataBase} db 
     * @param {string} tablname 
     */
    constructor (db , tablname) {
        this.#database = db ;
        this.#tablename = tablname ;
    }   
}


router__controllers.addTableController("files" , new Controller__files__decorator ());
router__controllers.addTableController("users" , new Controller__users__decorator ());

module.exports = {
    router__controllers ,
} ;

class Controller__users__decorator {
    /**
     * 
     * @param {any} data 
     */
    addRow (data) {

        const { title , description } = data ;

        this.#database.createRow('files' , {
            title , description ,
        });

    }

    getRows () {
        this.#database.getAllRows_(this.#tablename);
        return {

        }
    }

    #database ;
    #tablename ;

    /**
     * 
     * @param {DataBase} db 
     * @param {string} tablname 
     */
    constructor (db , tablname) {
        this.#database = db ;
        this.#tablename = tablname ;
    }   
}