// интерфейс для обработчика формы

const { IncomingMessage, ServerResponse } = require("node:http");

class ContentTypeHandlerController {

    on (event , handler) {

    }

    #executeListeners () {
        for (const [key, value] of this.#listeners.entries()) {
            console.log();
        }
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {string} [payload] 
     * @returns {Promise<Object.<string,any>>}
     */
    async handle(req, res, payload) {
        const result = await this.#strategy(req, res, payload);
        return result;
    }

    #listeners;
    #strategy;

    /**
     * 
     * @param {(req:IncomingMessage, res:ServerResponse, handlerPayloadDataKey?:string) => Promise<Object.<string,any>>} strategy 
     */
    constructor (strategy) {
        this.#strategy = strategy ;
        this.#listeners = new Map;
    }
}

class ContentTypeHandlersRouter {

    /**
     * 
     * @description this is a factory that create controller
     * @param {string} contentType 
     * @returns 
     */
    getHandlerController (contentType) {

        const handler = this.#contentTypeHandlers.get(contentType);
        if(!handler) throw new Error(`no handler for <${contentType}> content-type `);
        return new ContentTypeHandlerController(handler);
    }

    /**
     * 
     * @param {string} contentType 
     * @param {(req:IncomingMessage, res:ServerResponse ,payload?:string) => void} handler 
     * @returns {void}
     */
    registrateContentTypeHandler (contentType , handler ) {
        const c3r = this.#consoleColors ;

        /*
            проверяем соотвествует ли content-type строка 
            одному из зарегестрированных content-type значений
            и если соотвоетствует <noConteins = false> , то регистрируем
            новый обработчик для <ContentType> 
            в противном случае выбрасывается 
        */
        let noConteins = true ;
        for (const [ key , _contentType ] of Object.entries(ContentTypeHandlersRouter.contentTypes)) {
            if(_contentType === contentType){
                noConteins = false ;
                break;
            }
        }
        if(noConteins) {
            throw new Error(`${c3r.RED}this contentType <${contentType}> is unknown ${c3r.DEFAULT}`);
        }

        /* проверяем,- если для <contentType> уже зарегестрирован обработчик 
        выбрасываем исключение*/
        if(this.#contentTypeHandlers.has(contentType)) {
            throw new Error(`${c3r.RED}this content-type <${contentType}> is alredy registrated${c3r.DEFAULT}`);
        }

        /* если все проверки пройдены, регистрируем content-type обработчик  */
        this.#contentTypeHandlers.set(contentType, handler);

        /* логирование успешной транзакции */
        console.log(`${c3r.GREEN}content-type <${contentType}> registrated successfull${c3r.DEFAULT}`);
    }

    /**
     * @type Map<string,(req:IncomingMessage, res:ServerResponse ,payload?:string) => void>
     */
    #contentTypeHandlers ;

    /** 
     * keeps approved content-types. 
     * метод "registrateContentTypeHandler" добавляет обработчики только для этих content-types
     * @type {Object.<string,string>}
    */
    static contentTypes = {
        MULTIPART_FORM_DATA:'multipart/form-data' ,
        TEXT_PLAIN:'text/plain' ,
        APPLICATION_X_WWW_FORM_URLENCODED:'application/x-www-form-urlencoded' ,
    }

    /** 
     * коды цветов для работы с последовательностью типа "\x1b[0m"
     * @private
    */
    #consoleColors;

    constructor () {

        this.#consoleColors = new Map();

        /**
         * 
         * @param {number|string} code 
         * @returns 
         */
        const generateConsoleColorByCode = (code) => `\x1b[${code}m` ;

        this.#consoleColors = {
            GRAY:generateConsoleColorByCode(30),
            RED:generateConsoleColorByCode(31),
            GREEN:generateConsoleColorByCode(32),
            YELLOW:generateConsoleColorByCode(33),
            DEFAULT:generateConsoleColorByCode(0),
        }

        this.#contentTypeHandlers = new Map ;

    }
}

/**
 * 
 */
module.exports = { ContentTypeHandlersRouter, ContentTypeHandlerController } 