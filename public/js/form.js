/* ============ */
/* globals state */

/**
 * @typedef foo
 * @property {string} bar
 */

/**
 * @type {boolean}
 */
let isFormOpen = false;
/**
 * @type {Array<Object>}
 */
let playlistData = [];

/* globals */
/* ============ */

async function refreshPlaylist(videoMainElement) {
    console.log('refreshPlaylist: updating playlist...');
    
    const playlistContainer = document.getElementById('playlist--video');
    if (!playlistContainer) {
        console.error('playlist container not found');
        return;
    }
    
    try {
        const response = await fetch(`/api/get-playlist/video`, {
            method: 'GET',
        });
        
        const jsonData = await response.json();
        console.log({ refreshData: jsonData });
        
        if (jsonData.success && jsonData.success.rows) {
            // Очищаем контейнер
            playlistContainer.innerHTML = '';
            
            const rows = jsonData.success.rows;
            for (const [rowId, rowData] of Object.entries(rows)) {
                const { title, description, video } = rowData;
                const videoRowId = video?.rowId;
                
                if (videoRowId) {
                    // Используем ту же функцию newProp, что и в servePlaylistMiddleware
                    const playlistItem = newProp(title, description, () => {
                        if (videoMainElement) {
                            videoMainElement.src = `/api/get-file/${videoRowId}`;
                            videoMainElement.load();
                        }
                    });
                    playlistContainer.appendChild(playlistItem);
                }
            }
            console.log('refreshPlaylist: playlist updated, items count:', Object.keys(rows).length);
        } else {
            console.warn('refreshPlaylist: no success.rows in response', jsonData);
        }
    } catch (error) {
        console.error('refreshPlaylist error:', error);
    }
}



/**
 * @type {Map<string,(row:Object, context:{modalWindow:HTMLElement}) => HTMLElement>}
 */
const toolTipCreatorRouter = new Map();

window.addEventListener('DOMContentLoaded', async () => {
    /* modals */

    const formModalWindow = document.getElementById('modal-window--a');
    const tooltipsFrame = document.getElementById('modal-window--b');
    const videoModal = document.getElementById('modal-window--video');
    const playlist = document.getElementById('playlist--video');

    const videoMainElement = document.getElementById('video--main');

    /* key elements */

    const formHTML = document.getElementById('form--main');

    /* controlls */

    const mainFormCloseButton = document.getElementById(
        'form--main--close-button'
    );

    const showFormButton = document.getElementById(
        'controls--video__show-form'
    );

    /* --------- */

    /* instance middleware */

    const servePlaylistMW = servePlaylistMiddleware({
        videoPlaylist: playlist,
        videoMainElement: videoMainElement,
        playlistData: playlistData,
    });

    /* -------------------- */

    /* =============== */
    /* initial state */

    /* initial state */
    /* =============== */

    /* controlling */

    mainFormCloseButton.addEventListener(
        'click',
        async (ev) =>
            await middlewareExecutor({ hello: 'world', ev }, [
                onformCloseButtonClicMW({
                    formModalWindow: formModalWindow,
                }),
                async (payload, next) => {
                    console.log('final mw', { payload });
                    return await next(payload);
                },
            ])
    );

    showFormButton.addEventListener('click', (ev) =>
        middlewareExecutor({}, [showFormMW1({ formModalWindow })])
    );

    /* ----------- */

    /* requests */

    const request = new RequestManager(
        '/api/handle-form',
        'post',
        toJSONMiddleware(),
        submitFinalHandlerMiddleware({
            tooltipsFrame: tooltipsFrame,
            HTMLFactoriesRouter: toolTipCreatorRouter,
            videoMainElement: videoMainElement,
            formModalWindow: formModalWindow,
        }),
        servePlaylistMW
    );

    formHTML.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const formData = new FormData(formHTML);
        await request.exec(formData);
    });

    await middlewareExecutor({}, [servePlaylistMW]);
});

