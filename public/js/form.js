document.addEventListener('DOMContentLoaded', () => {
    // ============= grab HTML elements =============

    const AppState = {
        foo: 'bar',
    };

    const Middleware = {
        DisplayStatus:DisplayStatusMW,
        ConverResponseToJSON:ConvertResponseToJSONMiddleware,
        FormClose:FormCloseMiddleware,
        FormOpen:FormOpenMiddleware,
    }

    const DOMElements = {
        /**
         * @type {HTMLButtonElement}
         */
        openFormButton: grapDOMElement('controls--video__show-form'),
        /**
         * @type {HTMLButtonElement}
         */
        formModalWindow: grapDOMElement('modal-window--a'),
        /**
         * @type {}
         */
        formCloseButton: grapDOMElement('form--main--close-button'),
        statusDisplay: grapDOMElement('status--upload'),
        mainForm: grapDOMElement('form--main'),
    };

    // ============= set middleware chains ==========

    const MiddlewareChains = {
        openForm: new MiddlewareChain((ctx) =>
            console.log(`open form final handler`)
        ),
        closeForm: new MiddlewareChain((ctx) =>
            console.log(`close form final handler`)
        ),
    };

    // ============= set modal-window-controllers

    const ModalWindowControllers = {
        FormModalWindow: new ModalWindowController({
            containerElement: DOMElements.formModalWindow,
        }),
    };

    // ------------- form open chain ------------

    MiddlewareChains.openForm.addMiddleware(
        Middleware.FormOpen({
            modalWindowController: ModalWindowControllers.FormModalWindow,
        })
    );

    DOMElements.openFormButton.addEventListener('click', async (ev) => {
        new MiddlewareChain(
            Middleware.FormOpen({
                modalWindowController: ModalWindowControllers.FormModalWindow,
            }),
            async (ctx) => {
                console.log('final mw');
            }
        ).execute();
    });

    // ------------ form close chain --------------

    MiddlewareChains.closeForm.addMiddleware(
        Middleware.FormClose({
            modalWindowController: ModalWindowControllers.FormModalWindow,
        })
    );

    DOMElements.formCloseButton.addEventListener('click', async () => {
        await MiddlewareChains.closeForm.execute();
    });

    // ------------- form processing -------------

    // ===============================================

    const RequestManagers = {
        Form: new RequestManager(
            '/api/handle-form',
            'post',
            FormDataRequestFinalHandler({
                onSuccessMiddleware: new MiddlewareChain(
                    (ctx, next) => {
                        DOMElements.statusDisplay.innerText = 'fucka'
                        next();
                    },
                    Middleware.FormClose({
                        modalWindowController:ModalWindowControllers.FormModalWindow,
                    }), (ctx) => {console.log('done')}
                ),
                onFailMiddleware: new MiddlewareChain(
                    Middleware.DisplayStatus({
                        errorDisplayElement: DOMElements.statusDisplay,
                    }),
                    (ctx) => console.log('final')
                ),
            }),
            (ctx) => {
                console.log(`before request final handler`);
            },
        ),
    };

    // ===============================================

    // add middleware
    RequestManagers.Form.addMiddleware(Middleware.ConverResponseToJSON());
    RequestManagers.Form.beforeRequest((ctx, next) => {
        next();
    });

    DOMElements.mainForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(DOMElements.mainForm);
        await RequestManagers.Form.execute(formData);
    });
});

class MiddlewareChain {
    /**
     *
     * @param  {...((ctx:Object, next:(payload:Object) => Promise<any>) => Promise<any>)} middleware
     */
    addMiddleware(...middleware) {
        middleware.forEach((mw) => {
            this.#middleware.push(mw);
        });
    }

    /**
     *
     * @param {((ctx, next) => Pomise<any>)[]} middleware
     */
    async execute(ctx) {
        let index = 0;

        const next = async (nextCtx) => {
            if (index < this.#middleware.length) {
                const currentIndex = index++;

                const handler = this.#middleware[currentIndex];

                if (handler) {
                    await handler(nextCtx, next);
                }
            } else {
                if (this.#finalHandler) {
                    await this.#finalHandler(nextCtx);
                }
            }
        };

        await next(ctx);
    }

    /**
     *
     */
    #middleware;
    #finalHandler;

    constructor(...middleware) {
        if (!middleware) {
            throw new Error(
                `MiddlewareExecutor::constructor: final handler required`
            );
        }

        this.#finalHandler = middleware[middleware.length - 1];
        this.#middleware = middleware.length > 1 ? middleware.slice(0, -1) : [];
    }
}

/**
 *
 * @param  {...((ctx) => Promise<any>)} middleware
 * @returns {}
 */
function MiddlewareDIContainer(deps, ...middleware) {
    return;
}

// middleware

/**
 *
 * @param {Object} deps
 * @param {ModalWindowController} deps.modalWindowController
 * @returns
 */
