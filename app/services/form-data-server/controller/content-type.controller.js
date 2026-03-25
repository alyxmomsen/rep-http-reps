
// const { multipartFormHandler } = require("../../_multipart-parser/controller/controller");
// const { multipartHandler , CONSTANTS:MULTIPART_HANDLER_CONSTANTS } = require("../../_multipart-parser/models/parser");
const { GLOBAL_CONSTANTS } = require("../../../constants/global.constants");
const { multipartFormHandler } = require("../../_multipart-parser/controller/controller");
const { ContentTypeHandlersRouter } = require("../models/content-type.router");

/*
 * данный файл был отнесен к категории контроллеров, 
 * но здесь происходит:
 * 
 * 1. инстанцирование класса ContentTypeHandlersRouter
 * 2. регистрация content-type хандлеров
 * 3. инстанции contentTypeHandlersRouter
 * 
 * в такой архитектуре , при импорте contentTypeHandlersRouter происходит 
 * гарантируемая и контроллируемая регистрация обработчиков в одном файле
 * 
 * можно было бы зарегестрировать каждый хандлер в своем файле, но 
 * тогда бы пришлось, как я это вижу на данный момент,
 * инстанцировать ContentTypeHandlersRouter в своем файле и 
 * экспортировать его инстанцию
 * затем, в каждом отдельном файле конкретного content-type обработчика
 * импортировать ContentTypeHandlersRouter инстанцию 
 * и вызвать метод регистрации хандлера и дальше это как-то организовать
 * но, на момент разработки, я не видел способа как дальше это можно было бы организовать.
 * потребовалась бы другая архитектура для изегания вероятного циклического импорта
 */

const contentTypeHandlersRouter = new ContentTypeHandlersRouter ;

contentTypeHandlersRouter.registrateContentTypeHandler(
    // MULTIPART_HANDLER_CONSTANTS.HTML_FORM_CONTENT_TYPE, multipartHandler ,
    GLOBAL_CONSTANTS.FORM_DATA_CONTENT_TYPES.MULTIPART_FORM_DATA, multipartFormHandler.handle.bind(multipartFormHandler) ,
);

module.exports = { contentTypeHandlersRouter } ;