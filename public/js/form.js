/**
 *
 * @typedef {{
 *   baseHTML: HTMLElement;
 *   timeoutsMap: Map<string,Object>,
 *   options:{
 *    rollBackImplementation:() => Promise<any>;
 *    rollBackTimeOut:number;
 *   };
 *   callerFnName:string;
 *  }} ActionContextParam
 *
 * @typedef {(ctx:ActionContextParam) => Promise<any>} HTMLControllerAction
 */
//---------------------------------------------------------------------------

const AppBuffer = new Map();

const AppState = {
    Pools: {
        Playlist: [],
    },
    Playlist: {},
    Form: {
        isOpen: false,
        registrateUserModuleIsLoaded: false,
    },
};

// =============================================

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
    OnUpdatePlaylist: UpdatePlaylistFinalHandler,
    OnGetUserRegistrateForm: OnGetUserRegistrateFormFinalHandler,
};

// ============== REGISTRATE MIDDLEWARE (END) ==============

const DOMEElementsControllersBehaviors = {
    Controlls: () =>
        new HTMLElementControllerBehaviors({
            show: ControlsPanelShowAction({}),
            hide: (ctx) => {
                // ctx.baseHTML.style.display = 'flex'
                ctx.baseHTML.style.animation =
                    'HideControllPanel .2s ease-out 0s 1 forwards';
                ctx.baseHTML.onanimationend = () => {};
            },
        }),
    Playlist: () =>
        new HTMLElementControllerBehaviors({
            show: PlaylistControllerShowActon({}),
            hide: (ctx) => {
                ctx.baseHTML.style.animation =
                    'HidePlaylist .2s ease-out 0s 1 forwards';
                ctx.baseHTML.onanimationend = () => {};
            },
        }),
};

const ControllerBehaviors = {
    ControlsPannel: {
        Behavior: {},
        Actions: {
            Show: ControlsPanelShowAction,
        },
    },
    Playlist: {
        Actions: {
            Show: PlaylistControllerShowActon,
        },
    },
};

const GlobalUtils = {
    // TimeoutController: TimeoutController.Instance,
    RandomString: generateRandomString,
    InputNameAttibuteGenrator: GenerateNameAttribure,
};

