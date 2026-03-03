const { sendFallBack, errorFactory } = require("../../../../utils/error-factory");
const { findSeparatorIndexInBuffer } = require("../../../../utils/find-separator-index-in-buffer.util");
const { dbControllerFactory } = require("../../../database/controller/dbcontroller");
const { errorService } = require("../../../error/error.service");
const { filemanager , CONSTANTS:FILEMANAGER_CONSTANTS } = require("../../../filemanager.service.js/filemanager.service");
const { GroupFormData, dataTypeValidator } = require("../../../group-form-data/group-form-data.service");
const { GLOBAL_NAMES } = require("../../../registry/names.map");
const { registry:namesRegistry } = require("../../../registry/names.registry");

const scriptId = namesRegistry.registrate(GLOBAL_NAMES.MULTIPART_HANDLER);

const CONSTANTS = {
    /* 
    тот самый ключ который сопровождает bundle 
    возвращаемый фабрикой contentTypeHandlerFactory
    он же используется здесь ниже для взятия значения из объекта payload
     */
    PAYLOAD_DATA_KEY:'boundaryRawData' ,
    CURRENT_SCRIPT_ID:scriptId ,
}

console.log('function name' , splitFormDataPart.name)

async function multipartHandler(req , res , payload) {

    console.log('multipart handler...' , {payload});
    
    const { PAYLOAD_DATA_KEY } = CONSTANTS ;

    const boundaryRawString = payload[PAYLOAD_DATA_KEY] || '' ;

    const boundary = (boundaryRawString?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

    console.log({boundary , contentTypePayload: boundaryRawString});

    if(!boundary) {
        sendFallBack(res ,400 , 'multipartHandler' , 'no boundary given' , {boundary , payload , contentTypePayload: boundaryRawString});
        return ;
    }

    const formDataChunks = [] ;
    req.on('data' , async (chunk) => {
        formDataChunks.push(chunk);
    }); 

    req.on('end' , async () => {

        console.log('form processing end');
        
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
                const { name: nameAttr , filename: originalFilename } = parseContentDisposition(contentDisposition);
                const { columnName , groupId , tableName , dataType } = parseNameAttr(nameAttr);

                // scenario #1: if file
                if(mime || originalFilename) {

                    const { success , error } = await filemanager.write(formDataPartBody);

                    if(error) {

                        // здесь нужно выбросить исключение и обработать его в блоке catch
                        // вместо того что бы городить все здесь и ниже

                        // UPD: need a constant for the "custom error" prefix
                        // UPD: custom errors parsed by '; ' delimeter and ": " properties separator
                        // UPD: need a factory for generating error messages, 
                        // and a handler to parse these ready messages. 
                        // Handler must be like a router to handle different cases

                        // после выброса исключения вся группа, вероятно, попадает под инвалидность 
                        // в соответствии с правилами
                        // throwCustomErrorFactory({
                        //     code:5 ,
                        //     subject:'multipartHandler' ,
                        //     message:'filemanager error' ,
                        // })()
                        throw new Error(`filemanager error`);

                        continue ;
                    }

                    if(!success) {
                        // выбрасывается исключение и , вероятно, вся группа попадает под списание
                        // throwCustomErrorFactory({
                        //     code:4 ,
                        //     subject:'multipartHandler' ,
                        //     message:'no filemanager success response object'
                        // });
                        throw new Error(`no filemanager success response object`);
                        continue ;
                    }

                    const { FILENAME } = FILEMANAGER_CONSTANTS.WRITE_SUCCESS_KEYS ;

                    const filesystemFilename = success[FILENAME];

                    if(!filesystemFilename) {
                        // throwCustomErrorFactory({
                        //     code:3, 
                        //     subject:'multipartHandler',
                        //     message:'no filesystemFilename',
                        // })();
                        throw new Error(`no filesystemFilename`);
                        continue ;
                    }

                    /* 
                        bottle-throat
                        "dataTypeValidator" выдаст ошибку если дата-тайп не заригистрирован, 
                        но одна порция данных уже может быть отправленна
                        значит нужно сначал подготовить данные для отпавки
                    */

                    /* подготавливаем данные для отправки */
                    // но нужно обработать ошибку от "dataTypeValidator" , 
                    // для того что бы пометить невалидную группу
                    const fsFilenameBundle = {
                        groupId, tableName, columnName:'filesystemFilename' , 
                        columnContentType:dataTypeValidator('string') , // bottle-throat
                        columnValue:filesystemFilename ,
                    }

                    const originalFilenameBundle = {
                        groupId, tableName , columnName:'originalFilename' ,
                        columnContentType:dataTypeValidator('string') , // bottle-throat
                        columnValue:originalFilename ,
                    }

                    groupFormData.pushParsedInputData(fsFilenameBundle);
                    groupFormData.pushParsedInputData(originalFilenameBundle);

                    // и здесь вроде бы все хорошо, то что данные сначала
                    // формируются и затем отправляются, но 
                    // что если слeдующая порция, для одной и той же группы, будет не валидна, 
                    // тогда, нужно предусмотреть и этот кейс
                    // upd: выше это рализовано но тот код нужно вынести в отдельную ф-ю или сервис
                    
                    continue ;
                }
                
                // scenario #2: if primitive field

                const plainFieldBundle = {
                    groupId , tableName , columnName ,
                    columnValue:formDataPartBody.toString('utf-8') , 
                    columnContentType:dataTypeValidator(dataType) // bottle-throat
                }

                groupFormData.pushParsedInputData(plainFieldBundle);
            }
            catch (e) {
        
                const errorMessage = e.message ;
                console.log({errorMessage  ,e , cs:CONSTANTS.CURRENT_SCRIPT_ID});
                errorService.handleError(CONSTANTS.CURRENT_SCRIPT_ID , 1 , {foo:'bar'});

            }
        }

        const assembledGroupsByTablename = groupFormData.getGroups();

        for (const [tableName , tableRows ] of Object.entries(assembledGroupsByTablename) ) {
            for (const tableRow of tableRows) {
                /* 
                для извлечения ключей нужна модель, 
                которая позволит извлекать 
                значения по корректным ключам, 
                либо нужно что бы в "tableRow" была строка вида "{Object.<string,string|number>}"
                потому что "dbController.addOne(tableRow)" ожидает значения именно такого вида
                for example:
                const {value , contentType} = tableRow[KEY] ;
                ключ "KEY" вероятно должен придти из "dbControllerFactory(tableName)"
                в бандле с "dbController"

                скорее всего нужно что бы "groupFormData.getGroups()" формировал данные
                следущего вида contentType:string|file
                и если это файл, то сопровождаемый полем "mime"
                 
                и поскольку в базу данных мы не отпавляем файлы, то
                вероятно нужно сначала программно выяснить что за тип данных получаем из "tableRow"
                например , если это "video/matroska"|"image/jpeg" , то 
                сначал нужно сохранить данные в файловой системе, получить имя файла и тд
                и сформировав корректные поля отправить их базу данных

                т.е должен быть общий обработчик, который этим занимается, -
                обращается к файловому менеджеру для сохранения файла,
                формирует корректные поля и вызывает "dbControllerFactory(tableName)" 
                */
                console.log({tableRow}) ;

                try {
                    /* 
                    эта фабрика и метод контроллера должны вызываться внутри обработчика 
                    так же как и обращение к файловой системе
                    dbController этим не занимается! разделение ответственности!
                    т.е если файл, по каким-то причинам не удается сохранить, то
                    обращение к базе данных не происходит, в базу данных Buffer не отправляется.
                    */
                    const dbController = dbControllerFactory(tableName);
                    dbController.addOne({foo:'bar' , baz:'foo' , title:'foobarbaz'});
                }
                catch (e) {
                    console.log({e});
                    err
                }

            }
        }

        res.end('hello world');
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

    if(!groupId || !tableName || !columnName || !dataType) {
        // throwCustomErrorFactory({
        //     code:2 ,
        //     message:'incorrect name attr',
        //     subject:'parseNameAttr' ,
        // })()
        errorService.handleError(CONSTANTS.CURRENT_SCRIPT_ID);
        throw new Error(`incorrect name attr`);
    }

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
