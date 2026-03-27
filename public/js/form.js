
/**
 * @type {Map<string,(row:Object, context:{modalWindow:HTMLElement}) => HTMLElement>}
 */
const toolTipCreatorRouter = new Map();

window.addEventListener('DOMContentLoaded', () => {

    /* modals */

    const formModal = document.getElementById('modal-window--a');
    const playlistModal = document.getElementById('modal-window--b');
    const videoModal = document.getElementById('modal-window--video');

    // playlistModal.style.display = 'none'
    
    /* form */

    const formHTML = document.getElementById('form--main');

    const request = new RequestManager(
        '/api/handle-form' , 
        'post', toJSONMiddleware(), 
        submitFinalHandlerMiddleware({
            playlistModalWindow: playlistModal,
            HTMLFactoriesRouter: toolTipCreatorRouter,
        })
    );

    formHTML.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const formData = new FormData(formHTML);
        await request.exec(formData);
    });
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

/**
 * 
 * @param {{
 *  playlistModalWindow:HTMLDivElement
 *  HTMLFactoriesRouter:Map<string,(row:string,context:{modalWindow:HTMLElement}) => Promise<any>>
 * }} deps 
 * @returns 
 */
function submitFinalHandlerMiddleware (deps = {}) {

    const playlistModalWindow = deps.playlistModalWindow || null;
    const toolTipCreatorRouter = deps.HTMLFactoriesRouter || null

    if(!playlistModalWindow) {
        throw new Error(`modal window required but not provided`);
    }

    if(!toolTipCreatorRouter) {
        throw new Error(`tableNameResolver required but not provided`);
    }

    /**
     * 
     * @param {{success:{addedData:Array<any>}, error:Object}} payload 
     * @returns 
     */
    const handler =  async (payload) => {

        const {success, error} = payload;

        if(error) {
            console.error({error});
            alert('error: check console');
            return ;
        }

        if(!success) {
            alert('error: no success');
            return;
        }
        
        const { addedData: dbStoredData } = success;

        if(!dbStoredData) {
            alert('no added data');
            return;
        }

        playlistModalWindow.style.right = 0;
        playlistModalWindow.style.display = 'flex';

        dbStoredData.forEach(storedDataItem => {

            const toolTipCreator = toolTipCreatorRouter.get(storedDataItem.tableName);
            console.log({toolTipCreator, tablename:storedDataItem.tableName});
            playlistModalWindow.appendChild(toolTipCreator(storedDataItem.row, {modalWindow:playlistModalWindow}));
        });
        // playlistModalWindow.style.display = 'none';

        console.log({success});
    }

    return handler;
}

/**
 * 
 * @param {Object} deps 
 */
function toJSONMiddleware (deps = {}) {

    /**
     * 
     * @param {{Response}} payload 
     * @param {Object} next 
     */
    const handler = async (payload, next) => {
        const { response } = payload;

        if(response instanceof Response === false) {
            throw new Error(`response is not Response`);
        }

        try {
            const jsonData = await response.json();
            await next(jsonData);
        }
        catch (e) {
            console.log({
                error:e,
            });
        }
    }

    return handler;
}

function newProp (key, value,  onClick=f=>f) {
    const propertyContainer  = document.createElement('div');
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
 * @param {Object} row 
 * @param {{modalWindow:HTMLElement}} context 
 * @returns 
 */
const videotooltipCreator = (row = {}, context={}) => {

    /**
     * @type {HTMLElement}
     */
    const modalWindow = context.modalWindow;

    const { title, description, video } = row;

    const mainContainer = document.createElement('div');
    mainContainer.className = 'tool-tip--added-data-response';

    const closebutton = document.createElement('div');
    closebutton.className = 'close-button';

    const caption = document.createElement('h3');
    caption.innerText = 'added item in video-playlist: '
    
    mainContainer.appendChild(caption);

    const titleProp = newProp('title: ', title , () => {});
    mainContainer.appendChild(titleProp);
    const descrProp = newProp('description: ', description);
    mainContainer.appendChild(descrProp);
    const link = newProp('link: ', 'LINK', (e) => {
        e.currentTarget;
        console.log({e});
    });
    mainContainer.appendChild(link);

    mainContainer.appendChild(closebutton);

    closebutton.onclick = (e) => {
        mainContainer.remove();
        if(!modalWindow.childElementCount) {
            modalWindow.style.right = '-200vw';
            modalWindow.style.display = 'none';
        }
    }

    // mainContainer.onclick = (e) => onclick(e, { baseElement:mainContainer});

    return mainContainer;
}

toolTipCreatorRouter.set('video-playlist', videotooltipCreator);

toolTipCreatorRouter.set('users', (row = {}, context={}) => {

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
    caption.innerText = "added user: ";

    const nameProp = newProp('name: ', name);
    const lastNameProp = newProp('last name: ', lastName);

    const image = document.createElement('img');

    /**
     * @type {HTMLImageElement}
     */
    const avatarImg = image.cloneNode();
    avatarImg.src = `/api/img/${avatarNailFileData.rowId}`;
    avatarImg.alt = '💔';
    /**
     * @type {HTMLImageElement}
     */
    const logoImg = image.cloneNode();
    logoImg.src = `/api/img/${logoNailFileData.rowId}`;
    logoImg.alt = '💔';
    /**
     * @type {HTMLImageElement}
     */
    const thumbNailImg = image.cloneNode();
    thumbNailImg.src = `/api/img/${thumbNailFileData.rowId}`;
    thumbNailImg.alt = '💔';

    container.appendChild(caption);
    container.appendChild(nameProp);
    container.appendChild(lastNameProp);

    const tooltipImageContainer = document.createElement('div');
    tooltipImageContainer.className = 'tool-tip__image--container'
    tooltipImageContainer.appendChild(avatarImg);
    tooltipImageContainer.appendChild(logoImg);
    tooltipImageContainer.appendChild(thumbNailImg);
    container.appendChild(tooltipImageContainer);

    container.appendChild(closebutton);

    closebutton.onclick = (e) => {
        container.remove();
        if(!modalWindow.childElementCount) {
            modalWindow.style.right = '-200vw';
            modalWindow.style.display = 'none';
        }
    }

    // const 

    return container;
});