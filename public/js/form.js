document.addEventListener('DOMContentLoaded', () => {
    // ============= grab HTML elements =============

    const AppState = {
        Playlist: {
            Timeouts: {
                HidePlaylist: {
                    hide: Infinity,
                },
            },
        },
    };

    // =============================================

    const Create = {
        ToolTip: CreateToolTip,
        PlaylistItem: CreatePlaylistItem,
    };

    // ============== REGISTRATE MIDDLEWARE (BEGIN) ==============

    const Middleware = {
        DisplayStatus: DisplayStatusMW,
        ConverResponseToJSON: ConvertResponseToJSONMiddleware,
        FormClose: FormCloseMiddleware,
        FormOpen: FormOpenMiddleware,
        DisplayToolTipsContainer: DisplayTooltipsContainerMW,
        ShowPlaylist: ShowPlaylistMiddleWare,
        PlayVideo: PlayVideoMW,
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
        ControlsModalWindow: grabDOMElement('controls--video'),
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
        VideoPlayer: grabDOMElement(`video--main`),
    };

    const DOMEElementsControllersBehaviors = {
        Controlls: () =>
            new HTMLElementControllerBehaviors({
                hide: () => {
                    console.log(`Controlls hide beh`);
                },
                show: () => {
                    console.log(`Controlls show beh`);
                },
            }),
        Playlist: () =>
            new HTMLElementControllerBehaviors({
                /**
                 *
                 * @param {{
                 *  baseHTML: HTMLElement;
                 *  timeoutsMap: Map<string,Object>,
                 *  options:{
                 *   rollBackImplementation:() => Promise<any>;
                 *   rollBackTimeOut:number;
                 *  };
                 *  callerFnName;
                 * }} ctx
                 */
                show: (ctx = {}) => {
                    console.log(`Playlist show beh`);

                    const {
                        baseHTML,
                        options /* : { rollBackImplementation, rollBackTimeOut } */,
                        timeoutsMap,
                    } = ctx;

                    const RollBack = {
                        Implementation:
                            ctx.options
                                .rollBackImplementation /* || ((f) => f) */,
                        timeoutDuration: ctx.options.rollBackTimeOut /* || 0 */,
                    };

                    const clientId = ctx.callerFnName;

                    ctx.baseHTML.style.display = 'flex';
                    ctx.baseHTML.style.animation =
                        'ShowPlayList .2s ease-out 0s 1 forwards';

                    const Timeout = ctx.timeoutsMap.get(clientId);

                    if (Timeout && Timeout.Id !== Infinity) {
                        clearTimeout(Timeout.Id);
                    }

                    ctx.timeoutsMap.set(clientId, {
                        Id: setTimeout(
                            RollBack.Implementation,
                            RollBack.timeoutDuration
                        ),
                        handler: RollBack.Implementation,
                        duration: RollBack.timeoutDuration,
                    });

                    console.log({ timeoouts: ctx.timeoutsMap });
                },
                hide: (ctx) => {
                    ctx.baseHTML.style.animation =
                        'HidePlaylist .2s ease-out 0s 1 forwards';
                    ctx.baseHTML.onanimationend = () => {};
                },
            }),
    };

    // --------------------------------------------
    const DOMEElementsControllers = {
        Playlist: HTMLElementController.Instance({
            HTMLElement: DOMElements.PlayList,
            behaviors: DOMEElementsControllersBehaviors.Playlist(),
        }),
        Controlls: HTMLElementController.Instance({
            HTMLElement: DOMElements.ControlsModalWindow,
            behaviors: DOMEElementsControllersBehaviors.Controlls(),
        }),
    };

    const Utils = {
        TimeoutController: TimeoutController.Instance,
    };

    // ============= set middleware chains ==========

    const MiddlewareChains = {
        openForm: new MiddlewareChain((ctx) =>
            console.log(`open form final handler`)
        ),
        CloseForm: new MiddlewareChain((ctx) =>
            console.log(`close form final handler`)
        ),
        playVideo: new MiddlewareChain((ctx) => {
            console.log(`play video final handler`);
        }),
    };

    MiddlewareChains.playVideo.addMiddleware(
        PlayVideoMW({
            vidoePlayerHTMLElement: DOMElements.VideoPlayer,
        })
    );

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

    MiddlewareChains.CloseForm.addMiddleware(
        Middleware.FormClose({
            modalWindowController: ModalWindowControllers.FormModalWindow,
        }),
        Middleware.DisplayToolTipsContainer({
            // flicker: {},
            toolTipContainerHTMLElement: DOMElements.ToolTipsContainer,
        })
    );

    DOMElements.FormCloseButton.addEventListener('click', async () => {
        await MiddlewareChains.CloseForm.execute();
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
                    Middleware.ShowPlaylist({
                        playlistModalWindow: DOMElements.PlayList,
                        timeoutController: { reset: () => {}, set: () => {} },
                    }),
                    (ctx, next) => {
                        // alert();
                        DOMEElementsControllers.Playlist.show({
                            rollBackImplementation: () => {
                                DOMEElementsControllers.Playlist.hide();
                            },
                            rollBackTimeOut: 3000,
                        });
                        // alert();
                    },
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
                    (ctx) => console.log('final')
                ),
                playlistHTMLElement: DOMElements.PlayList,
                playlistItemCreator: Create.PlaylistItem({
                    targetContainer: DOMElements.PlayList,
                    playVideoMWChain: MiddlewareChains.playVideo,
                }),
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

    DOMElements.VideoPlayer.addEventListener('mousemove', () => {
        DOMEElementsControllers.Playlist.show({
            rollBackImplementation: () => {
                // alert();
                DOMEElementsControllers.Playlist.hide();
            },
            rollBackTimeOut: 1000,
        });

        DOMElements.ControlsModalWindow;

        // new MiddlewareChain(
        //     Middleware.ShowPlaylist({
        //         playlistModalWindow:DOMElements.PlayList,
        //     }),
        //     (ctx) => {}
        // ).execute();
    });

    DOMElements.VideoPlayer.addEventListener('mouse', () => {
        DOMEElementsControllers.Playlist.hide();
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
 * @param {(dataSet:{title:string;description:string;file:Object}) => void} deps.playlistItemCreator
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

    if (!deps.playlistItemCreator) {
        throw new Error(
            `FormDataRequestFinalHandler: playlistItemCreator required`
        );
    }

    /**
     *
     * @param {Object} ctx
     * @param {Object} ctx.jsonResponse
     */
    const fn = async (ctx) => {
        // const jsonResponse = ctx.jsonResponse;

        ActionName = {
            VideoPlaylist: 'video-playlist',
            Users: 'users',
        };

        console.log({ ctx });

        if (!ctx.jsonResponse) {
            await onFailMiddleware.execute(ctx);
            return;
        }

        await onSuccessMiddleware.execute(ctx);

        const ServerSuccessResponse = {};

        const Action = {
            'video-playlist': (payload) => {
                console.log({ payload });

                const PlaylistDataSet = {
                    title: payload.title,
                    description: payload.description,
                    video: {
                        rowId: payload.video.rowId,
                        tableName: payload.video.tableName,
                    },
                };

                deps.playlistItemCreator({
                    title: PlaylistDataSet.title,
                    description: PlaylistDataSet.description,
                    video: PlaylistDataSet.video,
                });
            },
            users: () => {
                //
            },
        };

        if (ctx.jsonResponse.success) {
            for (const DBRow of ctx.jsonResponse.success) {
                Action[DBRow.tableName](DBRow.row);
            }
        }

        deps.playlistHTMLElement;
    };

    let s;
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
 * @type {Timeou}
 */
const tc = {};

/**
 *
 * @param {Object} deps
 * @param {HTMLDivElement} deps.playlistModalWindow
 * @returns {(ctx:Object,next:() => Promise<any>) => Promise<any>}
 */
function ShowPlaylistMiddleWare(deps = {}) {
    if (!deps.playlistModalWindow) {
        throw new Error(`ShowPlaylistMiddleWare: playlistModalWindow required`);
    }

    /**
     *
     * @param {Object} ctx
     * @param {() => Promise<any>} next
     */
    const fn = (ctx, next) => {
        deps.playlistModalWindow.style.display = 'flex';
        deps.playlistModalWindow.style.right = 'calc\(100% - var(--width)';

        next();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {HTMLElement} deps.targetContainer
 * @param {MiddlewareChain} deps.playVideoMWChain
 * @returns {(data:Object) => void}
 */
function CreatePlaylistItem(deps = {}) {
    if (!deps.targetContainer) {
        throw new Error(`CreatePlaylistItem-factory: targetContainer required`);
    }

    if (!deps.playVideoMWChain) {
        throw new Error(
            `CreatePlaylistItem-factory: playVideoMWChain required`
        );
    }

    /**
     *
     * @param {Object} data
     * @param {string} data.title
     * @param {string} data.description
     * @param {{
     *  rowId:string,
     *  tableName:string,
     * }} data.video
     * @returns {void}
     */
    const fn = (data = {}) => {
        console.log({ data });
        if (!data.title || !data.description || !data.video) {
            throw new Error(`CreatePlaylistItem: required consistent data`);
        }

        const newElementUnits = {
            base: document.createElement(`div`),
            title: document.createElement(`div`),
            description: document.createElement(`div`),
        };

        newElementUnits.title.innerText = data.title;
        newElementUnits.description.innerText = data.description;

        newElementUnits.base.appendChild(newElementUnits.title);
        newElementUnits.base.appendChild(newElementUnits.description);

        newElementUnits.base.addEventListener('click', () => {
            deps.playVideoMWChain.execute({
                rowId: data.video.rowId,
                tableName: data.video.tableName,
            });
        });

        deps.targetContainer.appendChild(newElementUnits.base);

        return;
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
 * @param {HTMLVideoElement} deps.vidoePlayerHTMLElement
 * @returns {() => Promise<any>}
 */
function PlayVideoMW(deps = {}) {
    if (!deps.vidoePlayerHTMLElement) {
        throw new Error(`PlayVideoMW: vidoePlayerHTMLElement required`);
    }

    const fn = (ctx, next) => {
        console.log('play video', { ctx });

        if (!ctx.rowId || !ctx.tableName) {
            throw new Error(`PlayVideoMW: ctx.rowId && ctx.tableName required`);
        }

        deps.vidoePlayerHTMLElement.src = `/video/${ctx.rowId}`;
        deps.vidoePlayerHTMLElement.load();
        // alert('what');
        next();
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

class TimeoutController {
    /**
     *
     * @param {Object} deps
     * @param {HTMLElement} deps.HTMLElement
     * @param {(payload:any) => Promise<any>} deps.handler
     */
    static Instance(deps = {}) {
        return new TimeoutController({
            handler: deps.handler,
            HTMLElement: deps.HTMLElement,
        });
    }

    reset() {
        if (this.#timeoutid === Infinity) return;
        clearTimeout(this.#timeoutid);
    }

    set() {
        if (this.#timeoutid !== Infinity) {
            clearTimeout(this.#timeoutid);
        }

        setTimeout(this.#handler.bind(this), 1000);
    }

    /**
     * @type {HTMLElement}
     */
    #HTMLElement;

    /**
     * @type {number}
     */
    #timeoutid;

    /**
     * @type {(payload:any) => Promise<any>}
     */
    #handler;

    /**
     *
     * @param {Object} deps
     * @param {HTMLElement} deps.HTMLElement
     * @param {(payload:any) => Promise<any>} deps.handler
     */
    constructor(deps = {}) {
        if (!deps.HTMLElement) {
            throw new Error(`TimeoutController: HTMLElement required`);
        }

        if (!deps.handler) {
            throw new Error(`TimeoutController: handler required`);
        }

        this.#HTMLElement = deps.HTMLElement;
        this.#timeoutid = Infinity;
        this.#handler = deps.handler;
    }
}

class HTMLElementController {
    /**
     *
     * @param {Object} deps
     * @param {HTMLElement} deps.HTMLElement
     * @param {HTMLElementControllerBehaviors} deps.behaviors
     * @returns {HTMLElementController}
     */
    static Instance(deps = {}) {
        if (!deps.HTMLElement) {
            throw new Error(`HTMLElementController: HTMLElement required`);
        }

        if (!deps.behaviors) {
            throw new Error(`HTMLElementController: behaviors required`);
        }

        return new HTMLElementController(deps.HTMLElement, deps.behaviors);
    }

    /**
     * @type {Map<string,number>}
     */
    #Timeouts;

    /**
     *
     * @param {Object} options
     * @param {() => Promise<any>} options.rollBackImplementation
     * @param {number} options.rollBackTimeOut
     */
    show(options = {}) {
        /**
         * provide context
         */
        this.#behaviors.show({
            baseHTML: this.#HTMLElement,
            timeoutsMap: this.#Timeouts,
            options: options,
            callerFnName: this.show.name,
        });

        // const RollBack = {
        //     Implementation: options.rollBackImplementation || ((f) => f),
        //     timeoutDuration: options.rollBackTimeOut || 0,
        // };

        // const clientId = this.show.name;

        // // this.#HTMLElement.style.display = 'flex';
        // this.#HTMLElement.style.animation =
        //     'ShowPlayList .2s ease-out 0s 1 forwards';

        // const Timeout = this.#Timeouts.get(clientId);

        // if (Timeout && Timeout.Id !== Infinity) {
        //     clearTimeout(Timeout.Id);
        // }

        // this.#Timeouts.set(clientId, {
        //     Id: setTimeout(RollBack.Implementation, RollBack.timeoutDuration),
        //     handler: RollBack.Implementation,
        //     duration: RollBack.timeoutDuration,
        // });

        // // clearTimeout(this.#Timeouts.get(clientId).Id);

        // console.log({ timeoouts: this.#Timeouts });
    }

    hide() {
        this.#behaviors.hide({
            baseHTML: this.#HTMLElement,
        });
        // this.#HTMLElement.style.animation =
        //     'HidePlaylist .2s ease-out 0s 1 forwards';
        // this.#HTMLElement.onanimationend = () => {};
        // this.#HTMLElement.style.display = 'flex';
    }

    /**
     * @example
     * ```js
     * const clientId = this.method.name
     * ```
     * @param {string} clientId
     */
    #clearTimeOut(clientId) {
        /**
         * @type {{Id:number;handler:Function}}
         */
        const Timeout = this.#Timeouts.get(clientId);
        if (Timeout && Timeout.Id !== Infinity) {
            console.log({ timeoutId: Timeout.Id });
            clearTimeout(Timeout.Id);
        }

        return {
            handler: (Timeout && Timeout.handler) || ((f) => f),
            duration: (Timeout && Timeout.duration) || 0,
        };
    }

    /**
     * @type {Map<string, Map<string,(payload:any) => Promise<any>>>}
     */
    #handlers;

    /**
     * @type {string}
     */
    #clientSignature;

    /**
     * @type {HTMLElement}
     */
    #HTMLElement;

    // deps

    /**
     * @type {HTMLElementControllerBehaviors}
     */
    #behaviors;

    /**
     *
     * @param {HTMLElement} elem
     * @param {HTMLElementControllerBehaviors} behaviors
     */
    constructor(elem, behaviors) {
        if (!elem) {
            throw new Error(`elem required`);
        }

        if (!behaviors) {
            throw new Error(`behaviors required`);
        }

        this.#HTMLElement = elem;

        this.#behaviors = behaviors;

        this.#Timeouts = new Map();

        const Cache = {
            TimeoutHandler: (f) => f,
            TimeoutDuration: Infinity,
        };

        this.#HTMLElement.addEventListener('mouseenter', () => {
            const ClearTimeoutResponse = this.#clearTimeOut(this.show.name);
            Cache.TimeoutHandler = ClearTimeoutResponse.handler;
            Cache.TimeoutDuration = ClearTimeoutResponse.duration;
        });

        this.#HTMLElement.addEventListener('mouseleave', () => {
            console.log(Cache);

            this.#Timeouts.set(this.show.name, {
                Id: setTimeout(Cache.TimeoutHandler, Cache.TimeoutDuration),
                handler: Cache.TimeoutHandler,
                duration: Cache.TimeoutDuration,
            });
        });

        // const Timeouts = {
        //     MouseEnter: Infinity,
        //     MouseLeave: Infinity,
        // };
    }
}

class HTMLElementControllerBehaviors {
    /**
     *
     * @param {{
     *  baseHTML: HTMLElement;
     *  timeoutsMap: Map<string,Object>,
     *  options:{
     *   rollBackImplementation:() => Promise<any>;
     *   rollBackTimeOut:number;
     *  };
     * }} ctx
     */
    show(ctx = {}) {
        this.#actions.show(ctx);
    }

    /**
     *
     * @param {{
     *  baseHTML: HTMLElement;
     * }} ctx
     */
    hide(ctx = {}) {
        this.#actions.hide(ctx);
    }

    /**
     * @type {{
     *  show:Function;
     *  hide:Function;
     * }}
     */
    #actions;

    /**
     *
     * @param {Object} actions
     * @param {Function} actions.show
     * @param {Function} actions.hide
     */
    constructor(actions = {}) {
        this.#actions = {};

        console.log({ actions });

        this.#actions.show = actions.show || ((f) => f);
        this.#actions.hide = actions.hide || ((f) => f);
    }
}