function FormOpenMiddleware(deps = {}) {
    const modalWindowController = deps.modalWindowController;

    if (!modalWindowController) {
        throw new Error(`FormOpenMiddleware: ModalWindowController required`);
    }

    /**
     *
     * @param {Object} ctx
     * @param {() => Promise<any>} next
     */
    const fn = (ctx, next) => {
        modalWindowController.open();
        next();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {ModalWindowController} deps.modalWindowController
 * @returns {(ctx:Object,next:() => Promise<any>) => Promise<any>}
 */
function FormCloseMiddleware(deps = {}) {
    const modalWindowController = deps.modalWindowController;

    if (!modalWindowController) {
        throw new Error(
            `FormCloseMiddleware: instance of ModalWindowController required`
        );
    }

    /**
     * @type {(ctx, next) => Promise<any>}
     */
    const fn = async (ctx, next) => {
        modalWindowController.close();
        await next();
    };

    return fn;
}

// --------------------------------------

/**
 *
 * @param {Object} deps
 * @param {MiddlewareChain} deps.onSuccessMiddleware
 * @param {MiddlewareChain} deps.onFailMiddleware
 * @returns {(ctx:Object) => Promise<any>}
 */
function FormDataRequestFinalHandler(deps = {}) {
    const onSuccessMiddleware = deps.onSuccessMiddleware;
    const onFailMiddleware = deps.onFailMiddleware;

    if (!onSuccessMiddleware) {
        throw new Error(
            `FormDataRequestFinalHandler: onSuccessMiddleware required`
        );
    }

    if (!onFailMiddleware) {
        throw new Error(
            `FormDataRequestFinalHandler: onFailMiddleware required`
        );
    }

    /**
     *
     * @param {Object} ctx
     * @param {Object} ctx.jsonResponse
     */
    const fn = async (ctx) => {
        const jsonResponse = ctx.jsonResponse;

        console.log({ jsonResponse });

        if (!jsonResponse) {
            await onFailMiddleware.execute();
        }

        await onSuccessMiddleware.execute();
    };

    return fn;
}

/**
 *
 * @returns {(ctx:Object, next:() => Promise<any>) => Promise<any>}
 */
function ConvertResponseToJSONMiddleware() {
    /**
     *
     * @param {Object} ctx
     * @param {() => Promise<any>} next
     */
    const mw = async (ctx, next) => {
        /**
         * @type { Response }
         */
        const response = ctx.response;

        try {
            const json = await response.json();
            ctx.jsonResponses = json;
            next();
        } catch (err) {
            console.log(`ConverResponseToJSONMiddleware/error: `, { json });
        }
    };

    return mw;
}

/**
 *
 * @param {Object} deps
 * @param {HTMLElement} deps.errorDisplayElement
 * @returns {(ctx:Object, next:() => Promise<any>) => Promise<any>}
 */
function DisplayStatusMW(deps = {}) {
    const errorDisplayElement = deps.errorDisplayElement;

    console.log({ hello: deps });

    if (!errorDisplayElement) {
        throw new Error(`DisplayStatusMW: errorDisplayElement required`);
    }

    /**
     * @type {(ctx:Object,next:() => Promise<any>) => Promise<any>}
     */
    const fn = (ctx, next) => {
        errorDisplayElement.innerText = 'foo bar';

        next();
    };

    return fn;
}

// ======================

// /**
//  *
//  * @param {Object} deps
//  * @param {Object} deps.div
//  * @returns {ModalWindowController}
//  */
// function ModalWindowControllerFactory (deps={}) {

//     const mwHTMLElement = deps.div;

//     if(!mwHTMLElement) {
//         throw new Error (`ModalWindowControllerFactory: mwHTMLElement required`);
//     }

//     return new ModalWindowController(mwHTMLElement);
// }

class ModalWindowController {
    open() {
        this._htmlElement.style.display = 'flex';
    }

    close() {
        this._htmlElement.style.display = 'none';
    }

    /**
     * @type { HTMLElement }
     */
    _htmlElement;

    /**
     *
     * @param {Object} deps
     * @param {HTMLDivElement} deps.containerElement
     */
    constructor(deps = {}) {
        const container = deps.containerElement;

        if (!container) {
            throw new Error(
                `ModalWindowController::constructor: container required"`
            );
        }

        this._htmlElement = container;
    }
}

class DisplayStatusController extends ModalWindowController {
    /**
     *
     * @param {string} value
     */
    display(value) {
        this._htmlElement.innerText(value);
    }

    open() {}

    close() {}

    /**
     *
     * @param {Object} deps
     * @param {HTMLElement} deps.HTMLElement
     */
    constructor(deps = {}) {
        super(deps);
    }
}

// utils

/**
 *
 * @param {string} id
 * @returns {HTMLElement}
 */
function grapDOMElement(id) {
    const elem = document.getElementById(id);
    if (!elem) throw new Error(`grapDOMElement: fail`);
    return elem;
}


