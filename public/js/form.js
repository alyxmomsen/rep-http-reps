console.log('form js loaded');

const METHODS_KEYS  = {
    POST:'post',
    GET:'get',
}

window.addEventListener('DOMContentLoaded' , () => {

    // grab html elements

    const mainForm = document.getElementById('form--main');
    const statusBar = document.getElementById('status--upload');
    const modalWindow  = new ModalWindow(document.getElementById('modal-window--main'));
    const addElementButton  = document.getElementById('button--add-element');
    const playlistGroup  = document.getElementById('playlist-items-group');

    addElementButton.addEventListener("click" , (e) => {
        e.stopPropagation();
        (new PlaylistFormElement('new playlist element' , 'playlist-1'))
            .insertInto(playlistGroup);

    });

    mainForm.addEventListener("submit" , async (e) => {
        e.preventDefault();
        
        console.log(e.currentTarget === mainForm);

        // hide modal window
        
        // modalWindow.hide();

        statusBar.innerText = 'loading...';

        const formData = new FormData(mainForm);

        const response = await fetch('/api/handle-form' , {
            body:formData ,
            method:METHODS_KEYS.POST ,
        });

        const jsonResponse = await response.json();

        statusBar.innerText = 'loaded';

        console.log({jsonResponse});

        const {success, error} = jsonResponse;

        if(success) {
            const { addedData } = success;
            modalWindow.show(addedData);
            return;
        }

        if(error) {
            console.error(error);
            throw new Error(error);
        }

        throw new Error('unknown error');
    });

});

class RequestRoute {

    async execute (body = {}) {
        const { error , success } = await RequestRoute.UseFetch(this.#url , this.#method , body);

        if(error) {
            console.log({error});
            return ;
        }

        const { response } = success ;

        this.#responseHandler(response , );

        for (const handler of this.#responseHandler) {
            await handler(response);
        }
    }

    static async UseFetch (url , method , body) {
        try {
            const response = await fetch(url , {
                method:method , 
                ...(method === 'get'? {} : { body }),
            });

            return {
                success:{
                    response ,
                } ,
            }
        }
        catch (e) {
            console.log({e});
            return {
                error:{
                    location:'RequestRoute::execute' ,
                    message:'' ,
                    subjects:{naiveError:{e}}
                }
            }
        }
    }

    addBeforeRequestListeners (...handlers) {
        handlers.forEach(handler => {
            this.#beforeRequestHandlers.push(handler);
        });
    }

    addMiddleware (...handlers) {
        handlers.forEach(handler => {
            this.#middleware.push(handler);
        });
    }

    /**
     * 
     * @param {(response:Response , payload) => Promise<void>} handler 
     */
    addResponseHandler (handler) {
        this.#responseHandler = async (res) => await handler(res , payload) ;
    }

    #url ;
    #method ;
    #responseHandler ;
    #middleware ;
    #beforeRequestHandlers ;

    /**
     * 
     * @param {string} url 
     * @param {string} method 
     * @param  {...((res:Response , payload:Object) => Promise<void>)} handlers 
     */
    constructor (url , method , ...handlers) {
        this.#url = url ;
        this.method = method ;
        this.#responseHandler = handlers.length ? handlers[handlers.length - 1] : f=>f ;
        this.#middleware = [] ;
        this.#beforeRequestHandlers = [] ;
    }
}

class ModalWindow {

    #timer;
    #timeout;


    hide () {
        this.#htmlElement.style.display = 'none' ;
    }
    

    show (data) {
        const datawrapper = document.createElement('div');
        data.forEach(el => {
            const d = document.createElement('div');
            d.innerText = el.id;
            console.log({el});
            datawrapper.appendChild(d);
        });

        this.#htmlElement.appendChild(datawrapper);

        this.#htmlElement.style.display = 'flex' ;
        if(this.#timeout) {
            clearTimeout(this.#timeout);
        }
        this.#timeout = setTimeout(this.hide.bind(this) , 3000) ;
    }

    #htmlElement;

    /**
     * 
     * @param {HTMLDivElement} html
     * @param {} t  
     */
    constructor (html) {
        if(!html) {
            throw new Error(`no html provided`);
        }
        this.#htmlElement = html ;

    }
}

class PlaylistFormElement {

    /**
     * 
     * @param {HTMLElement} nestElement 
     */
    insertInto(nestElement) {
        nestElement.appendChild(this.#baseElement);
    }

    #baseElement;

    constructor (innerText , tablename) {

        this.#baseElement = document.createElement('div');

        const bEl = this.#baseElement ;
        bEl.className = 'flex flex--col flex--jtf-ctr flex--align-start flex--gap-1 form-element' ;

        // constants:

        const INPUT_TYPES = {
            TEXT:'text', 
            FILE:'file', 
        }

        const GROUP_DATA_BASE = {
            GROUP_ID:generateRandomString(32) ,
            TABLE_NAME:tablename ,
        }

        const COLUMN_NAMES_KEYS = {
            TITLE:'title', 
            DESCRIPTION:'description', 
        }

        const COLUMN_DATA_TYPES = {
            STRING:'string',
            BINARY:'binary',
        }

        const { GROUP_ID , TABLE_NAME } = GROUP_DATA_BASE ;
        const { TITLE , DESCRIPTION } = COLUMN_NAMES_KEYS ;
        const { STRING , BINARY } = COLUMN_DATA_TYPES ;

        // utils: 

        const createNameAttr = (groupid , tablename ,colname , datatype) => {
            return `${groupid}.${tablename}.${colname}.${datatype}` ;
        }

        // inners:

        const h3 = document.createElement('h3');
        h3.innerText = innerText ;

        const titleInput = document.createElement('input');
        titleInput.type = INPUT_TYPES.TEXT ;
        titleInput.name = createNameAttr(GROUP_ID , TABLE_NAME , TITLE , STRING) ;

        const descriptionInput = document.createElement('input');
        descriptionInput.type = INPUT_TYPES.TEXT ;
        descriptionInput.name = createNameAttr(GROUP_ID , TABLE_NAME , DESCRIPTION, STRING);

        const fileInput = document.createElement('input');
        fileInput.type = INPUT_TYPES.FILE ;
        fileInput.name = createNameAttr(GROUP_ID , TABLE_NAME , 'video', BINARY);

        const closebutton = document.createElement('button');
        closebutton.type = 'button' ;
        closebutton.innerText = 'X' 
        closebutton.className = 'playlist-element--close-button';
        
        // nest

        bEl.appendChild(h3);
        bEl.appendChild(titleInput);
        bEl.appendChild(descriptionInput);
        bEl.appendChild(fileInput);
        bEl.appendChild(closebutton);
    }
}

/* 
<div class="flex flex--col flex--jtf-ctr flex--align-start flex--gap-1 form-element">
    <h3>playlist element</h3>
    <input type="text" name="G22.playlist-1.title.string" id="">
    <input type="text" name="G22.playlist-1.description.string" id="">
    <input type="file" name="G22.playlist-1.video-min.binary" id="" accept=".mkv, .mp4">
</div>
*/

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