document.addEventListener('DOMContentLoaded', () => {
    const Services = {
        KeyController: KeyController.CreateFactory({
            FormState: AppState.Form,
            onKeyChange: () => {},
            trackedKeys: ['KeyK'],
        }),
    };

    // ============= grab HTML elements (BEGIN) =============

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
        CreatePlaylistItemButton: grabDOMElement(`button--add-element`),
        PlaylistFormModule: grabDOMElement(`playlist-items-group`),
        OpenUserRegistrate: grabDOMElement(
            `controls--video__show-registrate-user-form`
        ),
        ReqistrateUserArea: grabDOMElement(`registrate-user-area`),
    };

    // ============= grab HTML elements (END) =============

    const Create = {
        ToolTip: CreateToolTip,
        PlaylistItem: CreatePlaylistItem,
        PlaylistFormElem: PlaylistFormItemCreator({
            nest: DOMElements.PlaylistFormModule,
            randomstringUtil: GlobalUtils.RandomString,
            nameAttribureGenerator: GlobalUtils.InputNameAttibuteGenrator,
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
        async (ctx, next) => {
            await next();
        },
        PlayVideoMW({
            vidoePlayerHTMLElement: DOMElements.VideoPlayer,
        }),
        async (ctx, next) => {
            // alert();
            await next();
        }
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

    DOMElements.OpenUserRegistrate.addEventListener('click', (e) => {
        alert(`incomplete feature`);
    });

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

    DOMElements.CreatePlaylistItemButton.addEventListener('click', async () => {
        Create.PlaylistFormElem({
            titlePlaceholder: 'foo',
            descriptionPlaceholder: 'bar',
            caption: 'baz',
            filePlaceHolder: 'hello guys',
        });

        // DOMElements.PlaylistFormModule.appendChild();
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
        GetRegistrateUserForm: new RequestManager(
            '/api/get-html-form/registrate-user',
            'get',
            (ctx) => {},
            (ctx) => {
                // alert();
            }
        ),
        UpdatePlaylist: new RequestManager(
            '/api/get-playlist',
            'get',
            FinalHandlers.OnUpdatePlaylist({
                middlewareChain: new MiddlewareChain((ctx) => {}),
                playlistItemCreator: Create.PlaylistItem({
                    playlistItemsPool: AppState.Pools.Playlist,
                    playVideoMWChain: MiddlewareChains.playVideo,
                    targetContainer: DOMElements.PlayList,
                }),
                showPlaylistExecutor: () =>
                    DOMEElementsControllers.Playlist.show({
                        rollBackImplementation: () => {
                            DOMEElementsControllers.Playlist.hide();
                        },
                        rollBackTimeOut: 3000,
                    }),
                playlistHTML: DOMElements.PlayList,
            }),
            (ctx) => {}
        ),
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
                    // Middleware.ShowPlaylist({
                    //     playlistModalWindow: DOMElements.PlayList,
                    //     timeoutController: { reset: () => {}, set: () => {} },
                    // }),
                    (ctx, next) => {
                        DOMEElementsControllers.Playlist.show({
                            rollBackImplementation: () => {
                                DOMEElementsControllers.Playlist.hide();
                            },
                            rollBackTimeOut: 3000,
                        });
                        next();
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
                    playlistItemsPool: AppState.Pools.Playlist,
                }),
            }),
            (ctx) => {
                console.log(`before request final handler`);
            }
        ),
    };

    RequestManagers.UpdatePlaylist.addMiddleware(
        Middleware.ConverResponseToJSON()
    );

    // ============== REGISTRATE REQUEST MANAGERS (END) ==============

    // add middleware
    RequestManagers.Form.addMiddleware(Middleware.ConverResponseToJSON());
    RequestManagers.Form.beforeRequest((ctx, next) => {
        DOMElements.StatusDisplay.innerText = 'data send process...';
        next();
    });

    RequestManagers.UpdatePlaylist.execute({});

    DOMElements.MainForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(DOMElements.MainForm);
        await RequestManagers.Form.execute(formData);
    });

    DOMElements.VideoPlayer.addEventListener('mousemove', () => {
        DOMEElementsControllers.Playlist.show({
            rollBackImplementation: () => {
                DOMEElementsControllers.Playlist.hide();
            },
            rollBackTimeOut: 1000,
        });

        DOMEElementsControllers.Controlls.show({
            rollBackImplementation: () => {
                DOMEElementsControllers.Controlls.hide();
            },
            rollBackTimeOut: 1000,
        });
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
 * @param {Object} deps
 * @param {(data:Object) => void} deps.playlistItemCreator
 * @param {HTMLElement} deps.playlistHTML
 * @param {Function} deps.showPlaylistExecutor
 * @returns
 */
function UpdatePlaylistFinalHandler(deps = {}) {
    if (!deps.playlistItemCreator) {
        throw new Error(`UpdatePlaylistFinalHandler: middlewareChain required`);
    }

    if (!deps.playlistHTML) {
        throw new Error(`UpdatePlaylistFinalHandler: playlistHTML required`);
    }

    if (!deps.showPlaylistExecutor) {
        throw new Error(
            `UpdatePlaylistFinalHandler: showPlaylistExecutor required`
        );
    }

    const handler = async (ctx) => {
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
        };

        await deps.middlewareChain.execute(ctx);

        console.log('RequestManager/update playlist: ', { ctx });

        if (!ctx.jsonResponse?.success?.rows) {
            throw new Error(`UpdatePlaylistFinalHandler: no consistent data`);
        }

        const IncomingData = {
            DBRows: ctx.jsonResponse.success.rows,
        };

        for (const [key, DataSet] of Object.entries(IncomingData.DBRows)) {
            Action['video-playlist'](DataSet);
        }

        deps.showPlaylistExecutor();
    };

    return handler;
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
 * @param {Object[]} deps.playlistItemsPool
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

    if (!deps.playlistItemsPool || deps.playlistItemsPool.length) {
        throw new Error(`CreatePlaylistItem-factory: foo bar`);
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
        if (!data.title || !data.description || !data.video) {
            throw new Error(`CreatePlaylistItem: required consistent data`);
        }

        const ElementUnits = {
            base: document.createElement(`div`),
            title: document.createElement(`div`),
            description: document.createElement(`div`),
            status: document.createElement(`div`),
        };

        ElementUnits.title.innerText = data.title;
        ElementUnits.description.innerText = data.description;
        ElementUnits.status.innerText = '🖤';

        ElementUnits.base.appendChild(ElementUnits.title);
        ElementUnits.base.appendChild(ElementUnits.description);
        ElementUnits.base.appendChild(ElementUnits.status);

        ElementUnits.base.addEventListener('click', async () => {
            deps.playlistItemsPool.forEach((PlailistItem) => {
                PlailistItem.Item.style.backgroundColor = '#ffffff00';
            });

            ElementUnits.status.innerText = '🔃';
            ElementUnits.status.style.animation =
                'Rolling 1s ease-out 0s infinite forwards';

            await deps.playVideoMWChain.execute({
                rowId: data.video.rowId,
                tableName: data.video.tableName,
            });

            ElementUnits.status.style.animation = '';
            ElementUnits.status.innerText = '✅';
            ElementUnits.base.style.backgroundColor = '#2f5d7e';
        });

        deps.targetContainer.appendChild(ElementUnits.base);

        deps.playlistItemsPool.push({
            id: Infinity,
            Item: ElementUnits.base,
        });

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

    const fn = async (ctx, next) => {
        await new Promise((resolve, reject) => {
            console.log('play video', { ctx });

            if (!ctx.rowId || !ctx.tableName) {
                throw new Error(
                    `PlayVideoMW: ctx.rowId && ctx.tableName required`
                );
            }

            deps.vidoePlayerHTMLElement.src = `/video/${ctx.rowId}`;
            deps.vidoePlayerHTMLElement.load();

            deps.vidoePlayerHTMLElement.addEventListener('loadeddata', () => {
                deps.vidoePlayerHTMLElement.play();
                resolve();
            });
        });
        await next();
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
    }

    hide() {
        this.#behaviors.hide({
            baseHTML: this.#HTMLElement,
        });
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
            // console.log({ timeoutId: Timeout.Id });
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
            // console.log(Cache);

            this.#Timeouts.set(this.show.name, {
                Id: setTimeout(Cache.TimeoutHandler, Cache.TimeoutDuration),
                handler: Cache.TimeoutHandler,
                duration: Cache.TimeoutDuration,
            });
        });
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

