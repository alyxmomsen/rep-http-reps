
const CONSTANTS = {
    CRUD:{
        CREATE_ONE_ROW:'CREATE_ONE_ROW',
        READ_ONE_ROW:'READ_ONE_ROW',
        READ_TABLE:'READ_TABLE',
        UPDATE_ONE_ROW:'UPDATE_ONE_ROW',
        DELETE_ONE_ROW:'DELETE_ONE_ROW',
        DELETE_TABLE:'DELETE_TABLE',
    }
}

class DBController {

    addOne (data) {
        const errors = [] ;
        const columns = {};

        for (const [key , type] of Object.entries(this.#model)) {

            const value = data[key] ;
            let error = [] ;
            if(!value) {
                error.push({
                    key , 
                    value ,
                    message:'wrong key' ,
                });
            }

            if(typeof value !== type) {
                errors.push({
                    key , 
                    value ,
                    message:'wrong type' ,
                })
            }

            if(error.length) {
                errors.push(error);
                continue;
            }

            columns[key] = value ;
        }

        console.log({columns/*  , errors */});
    }

    #validation (data) {}

    #model;

    constructor (filelds) {

        this.#model = {} ;

        for(const [ key , value ] of Object.entries(filelds)) {
            
            console.log({key , value});
            this.#model[key] = value ;
        }
    }
}

module.exports = { DBController }