const { IncomingMessage, ServerResponse } = require("node:http");
const { sendFallBack, errorFactory } = require("../../../../utils/error-factory");
const { findSeparatorIndexInBuffer } = require("../../../../utils/find-separator-index-in-buffer.util");
const { dbControllerFactory } = require("../../../database/controller/dbcontroller");
// const { errorService } = require("../../../error/error.service");
const { filemanager , CONSTANTS:FILEMANAGER_CONSTANTS } = require("../../../filemanager.service.js/filemanager.service");
const { GroupFormData, dataTypeValidator } = require("../../../group-form-data/group-form-data.service");
// const { GLOBAL_NAMES } = require("../../../registry/names.map");
// const { registry:namesRegistry } = require("../../../registry/names.registry");

// const scriptId = namesRegistry.registrate(GLOBAL_NAMES.MULTIPART_HANDLER);

const CONSTANTS = {
    /* 
    тот самый ключ который сопровождает bundle 
    возвращаемый фабрикой contentTypeHandlerFactory
    он же используется здесь ниже для взятия значения из объекта payload
     */
    PAYLOAD_DATA_KEY:'boundaryRawData' ,
    // CURRENT_SCRIPT_ID:scriptId ,
    FORM_CONTENT_TYPE:'multipart/form-data' , // for the form-handler routing
}

if(!CONSTANTS) {
    throw new Error(`no constant "CONSTANTS" provided`);
}

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @param {Object.<string,any>} payload 
 * @returns 
 */
async function multipartHandler(req , res , payload) {

    console.log('multipart handler...' , {payload});
    
    const { PAYLOAD_DATA_KEY } = CONSTANTS ;

    if(!PAYLOAD_DATA_KEY) {
        throw new Error(`no PAYLOAD_DATA_KEY constant as it required`);
    }

    const boundaryRawString = payload[PAYLOAD_DATA_KEY] || '' ;

    if(!boundaryRawString) {
        throw new Error(`no boundary row string`);
    }

    const boundary = (boundaryRawString?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

    if(!boundary) {
        sendFallBack(res ,400 , 'multipartHandler' , 'no boundary given' , {boundary , payload , contentTypePayload: boundaryRawString});
        return ;
    }

    const formDataChunks = [] ;
    let formDataSize = 0 ;
    req.on("data" , async (chunk) => {
        formDataSize += chunk.length ;
        formDataChunks.push(chunk);
    }); 

    req.on('end' , async () => {
        
        console.log(`form chunks received`);
        
        const wholeFormDataBuffer = Buffer.concat(formDataChunks);
        const parts = splitFormData(wholeFormDataBuffer , Buffer.from(`--${boundary}`));
        const groupFormData = new GroupFormData();

        const invalidGroups = new Map();

        for (const part of parts) {
            try {
                const { 
                    body:formDataPartBody , headers:formDataPartHeadersRawData 
                } = splitFormDataPart(part);
                const formDataPartHeaders = parseFormDataPartHeaders(
                    formDataPartHeadersRawData.toString('utf-8')
                );
                const mime = formDataPartHeaders['content-type'] || null ;
                const contentDisposition = formDataPartHeaders['content-disposition'] || null ;
                if(!contentDisposition) {
                    // throwCustomErrorFactory({
                    //     code:2 ,
                    //     subject:'multipartHandler' ,
                    //     message:'no content-disposition header' ,
                    // })()
                    throw new Error(`no content-disposition header`);
                }
                const { name: nameAttr , filename: filename } = parseContentDisposition(contentDisposition);
                const { columnName , groupId , tableName , dataType } = parseNameAttr(nameAttr);

                const GROUP_NAMES = {
                    FILE:'file' ,
                    PLAIN_FIELD:'field' ,
                }

                // scenario #1: if file
                if(mime || filename) {

                    const fileData = {
                        groupId, tableName,
                        data: {
                            fileBody:formDataPartBody ,
                            mime ,
                            filename ,
                        }
                    }

                    groupFormData.pushFileData(fileData);

                    continue ;
                }
                
                // scenario #2: if primitive field

                const plainData = {
                    groupId, tableName,
                    data: {
                        columnName ,
                        columnDataType:dataType ,
                        columnValue: formDataPartBody
                    }
                }

                groupFormData.pushPlainFileldData(plainData);

            }
            catch (e) {
        
                const errorMessage = e.message ;
                console.log({errorMessage  ,e , cs:CONSTANTS.CURRENT_SCRIPT_ID});
                // errorService.handleError(CONSTANTS.CURRENT_SCRIPT_ID , 1 , {foo:'bar'});
                

            }
        }
        
        const addedRowsData = [] ;
        /* получаем все сформированые группы для сторринга в БД */
        const assembledGroupsByTablename = groupFormData.getGroups(); // need extractor strategy
        for (const [ tableName , { files , rows } ] of Object.entries(assembledGroupsByTablename)) {

            console.log('tablename: ' , tableName);

            /* в этот объект падают данные для колонок таблицы БД 
            "Key" название колонки, "Value" - содержимое 
            */
            const normalizedColumns  = {} ;

            /* файлы */
            for (const fileData of files) {
                console.log({fileData});

                const { mime , fileName  , fileBody } = fileData ;
                /* пробуем сохранять файл в файловую систему
                по-умолчанию папка "/uploads" в корне проекта */
                const { error , success } = await filemanager.write(fileBody);

                /* неудача */
                if(error) {
                    throw new Error(`filemanager error` , JSON.stringify(error));
                }
                
                /* техническая ошибка, по-какой-то причине не вернулся объект "success" */
                if(!success) {
                    throw new Error(`filemanager error: no success` , JSON.stringify({success , error}));
                }

                /* получаем filename, - название файла в ФС, в виде хэша */
                const { filename:fmFilename } = success ;

                // сохраняем колонки
                normalizedColumns['filesistemFilename'] = fmFilename ;
                normalizedColumns['mime'] = mime ;
                normalizedColumns['originalFilename'] = fileName ;
            }

            /* сохраняем обычные инпуты */
            for (const [ columnName , column ] of Object.entries(rows)) {
                // console.log({columnName  ,column});
                const { data:columnData } = column ;
                normalizedColumns[columnName] = columnData.toString('utf-8') ;
            }
            
            // получаем контроллер для работы с базой данных, 
            // передаем имя модели, которое совпадает с ключом Мэпа,
            //  в котором хранятся модели конроллеров
            const dbController = dbControllerFactory(tableName);
            const rowId = dbController.addOne( tableName, normalizedColumns);

            dbController.readOne('123' , '123');

            addedRowsData.push({
                rowId , row:normalizedColumns ,
            });

            console.log({addedRowsData});
        }


        res.writeHead(200 , 'ok' , {
            'content-type':'application/json' ,
        });
        res.end(JSON.stringify(addedRowsData));
    });

}

module.exports = { multipartHandler , CONSTANTS }

function insertIvalidGroupData () {
    
}

/**
 * 
 * @param {string} nameAttr 
 * @returns {{
 *  groupId:string;
 *  tableName:string;
 *  columnName:string;
 *  dataType:string;
 * }}
 */
function parseNameAttr (nameAttr) {

    const [ groupId , tableName , columnName , dataType ] = nameAttr.split('.') ;

    return {
        groupId, tableName, columnName , dataType ,
    }
}


/**
 * 
 * @param {string} contentDisposition 
 * @returns {{name:string|null;filename:string|null}}
 */
function parseContentDisposition ( contentDisposition ) {

    const name = contentDisposition.match(/name="([^"]+)"/)?.[1] || null;
    const filename = contentDisposition.match(/filename="([^"]+)"/)?.[1] || null;

    return {
        name , 
        filename ,
    }
}