/**
 *
 * @param {Object} deps
 * @returns {HTMLControllerAction}
 */
function ControlsPanelShowAction(deps = {}) {
    /**
     *
     * @param {ActionContextParam} ctx
     */
    const Action = (ctx = {}) => {
        const {
            baseHTML,
            options /* : { rollBackImplementation, rollBackTimeOut } */,
            timeoutsMap,
        } = ctx;

        const RollBack = {
            Implementation:
                ctx.options.rollBackImplementation /* || ((f) => f) */,
            timeoutDuration: ctx.options.rollBackTimeOut /* || 0 */,
        };

        const clientId = ctx.callerFnName;

        /** ----------------------------------------------------
         * ⚠️ target element behavior implementation is only here ⚠️
         */
        // -----------------------------------------------------

        // ctx.baseHTML.style.display = 'flex';
        ctx.baseHTML.style.animation =
            'ShowControllPanel .2s ease-out 0s 1 forwards';
        // ctx.baseHTML.style.animation =
        //     'ShowPlayList .2s ease-out 0s 1 forwards';

        // ===============================================
        // ===============================================

        const Timeout = ctx.timeoutsMap.get(clientId);

        if (Timeout && Timeout.Id !== Infinity) {
            clearTimeout(Timeout.Id);
        }

        ctx.timeoutsMap.set(clientId, {
            Id: setTimeout(RollBack.Implementation, RollBack.timeoutDuration),
            handler: RollBack.Implementation,
            duration: RollBack.timeoutDuration,
        });
    };

    return Action;
}

/**
 *
 * @param {Object} deps
 * @returns {HTMLControllerAction}
 */
function PlaylistControllerShowActon(deps = {}) {
    /**
     *
     * @param {ActionContextParam} ctx
     */
    const Action = (ctx = {}) => {
        // console.log(`Playlist show beh`);

        const {
            baseHTML,
            options /* : { rollBackImplementation, rollBackTimeOut } */,
            timeoutsMap,
        } = ctx;

        const RollBack = {
            Implementation:
                ctx.options.rollBackImplementation /* || ((f) => f) */,
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
            Id: setTimeout(RollBack.Implementation, RollBack.timeoutDuration),
            handler: RollBack.Implementation,
            duration: RollBack.timeoutDuration,
        });

        // console.log({ timeoouts: ctx.timeoutsMap });
    };

    return Action;
}

class KeyController {
    #keys;
    #deps;

