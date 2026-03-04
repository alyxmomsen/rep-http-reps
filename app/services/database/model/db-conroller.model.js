const { database } = require("../database");

const CONSTANTS = {
    CRUD:{
        CREATE_ONE_ROW:'CREATE_ONE_ROW',
        READ_ONE_ROW:'READ_ONE_ROW',
        READ_TABLE:'READ_TABLE',
        UPDATE_ONE_ROW:'UPDATE_ONE_ROW',
        DELETE_ONE_ROW:'DELETE_ONE_ROW',
        DELETE_TABLE:'DELETE_TABLE',
    } , 
    PROPERTY_VALUE_CONFIG_KEYS:{
        VALUE_TYPE:'VALUE_TYPE' ,
        DEFAULT_VALUE:'DEFAULT_VALUE' ,
        REQUIRED:'REQUIRED' ,
    } ,
    DB_TABLES_NAMES:{
        VIDEO:'video',
        USERS:'users',
    }
}

class DBController {

    /**
     * 
     * @param {Object.<string,string|Buffer<ArrayBuffer>>} incomingData 
     */
    addOne (tablename , incomingData) {

        // console.log({incomingData});

        const allErrors = [] ;

        /* поля прошедшие валидацию */
        const validColumns = {};

        /* перебор модели валидации */
        /* в данной реализации возможна только валидация CreateOne запроса */
        for (const [MODEL_PROPERTY_NAME , MODEL_PROPERTY_VALUE_CONFIG] of Object.entries(this.#model)) {

            /* ошибки входящего property */
            let propertyErrors = [] ;

            /* 
            проверка входных данных на существование значения в соответствии с [MODEL_PROPERTY_NAME]
            если значение поля является "falsy" значением, то добавляется запись в массив "propertyErrors"
            */ 
            const valueByPropertyName = incomingData[MODEL_PROPERTY_NAME] ;
            // console.log({MODEL_PROPERTY_NAME , valueByPropertyName});
            if(!valueByPropertyName) {
                /* применение единой модели фабрики ошибок  */
                propertyErrors.push(errorFactoryUtil(
                    MODEL_PROPERTY_NAME , valueByPropertyName ,
                    `property name ${MODEL_PROPERTY_NAME} is not provided`
                ));
            }

            /* получение модели имен ключей для корректного извлечения значений из входящего объекта */
            const { PROPERTY_VALUE_CONFIG_KEYS:MODEL_KEYS } = CONSTANTS ;

            /* извлечение по корректным ключам */
            const valueTypeModel = MODEL_PROPERTY_VALUE_CONFIG[MODEL_KEYS.VALUE_TYPE] ;
            const requiredFlagModel = MODEL_PROPERTY_VALUE_CONFIG[MODEL_KEYS.REQUIRED] ;
            const defaultValueModel = MODEL_PROPERTY_VALUE_CONFIG[MODEL_KEYS.DEFAULT_VALUE] ;

            /* логирование для отладки */
            // console.log({valueTypeModel , requiredFlagModel  ,defaultValueModel , MODEL_PROPERTY_VALUE_CONFIG});

            /* валидация типа входных данных в соответствии с моделью */
            if(typeof valueByPropertyName !== valueTypeModel) {
                /* #warning: отсутвует фабрика */
                propertyErrors.push({
                    key: MODEL_PROPERTY_NAME , 
                    value: valueByPropertyName ,
                    message:'wrong type' ,
                })
            }

            /* если есть хотябы одна инвалидность то поле считается не валидным */
            /* #warning: отсутствует валидация по "required" флагу */
            if(propertyErrors.length) {
                allErrors.push(propertyErrors);
                continue;
            }

            /* успешная валидация; добавляем поле в объект валидных полей */
            validColumns[MODEL_PROPERTY_NAME] = valueByPropertyName ;
        }

        /* что то делаем с данными. пока что просто логирование результата */
        for (const error of allErrors) {
            console.log({error});
        }

        // console.log({validColumns});

        const rowid = database.createOne(tablename ,validColumns);

        return rowid ;
    }

    readOne (tableId , rowId) {
        database.readOne('tableId' , 'rowId');
    }

    // #validation (data) {}

    #model;

    /**
     * 
     * @param {Object} validationModel 
     */
    constructor (validationModel) {

        this.#model = {} ;

        for(const [ propertyName , validationRules ] of Object.entries(validationModel)) {
            
            console.log({key: propertyName , value: validationRules});
            this.#model[propertyName] = validationRules ;
        }
    }
}

module.exports = { DBController , CONSTANTS }

// utils 

/**
 * 
 * @param {string} propertyKey 
 * @param {string|Buffer<ArrayBuffer>} propertyValue 
 * @param {string} message 
 * @returns {{
 *  key:string;
 *  value:string|Buffer<ArrayBuffer>;
 *  message:string;
 * }}
 */
function errorFactoryUtil (propertyKey , propertyValue , message) {
    return {
        key: propertyKey, 
        value: propertyValue,
        message ,
    }
}