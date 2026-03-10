/* стандартный(-е) модуль(-и) */
const { IncomingMessage, ServerResponse } = require("node:http");
/* кастомная утилита для отправки фолл-беков */
const { sendFallBack } = require("../../../utils/error-factory");
/* кастомная утилита для поиска индекса расположения байтовой последовательности в целевой байтовой последовательности */
const { findSeparatorIndexInBuffer } = require("../../../utils/find-separator-index-in-buffer.util");
/* фабрика генерирует контроллер базы данных с конкретной моделью валидации полей  */
const { dbControllerFactory } = require("../../database/controller/dbcontroller");
/* начинал реализацию централизованой системы обработки ошибок, но отложил разработку
оставил это здесь что-бы напоминало*/
// const { errorService } = require("../../../error/error.service");
const { filemanager } = require("../../filemanager.service.js/filemanager.service");
const { MultiTableGrouppingAgent } = require("../services/multi-table-gruping-agent/multi-table-gruping-agent");
// const { GLOBAL_NAMES } = require("../../../registry/names.map");
// const { registry:namesRegistry } = require("../../../registry/names.registry");
// const scriptId = namesRegistry.registrate(GLOBAL_NAMES.MULTIPART_HANDLER);

const CONSTANTS = {
    PAYLOAD_DATA_KEY:'boundaryRawData' ,
    /* это поле предназначалось для централизованной системы обработки ошибок,
    в той архитектуре нужно было учитывать идентификатор скрипта
    сейчас это пока что здесь, дожидается дальнейшей разработки */
    // CURRENT_SCRIPT_ID:scriptId ,
    HTML_FORM_CONTENT_TYPE:'multipart/form-data' , // for the form-handler routing
}

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @param {Object.<string,any>} payload 
 * @returns {{error:any;success:any}}
 */