    /**
     * @description DI container — валидация зависимостей перед созданием инстанса
     * @param {Object} deps — зависимости для внедрения
     * @param {[]} deps.trackedKeys — зависимости для внедрения
     * @param {Function} deps.onKeyChange — зависимости для внедрения
     * @param {{isOpen:boolean}} deps.FormState — зависимости для внедрения
     * @returns {() => KeyController} — фабрика создания экземпляра
     */
    static CreateFactory(deps = {}) {
        // Валидация зависимостей
        if (deps.trackedKeys && !Array.isArray(deps.trackedKeys)) {
            throw new Error('trackedKeys must be an array');
        }

        if (deps.onKeyChange && typeof deps.onKeyChange !== 'function') {
            throw new Error('onKeyChange must be a function');
        }

        // Возвращаем фабрику с проверенными зависимостями
        return () => new KeyController(deps);
    }

    constructor(deps = {}) {
        this.#keys = new Set();
        this.#deps = deps;

        // Привязываем обработчики к экземпляру для возможности отписки
        this.handleKeyDown = this.#handleKeyDown.bind(this);
        this.handleKeyUp = this.#handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    #handleKeyDown(e) {
        // Фильтрация автоповтора
        if (e.repeat) return;

        // Если отслеживаем только определённые клавиши
        const { trackedKeys } = this.#deps;
        if (trackedKeys && !trackedKeys.includes(e.code)) return;

        this.addKey(e.code);

        // Опциональный callback
        this.#deps.onKeyChange?.({ code: e.code, state: 'pressed' });
    }

    #handleKeyUp(e) {
        this.removeKey(e.code);
        this.#deps.onKeyChange?.({ code: e.code, state: 'released' });
    }

    update() {
        const ActionsMap = {
            KeyK: () => {
                // this.#deps.FormState.isOpen
                console.log('pressed K');
            },
        };

        for (const [_, key] of this.#keys.entries()) {
            ActionsMap[key]?.();
        }

        // for (const key of this.#deps.trackedKeys) {
        //     if (this.#keys.has(key)) {
        //         console.log('is');
        //     }
        // }
    }

    addKey(code) {
        this.#keys.add(code);
    }

    removeKey(code) {
        this.#keys.delete(code);
    }

    isPressed(code) {
        return this.#keys.has(code);
    }

    getPressedKeys() {
        return Array.from(this.#keys);
    }

    // Очистка ресурсов — критически важно для предотвращения утечек
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.#keys.clear();
    }
}

// Создание экземпляра с зависимостями
const kc = KeyController.CreateFactory({
    trackedKeys: ['KeyK', 'KeyW', 'KeyA', 'KeyS', 'KeyD'], // отслеживаем только эти клавиши
    onKeyChange: (event) => {
        // console.log(`Клавиша ${event.code} ${event.state}`);
    },
    FormState: AppState.Form,
})();

// Цикл обновления с разумной частотой (60 FPS)
// const updateLoop = () => {
//     kc.update();
//     requestAnimationFrame(updateLoop);
// };

// updateLoop();

// Очистка при необходимости
// window.addEventListener('beforeunload', () => kc.destroy());

/**
 *
 * @param {Object} deps
 * @param {HTMLElement} deps.nest
 * @param {(config:{length:number}) => string} deps.randomstringUtil
 * @param {(globalConfig:{groupId:string}) => (config:{columnName:string;columnDataType:string}) => string} deps.nameAttribureGenerator
 * @returns {(data:{
 *  titlePlaceholder: string;
 *  descriptionPlaceholder: string;
 *  caption: string;
 *  filePlaceHolder: string;
 * }) => any}
 */
