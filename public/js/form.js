
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
        submitFinalHandlerMiddleware({playlistModalWindow:playlistModal})
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
 * }} deps 
 * @returns 
 */
function submitFinalHandlerMiddleware (deps = {}) {

    const playlistModalWindow = deps.playlistModalWindow || null;

    if(!playlistModalWindow) {
        throw new Error(`modal window required but not provided`);
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
        
        const { addedData } = success;

        if(!addedData) {
            alert();
            return;
        }

        const dbElem = document.createElement('div');

        addedData.forEach(fileItem => {
            const newItem = dbElem.cloneNode()
            newItem.innerText = JSON.stringify(fileItem.row);
            playlistModalWindow.appendChild(newItem);
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