async function multipartHandler(req , res , payload) {

    if(!payload) {
        throw new Error(`no payload`);
    }

    /* получаем boundary по простому регулярному выражению */
    /**
     * @type {string}
     */
    const boundary = (payload?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

    if(!boundary) {
        sendFallBack(res ,400 , 'multipartHandler' , 'no boundary given' , {boundary , payload , contentTypePayload: boundaryRawString});
        return ;
    }

    /**
     * @type {Buffer<ArrayBuffer>[]}
     */
    const formDataChunks = [];
    
    /**
     * переменная для контролля размера полученных данных
     * @type {number}
     */
    let formDataSize = 0 ;
    req.on("data" , async (chunk) => {
        formDataSize += chunk.length ;
        formDataChunks.push(chunk);
    }); 

    req.on('end' , async () => {
        
        console.log(`form chunks received`);
        /* объеденяем все полученые Buffer chunks в один монолит */
        const wholeFormDataBuffer = Buffer.concat(formDataChunks);
        /* разбиваем перманентный буффер на логические куски, где 
        каждый кусок есть данные одного HTML тега "input" */
        const parts = splitFormData(wholeFormDataBuffer , Buffer.from(`--${boundary}`));
        /* инстанцируем объект сборщика групп
        который занимается объединением отдельных данных из HTML инпутов в семантические группы
        где каждую группу объеденяет предназначение к одной конкретной таблице базы данных*/
        const multiTableGrouppingAgent = new MultiTableGrouppingAgent();

        /* здесь должны быть группы не прошедшие валидацию по той или иной причине
        предполагается эти группы обработать и отправить отчет на клиент,
        например для информирования пользователя для дальнейшей корректировки вводимых данных 
        пока что это здесь с целью напоминания, дожидается дальнейшей разработки*/
        const invalidGroups = new Map();

        const parsedFormDataParts = [];

        for (const part of parts) {
            try {
                /* полный парсинг данных одного инпута 
                на выходе получаем 7 семантически различных типов данных
                body: содержимое инпута введеное пользователем,в т.ч файл, в виде Buffer<ArrayBuffer>
                parsedNameAttribute это данные аттрибута "name" HTML тега, при этом парсинг реализуется по
                , пока-что, одной стратегии*/
                const { 
                    body:formDataPartBody , contentType: fileMIME , filename: fileName , name:nameAttr
                } = parseFormDataPart(part);

                /**
                 * 
                 * @param {string} nameAttr 
                 * @returns {{protocolName:string;data:string}}
                 */
                const extractProtocolName = (nameAttr) => {
                    const [a , b] = nameAttr.split(/:\/\/\s*/);
                    console.log({nameAttr, a,b});
                    if(b) {
                        return {
                            protocolName:a,
                            data:b,
                        }
                    }

                    return {
                        protocolName:'',
                        data:a,
                    }
                }

                const { protocolName, data } = extractProtocolName(nameAttr);

                console.log({protocol:protocolName});

                /* controller */
                const handlerDataMap = new Map();
                const groupDataHandler = handlerDataMap.get(protocolName);
                if(!groupDataHandler && false) {
                    throw new Error(`unknown data handling protocol`);
                }

                /* routed by protocolname */
                multiTableGrouppingAgent.handleFormDataPartParsedData({
                    body:formDataPartBody, contentType:fileMIME, filename:fileName, name:data,
                });

                continue;
            }
            catch (e) {
                /* исключения пока никак не обрабатываются */
                const errorMessage = e.message ;
                console.log({errorMessage  ,e , cs:CONSTANTS.CURRENT_SCRIPT_ID});
            }
        }
        
        /**
         * массив данных для отправки на клиент
         */
        const addedRowsData = [] ;
        /* получаем все сформированые группы для сторринга в БД 
        предполагается что метод groupFormData.getGroups() будет возвращать различные форматы данных
        в зависимости от выбранной стратегии
        пока что стратегия одна: возращает объект где каждое поле это один-в-один(! может быть узким местом) название целевой таблицы БД*/
        const assembledGroupsByTablename = multiTableGrouppingAgent.getGroups(); // need extractor strategy
        for (const [ tableName , groups ] of Object.entries(assembledGroupsByTablename)) {

            for (const group of groups) {
                /**
                 * @description в этот объект падают данные для колонок таблицы БД, где
                 * "Key" название колонки, "Value" - содержимое 
                 * @type {Object.<string,string>}
                 */
                const normalizedColumns  = {} ;
                const normalizedFilesData = {} ;
                
                /* предполагается что применяется конкретная стратегия , где 
                группа содержит по-меньшей мере два поля 
                [files]:Object[] (данные инпутов файлов) и [rows]:Object.<string,any> (обычные инпуты)
                */
                const { files , rows } = group ;

                for (const fileData of files) {
                    
                    const { mime , fileName  , fileBody , columnName } = fileData ;

                    /* пробуем сохранять файл в файловую систему
                    по-умолчанию папка "/uploads" в корне проекта */
                    const { error , success } = await filemanager.write(fileBody);
                    // console.log({fileData , success , error});

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
    
                    /* БД сохраняется не сам файл , а лишь информация о нем 
                    1. filesistemFilename: имя в файловой системе, 
                    по которому, в дальнейшем, будет осуществляться его поиск
                    2. mime файла: для работы с файлом в дальнейшем
                    3. originalFilename: имя файла на машине пользователя

                    и поскольку для одной строки таблицы может прилететь сразу несколько файлов, то
                    каждая группа (filesistemFilename ,mime ,originalFilename) колонок строки 
                    должна иметь уникальный префикс. здесь префиксом выступает  [columnName]
                    благодаря чему, если потребуется, в одну строку можно записать данные о нескольких файлах
                    */
                    normalizedColumns[`${columnName}/filesistemFilename`] = fmFilename ;
                    normalizedColumns[`${columnName}/mime`] = mime ;
                    normalizedColumns[`${columnName}/originalFilename`] = fileName ;
                }

                /* логирование для отладки на момент разработки */
                for (const [ k , v ] of Object.entries(normalizedColumns)) {
                    console.log({k,v});
                }
    
                /* сохраняем обычные инпуты */
                for (const [ columnName , column ] of Object.entries(rows)) {

                    // console.log({columnName  ,column});
                    const { data:columnData } = column ;
                    normalizedColumns[columnName] = columnData.toString('utf-8') ;
                }
            
                
                /* получаем контроллер для работы с базой данных, - 
                в фабрику контроллеров передаем имя модели, 
                которое посимвольно совпадает с ключом Map,
                в котором хранятся модели конроллеров представленные функциями */
                /* в случае неудачи фабрика выбрасывает исключение */
                try {

                    const dbController = dbControllerFactory(tableName);
                    
                    const rowId = dbController.addOne( tableName, normalizedColumns);
        
                    /* тестовая проверка наличия данных в кастомной БД 
                    ключи не важны, на любые аргументы метод возвращает всю БД*/
                    dbController.readAll('foo bar'); 
        
                    /* нужна фабрика для корректного пушинга */
                    addedRowsData.push({
                        rowId , row:normalizedColumns , tableName
                    });
                }
                catch (e) {
                    /* отсутствует обработка ошибок */
                    /* как я уже упоминал, предполается единый сервис для обработки ошибок,
                    который пока что в разработке , так что пока тупо console.log()*/
                    console.log({e});
                }
            }

        }

        console.log(addedRowsData);

        res.writeHead(200 , 'ok' , {
            'content-type':'application/json' ,
        });
        res.end(JSON.stringify(addedRowsData));
    });

    req.on('error' , (err) => {
        console.log('errror errror' , {err})
    })

}

module.exports = { multipartHandler , CONSTANTS }

function insertIvalidGroupData () {
    
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 * @returns {{
 *  body:Buffer<ArrayBuffer>;
 *  contentType:string|null;
 *  filename:string|null;
 *  name:string;
 * }}
 */
function parseFormDataPart (formDataPart) {
    const { 
        body , headers:formDataPartHeadersRawData 
    } = splitFormDataPart(formDataPart);
    const formDataPartHeaders = parseFormDataPartHeaders(
        formDataPartHeadersRawData.toString('utf-8')
    );
    const contentType = formDataPartHeaders['content-type'] || null ;
    const contentDisposition = formDataPartHeaders['content-disposition'] || null ;
    if(!contentDisposition) {
        throw new Error(`no content-disposition header`);
    }
    const { name: name , filename: filename } = parseContentDisposition(contentDisposition);
    
    return {
        body ,
        contentType ,
        filename: filename,
        name: name,
    }
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