/**
 * 
 * @param {string} headersString 
 */
function parseFormDataPartHeaders (headersString) {

    const headers = {} ;

    const headersRows = headersString.split('\r\n');
    headersRows.forEach(headerRow => {
        const [key , value] = headerRow.split(": ");
        if(key && value) {
            const normalizedKey = key.toLocaleLowerCase() ;
            headers[normalizedKey] = value ;
        }
    });

    return headers ;

}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 */
function splitFormDataPart (formDataPart) {

    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = findSeparatorIndexInBuffer(formDataPart , separatorBuffer);

    if(separatorIndex === -1) {
        // const errorBody = {
        //     subject:'multipartHandler' ,
        //     code:1,
        //     message:'incorrect form data part',
        // }
        // throwCustomErrorFactory(errorBody)()
        throw new Error(`incorrect form data part`);
    }

    /**
     * extract first part as Headers Part
     */
    const headers = formDataPart.subarray(0 , separatorIndex);

    let bodyBuffeEndIndex = formDataPart.length ;

    if(
        formDataPart[bodyBuffeEndIndex - 2] === 0x0d // "\r" esc
        && formDataPart[bodyBuffeEndIndex - 1] === 0x0a // "\n" esc
    ) {
        bodyBuffeEndIndex -= 2 // shift the index to left
    }

    const body = formDataPart.subarray(separatorIndex + separatorBuffer.length , bodyBuffeEndIndex);

    return {
        headers ,
        body ,
    }
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formData 
 * @param {Buffer<ArrayBuffer>} boundary 
 * @returns {Array<Buffer<ArrayBuffer>>}
 */
function splitFormData (formData , boundary) {

    const parts = [] ;
    let start = 0
    let index = 0 ;

    while ((index = findSeparatorIndexInBuffer(formData , boundary , start)) !== -1) {
        const part = formData.subarray(start , index) ;
        parts.push(part);
        start = index + boundary.length ;
        if(
            formData[start] === 0x0d // \r 
            && formData[start + 1] === 0x0a // \n
        ) start += 2 ;
    }

    parts.push(formData.subarray(start)); // rest part

    return parts ;
}
