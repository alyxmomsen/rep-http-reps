// интерфейс для обработчика формы

const { IncomingMessage, ServerResponse } = require("node:http");

class ContentTypeHandlerInterface {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {string} payload 
     */
    async handle (req , res , payload) {
        await this.#strategy(req , res , payload);
    }

    #strategy;

    /**
     * 
     * @param {(req:IncomingMessage, res:ServerResponse, handlerPayloadDataKey:string) => Promise<void>} strategy 
     */
    constructor (strategy) {
        this.#strategy = strategy ;
    }
}

class ContentTypeHandlersRouter {

    /**
     * 
     * @param {string} contentType 
     * @returns 
     */
    getHandlerInterface (contentType) {

        const handler = this.#contentTypeHandlers.get(contentType);
        if(!handler) throw new Error(`no handler for <${contentType}> content-type `);
        return new ContentTypeHandlerInterface(handler);
    }

    registrateContentTypeHandler (contentType , handler ) {
        const c3r = this.#consoleColors ;

        let noConteins = true ;
        for (const [ key , _contentType ] of Object.entries(this.#contentTypes)) {
            if(_contentType === contentType){
                noConteins = false ;
                break;
            }
        }

        if(noConteins) {
            throw new Error(`${c3r.RED}this contentType <${contentType}> is unknown ${c3r.DEFAULT}`);
        }

        if(this.#contentTypeHandlers.has(contentType)) {
            
            throw new Error(`${c3r.RED}this content-type <${contentType}> is alredy registrated${c3r.DEFAULT}`);
        }

        this.#contentTypeHandlers.set(contentType, handler);

        console.log(`${c3r.GREEN}content-type <${contentType}> registrated successfull${c3r.DEFAULT}`);
    }

    #contentTypeHandlers ;
    #contentTypes ;

    #consoleColors;

    constructor () {
        this.#contentTypes = {
            MULTIPART_FORM_DATA:'multipart/form-data' ,
            TEXT_PLAIN:'text/plain' ,
            APPLICATION_X_WWW_FORM_URLENCODED:'application/x-www-form-urlencoded' ,
        }

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

module.exports = { ContentTypeHandlersRouter , ContentTypeHandlerInterface } 