function generateRandomString(length) {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

/* middleware */

/* ================ */
/* show form mw     */

/**
 *
 * @param {{
 *  formModalWindow:HTMLElement;
 * }} deps
 * @returns {(payload:Object, next:(payload:Object) => Promise<any>) => Promise<any>}
 */
function showFormMW1(deps = {}) {
    const formModalWindow = deps.formModalWindow;

    if (!formModalWindow) {
        throw new Error(
            `showFormMW1: formModalWindow required but not provided`
        );
    }

    const mw = async (payload, next) => {
        formModalWindow.style.display = 'flex';

        return await next({ hello: 'guys' });
    };

    return mw;
}

/* show form mw     */
/* ================ */

/* -------------- */
/* close form mw */

/**
 *
 * @param {{
 *  formModalWindow:HTMLElement;
 * }} deps
 * @returns {(payload:Object,next:(payload:Object)=>Promise<any>) => Promise<any>}
 */
function onformCloseButtonClicMW(deps = {}) {
    const formModalWindow = deps.formModalWindow;

    if (!formModalWindow) {
        throw new Error(
            `onformCloseButtonClicMW: formModalWindow required but not provided`
        );
    }

    /**
     *
     * @param {Object} payload
     * @param {(payload:Object) => Promise<any>} next
     * @returns {any}
     */
    const mw = async (payload, next) => {
        formModalWindow.style.display = 'none';
        console.log('form should be closed');

        return await next({ foo: 'bar' });
    };

    return mw;
}

/* close form mw */
/* -------------- */

/* form rquest #middleware */

/**
 *
 * @param {{
 *  tooltipsFrame:HTMLDivElement;
 *  HTMLFactoriesRouter:Map<string,(row:string,context:{modalWindow:HTMLElement}) => Promise<any>>;
 *  videoMainElement:HTMLVideoElement;
 *  formModalWindow:HTMLElement;
 * }} deps
 * @returns
 */
function submitFinalHandlerMiddleware(deps = {}) {
    const tooltipsFrame = deps.tooltipsFrame || null;
    const toolTipCreatorRouter = deps.HTMLFactoriesRouter || null;
    const videoMainElement = deps.videoMainElement || null;
    const formModalWindow = deps.formModalWindow || null;

    if (!tooltipsFrame) {
        throw new Error(`modal window required but not provided`);
    }

    if (!toolTipCreatorRouter) {
        throw new Error(`tableNameResolver required but not provided`);
    }

    const handler = async (payload, next) => {
        const { success, error } = payload;

        if (error) {
            console.error({ error });
            alert('error: check console');
            return;
        }

        if (!success) {
            alert('error: no success from server');
            return;
        }

        const clientResponsePull = success.clientResponsePull;

        if (!clientResponsePull) {
            alert('no data from server');
            return;
        }

        console.log({ clientResponsePull });

        // Показываем панель с тултипами
        tooltipsFrame.style.right = '0';
        tooltipsFrame.style.display = 'flex';
        formModalWindow.style.display = 'none';

        // Очищаем старые тултипы (опционально)
        // while (tooltipsFrame.firstChild) {
        //     tooltipsFrame.removeChild(tooltipsFrame.firstChild);
        // }

        // Создаём тултипы для каждой таблицы
        for (const [tableName, tableData] of Object.entries(clientResponsePull)) {
            if (tableName === 'files') continue;
            
            const toolTipCreator = toolTipCreatorRouter.get(tableName);
            
            if (toolTipCreator && tableData.success && tableData.success.rowById) {
                let rowData = tableData.success.rowById;
                if (rowData instanceof Map) {
                    const obj = {};
                    for (const [k, v] of rowData.entries()) {
                        obj[k] = v;
                    }
                    rowData = obj;
                }
                
                console.log('Creating tooltip for:', tableName, rowData);
                
                tooltipsFrame.appendChild(
                    toolTipCreator(rowData, {
                        modalWindow: tooltipsFrame,
                        videoMainElement: videoMainElement,
                    })
                );
            }
        }

        // ОБНОВЛЯЕМ ПЛЕЙЛИСТ после успешной отправки
        await refreshPlaylist(videoMainElement);

        if (next) {
            await next({});
        }
    };

    return handler;
}

/**
 *
 * @param {Object} deps
 */
function toJSONMiddleware(deps = {}) {
    /**
     *
     * @param {{Response}} payload
     * @param {Object} next
     */
    const handler = async (payload, next) => {
        const { response } = payload;

        if (response instanceof Response === false) {
            throw new Error(`response is not Response`);
        }

        try {
            const jsonData = await response.json();
            await next(jsonData);
        } catch (e) {
            console.log({
                error: e,
            });
        }
    };

    return handler;
}

/**
 *
 * @param {{
 *  videoMainElement:HTMLVideoElement;
 *  videoPlaylist:HTMLElement;
 *  playlistData:Array<Object>
 * }} deps
 * @returns
 */
function servePlaylistMiddleware(deps = {}) {
    const videoMainElement = deps.videoMainElement;
    const videoPlaylist = deps.videoPlaylist;
    const playlistData = deps.playlistData;

    if (!videoMainElement) {
        throw new Error(
            `servePlaylistMiddleware: videoMainElement is required but not provided`
        );
    }

    if (!videoPlaylist) {
        throw new Error(
            `servePlaylistMiddleware: videoPlaylist is required but not provided`
        );
    }

    console.log(`servePlaylistMiddleware: given middleware`);

    return async (payload, next) => {
        console.log('playlist');

        const response = await fetch(`/api/get-playlist/video`, {
            method: 'get',
        });

        try {
            const jsonData = await response.json();

            console.log({ jsonData });

            const { success } = jsonData;
            const { rows } = success;

            // удаляем старые данные из плейлиста
            // плейлист должен содержать актуальные данные
            let plData = undefined;
            while ((plData = playlistData.pop())) {
                console.log(plData);
            }
            console.log(`playlist is clear`);

            for (const [rowId, rowData] of Object.entries(rows)) {
                const { title, description, video } = rowData;
                const { rowId: videoRowId } = video;

                videoPlaylist.appendChild(
                    newProp(title, description, () => {
                        videoMainElement.src = `/api/get-file/${videoRowId}`;
                        videoMainElement.load();
                    })
                );
            }

            /* здесь есть баг,- 
            если в finalhandler вызвать next, то finalhandler 
            будет зациклен */
            // return await next();
        } catch (error) {
            console.log({ e: error });
        }
    };
}

/* virtual DOM   */

/**
 *
 * @param {*} key
 * @param {*} value
 * @param {*} onClick
 * @returns
 */
function newProp(key, value, onClick = (f) => f) {
    const propertyContainer = document.createElement('div');
    const propertyKey = document.createElement('span');
    const propertyValue = document.createElement('span');
    propertyKey.innerText = key;
    propertyValue.innerText = value;
    propertyContainer.appendChild(propertyKey);
    propertyContainer.appendChild(propertyValue);
    propertyContainer.onclick = onClick;
    return propertyContainer;
}

/**
 *
 * @param {string} title
 * @param {(innerContext:{baseElement:HTMLElement}) => void} cb
 */
function createPOSTLink(title, cb) {
    const container = document.createElement('div');
    container.innerText = title;
    container.style.cursor = 'pointer';
    container.onclick = (e) => {
        e.stopPropagation();
        cb({ baseElement: container });
    };
    return container;
}

/**
 *
 * @param {Object} row
 * @param {{
 *  modalWindow:HTMLElement;
 *  videoMainElement:HTMLVideoElement;
 * }} context
 * @returns
 */
const videotooltipCreator = (row = {}, context = {}) => {
    // ДИАГНОСТИКА — УДАЛИ ПОТОМ
    console.log('=== videotooltipCreator DEBUG ===');
    console.log('row type:', typeof row);
    console.log('row keys:', Object.keys(row));
    console.log('full row:', JSON.stringify(row, null, 2));
    if (row instanceof Map) {
        console.log('row is Map, entries:');
        for (const [k, v] of row.entries()) {
            console.log(`  ${k}:`, v);
        }
    }
    // ======================================
    const modalWindow = context.modalWindow;
    const videoMainElement = context.videoMainElement;

    // Извлекаем значения с учётом структуры { data: "значение" }
    let title = row.title;
    let description = row.description;
    let video = row.video;

    // Если значения обёрнуты в объекты с полем data — разворачиваем
    if (title && typeof title === 'object' && 'data' in title) {
        title = title.data;
    }
    if (description && typeof description === 'object' && 'data' in description) {
        description = description.data;
    }

    const mainContainer = document.createElement('div');
    mainContainer.className = 'tool-tip--added-data-response';

    const closebutton = document.createElement('div');
    closebutton.className = 'close-button';

    const caption = document.createElement('h3');
    caption.innerText = 'added item in video-playlist: ';

    mainContainer.appendChild(caption);

    const titleProp = newProp('title: ', title || 'untitled', () => {});
    mainContainer.appendChild(titleProp);
    const descrProp = newProp('description: ', description || 'no description');
    mainContainer.appendChild(descrProp);
    
    const link = createPOSTLink('play', (innerContext) => {
        const videoRowId = video?.rowId;
        if (videoRowId) {
            videoMainElement.src = `/api/get-file/${videoRowId}`;
            videoMainElement.load();
        }

        mainContainer.remove();
        if (!modalWindow.childElementCount) {
            modalWindow.style.right = '-200vw';
            modalWindow.style.display = 'none';
        }
    });
    mainContainer.appendChild(link);
    mainContainer.appendChild(closebutton);

    closebutton.onclick = (e) => {
        mainContainer.remove();
        if (!modalWindow.childElementCount) {
            modalWindow.style.right = '-200vw';
            modalWindow.style.display = 'none';
        }
    };

    return mainContainer;
};

toolTipCreatorRouter.set('video-playlist', videotooltipCreator);

toolTipCreatorRouter.set('users', (row = {}, context = {}) => {
    /**
     * @type {HTMLElement}
     */
    const modalWindow = context.modalWindow;

    const name = row['name'];
    const lastName = row['last-name'];
    const thumbNailFileData = row['thumb-nail'];
    const logoNailFileData = row['logo'];
    const avatarNailFileData = row['avatar'];

    const container = document.createElement('div');
    container.className = 'tool-tip--added-data-response';

    const closebutton = document.createElement('div');
    closebutton.className = 'close-button';

    const caption = document.createElement('h3');
    caption.innerText = 'added user: ';

    const nameProp = newProp('name: ', name);
    const lastNameProp = newProp('last name: ', lastName);

    const image = document.createElement('img');

    /**
     * @type {HTMLImageElement}
     */
    const avatarImg = image.cloneNode();
    avatarImg.src = `/api/get-file/${avatarNailFileData.rowId}`;
    avatarImg.alt = '💔';
    /**
     * @type {HTMLImageElement}
     */
    const logoImg = image.cloneNode();
    logoImg.src = `/api/get-file/${logoNailFileData.rowId}`;
    logoImg.alt = '💔';
    /**
     * @type {HTMLImageElement}
     */
    const thumbNailImg = image.cloneNode();
    thumbNailImg.src = `/api/get-file/${thumbNailFileData.rowId}`;
    thumbNailImg.alt = '💔';

    container.appendChild(caption);
    container.appendChild(nameProp);
    container.appendChild(lastNameProp);

    const tooltipImageContainer = document.createElement('div');
    tooltipImageContainer.className = 'tool-tip__image--container';
    tooltipImageContainer.appendChild(avatarImg);
    tooltipImageContainer.appendChild(logoImg);
    tooltipImageContainer.appendChild(thumbNailImg);
    container.appendChild(tooltipImageContainer);

    container.appendChild(closebutton);

    closebutton.onclick = (e) => {
        container.remove();
        if (!modalWindow.childElementCount) {
            modalWindow.style.right = '-200vw';
            modalWindow.style.display = 'none';
        }
    };

    // const

    return container;
});

/* #utils */

/**
 *
 * @param {Object} payload
 * @param {((payload:Object,next:(payload:Object)=>Promise<any>) => Promise<any>)[]} middleware
 */
async function middlewareExecutor(payload, middleware) {
    console.log(`middleware executor`);

    let index = 0;

    const next = async (nextPayload) => {
        if (index < middleware.length) {
            const currentIndex = index++;
            const handler = middleware[currentIndex];
            if (handler) {
                try {
                    await handler(nextPayload, next);
                } catch (err) {
                    throw err;
                }
            }
        } else {
            return nextPayload;
        }
    };

    if (middleware.length > 0) {
        console.log('middleware executor: go middleware');
        return await next(payload);
    }
}

/**
 *
 * @param {{
 *  formModalWindow:HTMLElement
 * }} deps
 */
function init(deps = {}) {
    const formModalWindow = deps.formModalWindow;

    if (!formModalWindow) {
        throw new Error(`init: formModalWindow required but not provided`);
    }

    const fn = () => {};

    return fn;
}


async function refreshPlaylist(videoMainElement) {
    console.log('refreshPlaylist: updating playlist...');
    
    const playlistContainer = document.getElementById('playlist--video');
    if (!playlistContainer) {
        console.error('playlist container not found');
        return;
    }
    
    try {
        const response = await fetch(`/api/get-playlist/video`, {
            method: 'GET',
        });
        
        const jsonData = await response.json();
        console.log({ refreshData: jsonData });
        
        if (jsonData.success && jsonData.success.rows) {
            // Очищаем контейнер
            playlistContainer.innerHTML = '';
            
            const rows = jsonData.success.rows;
            for (const [rowId, rowData] of Object.entries(rows)) {
                const { title, description, video } = rowData;
                const videoRowId = video?.rowId;
                
                if (videoRowId) {
                    const playlistItem = document.createElement('div');
                    playlistItem.innerHTML = `
                        <span><strong>${escapeHtml(title || 'untitled')}</strong></span>
                        <span>${escapeHtml(description || '')}</span>
                    `;
                    playlistItem.style.cursor = 'pointer';
                    playlistItem.style.padding = '8px';
                    playlistItem.style.border = '1px solid #ccc';
                    playlistItem.style.margin = '4px';
                    playlistItem.style.borderRadius = '4px';
                    
                    playlistItem.onclick = () => {
                        if (videoMainElement) {
                            videoMainElement.src = `/api/get-file/${videoRowId}`;
                            videoMainElement.load();
                        }
                    };
                    
                    playlistContainer.appendChild(playlistItem);
                }
            }
            console.log('refreshPlaylist: playlist updated');
        } else {
            console.warn('refreshPlaylist: no success.rows in response', jsonData);
        }
    } catch (error) {
        console.error('refreshPlaylist error:', error);
    }
}

// Вспомогательная функция для защиты от XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}