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

        modalWindow.show();


    });

});

class RequestRouter {

    // execute

    addListener (handler) {
        this.#routes.get();
    }

    addRoute (url , method , handler) {

        const routeBundle = {
            method , 
            handler ,
        }

        this.#routes.set(url , routeBundle);
    }

    #routes;

    constructor () {
        this.#routes = new Map();
    }
}

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

class ViewElement {

    render () {
        return this.#baseElement ;
    }

    #baseElement;

    constructor () {
        this.#baseElement = document.createElement('div');
    }
}

class ModalWindow {

    #timer;
    #timeout;


    hide () {
        this.#htmlElement.style.display = 'none' ;
    }
    
    show () {
        this.#htmlElement.style.display = 'flex' ;
        console.log(this.#htmlElement);
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