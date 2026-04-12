document.addEventListener('DOMContentLoaded', () => {
    // ============= grab HTML elements =============

    const AppState = {
        foo: 'bar',
    };

    // =============================================

    const Create = {
        ToolTip: CreateToolTip,
    };

    // ============== REGISTRATE MIDDLEWARE (BEGIN) ==============

    const Middleware = {
        DisplayStatus: DisplayStatusMW,
        ConverResponseToJSON: ConvertResponseToJSONMiddleware,
        FormClose: FormCloseMiddleware,
        FormOpen: FormOpenMiddleware,
        DisplayToolTipsContainer: DisplayTooltipsContainerMW,
        DisplayPlaylist: DisplayPlaylistMiddleWare,
    };

    const FinalHandlers = {
        OnFormResponse: FormDataRequestFinalHandler,
    };

    // ============== REGISTRATE MIDDLEWARE (END) ==============

    const DOMElements = {
        /**
         * @type {HTMLButtonElement}
         */
        OpenFormButton: grabDOMElement('controls--video__show-form'),
        /**
         * @type {HTMLButtonElement}
         */
        FormModalWindow: grabDOMElement('modal-window--a'),
        /**
         * @type {}
         */
        FormCloseButton: grabDOMElement('form--main--close-button'),
        StatusDisplay: grabDOMElement('status--upload'),
        MainForm: grabDOMElement('form--main'),
        ToolTipsContainer: grabDOMElement('modal-window--b'),
        PlayList: grabDOMElement(`playlist--video`),
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
            containerElement: DOMElements.FormModalWindow,
        }),
    };

    // ------------- form open chain ------------

    MiddlewareChains.openForm.addMiddleware(
        Middleware.FormOpen({
            modalWindowController: ModalWindowControllers.FormModalWindow,
        })
    );

    DOMElements.OpenFormButton.addEventListener('click', async (ev) => {
        new MiddlewareChain(
            Middleware.FormOpen({
                modalWindowController: ModalWindowControllers.FormModalWindow,
            }),
            Middleware.DisplayToolTipsContainer({
                // flicker: {},
                toolTipContainerHTMLElement: DOMElements.ToolTipsContainer,
            }),
            async (ctx) => {
                console.log('final mw');
            }
        ).execute();

        Create.ToolTip({
            targetContainer: DOMElements.ToolTipsContainer,
        })('u just opened the form');
    });

    // ------------ form close chain --------------

    MiddlewareChains.closeForm.addMiddleware(
        Middleware.FormClose({
            modalWindowController: ModalWindowControllers.FormModalWindow,
        }),
        Middleware.DisplayToolTipsContainer({
            // flicker: {},
            toolTipContainerHTMLElement: DOMElements.ToolTipsContainer,
        })
    );

    DOMElements.FormCloseButton.addEventListener('click', async () => {
        await MiddlewareChains.closeForm.execute();
        Create.ToolTip({
            targetContainer: DOMElements.ToolTipsContainer,
        })('u just closed the form');
    });

    // ------------- form processing -------------

    // ============== REGISTRATE REQUEST MANAGERS (BEGIN) ==============

    const RequestManagers = {
        Form: new RequestManager(
            '/api/handle-form',
            'post',
            FinalHandlers.OnFormResponse({
                onSuccessMiddleware: new MiddlewareChain(
                    (ctx, next) => {
                        console.log('firs mw', { ctx });
                        DOMElements.StatusDisplay.innerText = 'done';
                        next();
                    },
                    Middleware.FormClose({
                        modalWindowController:
                            ModalWindowControllers.FormModalWindow,
                    }),
                    Middleware.DisplayPlaylist({
                        playlistModalWindow: DOMElements.PlayList,
                    }),
                    (ctx) => {
                        /** final mw */
                        Create.ToolTip({
                            targetContainer: DOMElements.ToolTipsContainer,
                        })('SUCCESS');
                        console.log('done', { ctx });
                    }
                ),
                onFailMiddleware: new MiddlewareChain(
                    Middleware.DisplayStatus({
                        errorDisplayElement: DOMElements.StatusDisplay,
                    }),
                    // (ctx, next) => {
                    //     document.inner
                    // },
                    (ctx) => console.log('final')
                ),
                playlistHTMLElement: DOMElements.PlayList,
            }),
            (ctx) => {
                console.log(`before request final handler`);
            }
        ),
    };

    // ============== REGISTRATE REQUEST MANAGERS (END) ==============

    // add middleware
    RequestManagers.Form.addMiddleware(Middleware.ConverResponseToJSON());
    RequestManagers.Form.beforeRequest((ctx, next) => {
        DOMElements.StatusDisplay.innerText = 'data send process...';
        next();
    });

    DOMElements.MainForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(DOMElements.MainForm);
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

        const next = async () => {
            if (index < this.#middleware.length) {
                const currentIndex = index++;

                const handler = this.#middleware[currentIndex];

                if (handler) {
                    await handler(ctx, next);
                }
            } else {
                if (this.#finalHandler) {
                    await this.#finalHandler(ctx);
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
        console.log('second mw', { ctx });
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
 * @param {HTMLElement} deps.playlistHTMLElement
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

    if (!deps.playlistHTMLElement) {
        throw new Error(
            `FormDataRequestFinalHandler: playlistHTMLElement required`
        );
    }

    /**
     *
     * @param {Object} ctx
     * @param {Object} ctx.jsonResponse
     */
    const fn = async (ctx) => {
        // const jsonResponse = ctx.jsonResponse;

        console.log({ ctx });

        if (!ctx.jsonResponse) {
            await onFailMiddleware.execute(ctx);
            return;
        }

        await onSuccessMiddleware.execute(ctx);

        const DBTables = {
            'video-playlist': () => {},
            users: () => {},
        };

        if (ctx.jsonResponse.success) {
            if (ctx.jsonResponse.success.clientResponsePull) {
                if (ctx.jsonResponse.success.clientResponsePull.success) {
                    for (const dbROw of ctx.jsonResponse.success
                        .clientResponsePull.success) {
                        dbROw.tableName;
                    }
                }
            }
        }

        deps.playlistHTMLElement;
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
            ctx.jsonResponse = json;
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
function grabDOMElement(id) {
    const elem = document.getElementById(id);
    if (!elem) throw new Error(`grapDOMElement: fail`);
    return elem;
}

/**
 *
 * @param {Object} deps
 * @param {HTMLElement} deps.toolTipContainerHTMLElement
 * @returns
 */
function DisplayTooltipsContainerMW(deps = {}) {
    if (!deps.toolTipContainerHTMLElement) {
        throw new Error(
            `DisplayTooltipsContainerMW: toolTipContainerHTMLElement required`
        );
    }

    // const flicker = deps.flicker;

    // if (!flicker) {
    //     throw new Error(
    //         `DisplayTooltipsContainer: ModalWindowController required`
    //     );
    // }

    const fn = (ctx, next) => {
        deps.toolTipContainerHTMLElement.style = 'display:flex;right:0';
        next();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {HTMLDivElement} deps.playlistModalWindow
 * @returns {(ctx:Object,next:() => Promise<any>) => Promise<any>}
 */
function DisplayPlaylistMiddleWare(deps = {}) {
    if (!deps.playlistModalWindow) {
        throw new Error(
            `DisplayPlaylistMiddleWare: playlistModalWindow required`
        );
    }

    /**
     *
     * @param {Object} ctx
     * @param {() => Promise<any>} next
     */
    const fn = (ctx, next) => {
        deps.playlistModalWindow.style.display = 'flex';

        next();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {HTMLDivElement} deps.targetContainer
 * @returns
 */
function CreateToolTip(deps = {}) {
    if (!deps.targetContainer) {
        throw new Error(`CreateToolTip: targetContainer required`);
    }

    let timeout = Infinity;

    /**
     *
     * @param {string} text
     */
    const fn = (text) => {
        const div = document.createElement('div');

        div.className = 'tool-tip--added-data-response';

        div.innerText = text;

        timeout = setTimeout(() => {
            div.remove();
        }, 3000);

        div.addEventListener('mouseover', () => {
            console.log('over');
            if (timeout !== Infinity) {
                clearTimeout(timeout);
            }
        });

        div.addEventListener('mouseleave', () => {
            console.log('over');
            if (timeout !== Infinity) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(() => div.remove(), 3000);
        });

        deps.targetContainer.appendChild(div);
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @returns
 */
function UpdatePlaylistMW(deps = {}) {
    const mw = (ctx, next) => {};

    return mw;
}

class Flicker {
    flick() {}

    /**
     * @type {Object}
     */
    #currentState;
    /**
     * @type {HTMLElement}
     */
    #targetElement;

    /**
     *
     * @param {{
     *  stateA:Object;
     *  stateB:Object;
     * }} deps
     */
    #states;

    /**
     *
     * @param {{
     *  stateA:Object;
     *  stateB:Object;
     *  targetElement:HTMLElement
     * }} deps
     */
    constructor(deps = {}) {
        const HTMLElement = deps.targetElement;
        const stateA = deps.stateA;
        const stateB = deps.stateB;

        if (!HTMLElement) {
            throw new Error(`Flicker::constructor: HTMLElement required`);
        }

        if (!deps.stateA || !deps.stateB) {
            throw new Error(`Flicker::constructor: states required`);
        }

        this.#states = {
            stateA,
            stateB,
        };

        this.#targetElement = HTMLElement;
    }
}