function PlaylistFormItemCreator(deps = {}) {
    if (!deps) {
        throw new Error(`deps required`);
    }

    if (!deps.nest) {
        throw new Error(`deps.nest required`);
    }

    if (!deps.randomstringUtil) {
        throw new Error(`deps.randomstringUtil required`);
    }

    if (!deps.nameAttribureGenerator) {
        throw new Error(`deps.nameAttribureGenerator required`);
    }

    /**
     *
     * @param {Object} data
     * @param {Object} data.titlePlaceholder
     * @param {Object} data.descriptionPlaceholder
     * @param {Object} data.caption
     * @param {Object} data.filePlaceHolder
     *
     */
    const fn = (data) => {
        /**
         * step 1a:
         */

        /*  */
        const Args = {
            data: data,
        };

        const Inputs = {
            Title: document.createElement('input'),
            Description: document.createElement('input'),
            File: document.createElement('input'),
        };

        const Buttons = {
            RemoveTheItem: document.createElement('button'),
        };

        const Units = {
            Inputs: Inputs,
            Caption: document.createElement('h3'),
        };

        const Wrappers = {
            Default: document.createElement('div'),
        };

        const Gears = {
            Frame: document.createElement('div'),
            Wrappers: Wrappers,
            Units: Units,
        };

        const Controller = {
            removeElems: removeElems,
        };

        /**
         * step 1b:
         * initialize these items
         */
        /*  */
        const groupId = deps.randomstringUtil({ length: 2 });

        Units.Caption.innerText = Args.data.caption;

        Inputs.Description.placeholder = Args.data.descriptionPlaceholder;
        Inputs.Description.setAttribute(
            'name',
            deps.nameAttribureGenerator({ groupId: groupId })({
                columnDataType: 'string',
                columnName: 'description',
            })
        );
        Inputs.Title.placeholder = Args.data.titlePlaceholder;
        Inputs.Title.setAttribute(
            'name',
            deps.nameAttribureGenerator({ groupId: groupId })({
                columnDataType: 'string',
                columnName: 'title',
            })
        );
        Inputs.File.innerText = Args.data.filePlaceHolder;
        Inputs.File.setAttribute('type', 'file');
        Inputs.File.setAttribute(
            'name',
            deps.nameAttribureGenerator({ groupId: groupId })({
                columnDataType: 'string',
                columnName: 'video',
            })
        );

        Buttons.RemoveTheItem.setAttribute('type', 'button');
        Buttons.RemoveTheItem.innerText = 'remove this one';
        Buttons.RemoveTheItem.addEventListener('click', (e) => {
            // removeElems(Gears.Frame);
            Controller.removeElems(Gears.Frame);
        });

        Gears.Frame.className =
            'flex flex--col flex--jtf-ctr flex--align-start flex--gap-1 form-element';

        /**
         * step 2:
         * nesting these items
         */

        Gears.Frame.appendChild(Units.Caption);
        Gears.Frame.appendChild(Inputs.Title);
        Gears.Frame.appendChild(Inputs.Description);
        Gears.Frame.appendChild(Inputs.File);

        Gears.Frame.appendChild(Buttons.RemoveTheItem);

        deps.nest.appendChild(Gears.Frame);

        function removeElems(obj) {
            obj.remove();
        }
    };

    return fn;
}

/**
 *
 * @param {Object} config
 * @param {Object} config.length
 */
function generateRandomString(config) {
    const timeStamp = Date.now();

    const charset =
        'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890' +
        timeStamp;

    const RandomString = {
        Line: '',
    };

    for (let i = 0; i < config.length; i++) {
        const index = Math.floor(Math.random() * charset.length);
        RandomString.Line += charset[index];
    }

    return RandomString.Line;
}

/**
 *
 * @param {Object} globalConfig
 * @param {Object} globalConfig.groupId
 */
function GenerateNameAttribure(globalConfig) {
    if (!globalConfig.groupId) {
        throw new Error(`SetNameAttribute: globalConfig.groupId required`);
    }

    /**
     *
     * @param {Object} config
     * @param {Object} config.columnName
     * @param {Object} config.columnDataType
     * @returns
     */
    const fn = (config) => {
        const tableName = 'af';

        return `multitable://${globalConfig.groupId}${tableName}.${config.columnName}.${config.columnDataType}`;
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {Object} deps.appBuffer
 * @param {MiddlewareChain} deps.middlewareChain
 */
function OnGetUserRegistrateFormFinalHandler(deps = {}) {
    if (true) {
    }

    const fn = async (ctx) => {
        /* hardcode detection !!! */

        if (!AppState.Form.registrateUserModuleIsLoaded) {
            deps.middlewareChain.execute();

            const file = json.file;

            const div = document.createElement('div');

            div.innerHTML = file;

            DOMElements.ReqistrateUserArea.appendChild(div);
            AppState.Form.registrateUserModuleIsLoaded = true;
        }

        // await new MiddlewareChain(
        //     Middleware.FormOpen({
        //         modalWindowController: ModalWindowControllers.FormModalWindow,
        //     }),
        //     () => {}
        // ).execute({ some: 'data' });

        // console.log({ json });
    };

    return fn;
}
