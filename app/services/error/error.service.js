const { GLOBAL_NAMES } = require("../registry/names.map");
const { registry:namesRegistry } = require("../registry/names.registry");
const { errorCodeHandlers:multipartErrorHandlers } = require("../request-handlers/form/controller/error.handlers");

class ErrorService {

    /**
     * 
     * @param {string} subjectName 
     * @param {Map<number;(payload:Object)=>void>} handlersMap 
     * @returns 
     */
    addListener (subjectName , handlersMap) {

        this.#errorsListeners.set(subjectName , handlersMap);
    }

    handleError (subjectId , errorCode , payload) {

        console.log('`call handleError`');

        const subjectName = namesRegistry.getNameById(subjectId);
        if(!subjectName) {
            throw new Error(`error-subject by id:${subjectId} is not registered`);
        }
        
        console.log({subjectName});

        const subjectNameHandlers = this.#errorsListeners.get(subjectName);

        if(!subjectNameHandlers) {
            throw new Error(`no error handlers by name:${subjectName}`);
        }

        const errorCodeHandler = subjectNameHandlers.get(errorCode);

        if(!errorCodeHandler) {
            throw new Error(`no handler by code:${errorCode}`);
        }

        errorCodeHandler({code:errorCode , subject:subjectId , message:'' , ...payload});
    }

    #errorsListeners;

    constructor () {
        this.#errorsListeners = new Map() ;
    }
}

const errorService = new ErrorService();

errorService.addListener(GLOBAL_NAMES.MULTIPART_HANDLER , multipartErrorHandlers);

module.exports = { errorService } ;