
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


class RequestManager {


    /**
     * 
     * @param {Object} body 
     */
    async exec (body = {}) {

        const response = await fetch(this.#url, {
            method:this.#method,
            ...(this.#method === 'get' ? {} : { body })
        });

        this.#executeMiddleware([...this.#middleware], this.#handler, { response } );

    }

    async #executeMiddleware (middleware, finalHandler, payload) {

        let index = 0;

        const next = async (nextPayload) => {

            if(index < middleware.length) {
                const currentIndex = index++;

                const handler = middleware[currentIndex];

                if(handler) {
                    try {
                        await handler(nextPayload, next);
                    }
                    catch (error) {
                        throw error;
                    }
                }
            }
            else {
                if(finalHandler) {
                    await finalHandler(nextPayload);
                }
            }
        }

        if(middleware.length > 0) {
            await next(payload);
        }
        else if (finalHandler) {
            await finalHandler(payload);
        }
    }

    /**
     * @type {string}
     */
    #url;

    /**
     * @type {string}
     */
    #method;

    /**
     * @type {((payload:Object, next:(payload:Object) => Promise<any>) => Promise<any>)[]}
     */
    #middleware;

    /**
     * @type {(payload:Object) => Promise<any>}
     */
    #handler;

    constructor (url, method, ...handlers) {

        if(!url) {
            throw new Error(`url required but not provided`);
        }
        
        if(!method) {
            throw new Error(`method required but not provided`);
        }
        
        if (!handlers.length) {
            throw new Error(`handlers.length must be > "0"`);
        }

        this.#method = method;
        this.#url = url;

        this.#middleware = handlers.length > 0 ? handlers.slice(0, -1) : [];
        this.#handler = handlers[handlers.length - 1];
    }
}

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

        }

        playlistModalWindow.style.display = 'none';

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