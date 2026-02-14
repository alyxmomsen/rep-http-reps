
class RequestManager {

    async exec ({body = {}}) {

        const { error , response } = await useFetch({
            url:this.#url , body , method: this.#method ,
        })

        if(error) {
            this.#handleError(error);
            return ;
        }

        await this.#executeMiddleware(response , [...this.#middleware]);
        await this.#executeHandlers(response ,this.#handlers);
        
    }

    use(...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw) ;
        });
    }

    addHandlers (...handlers) {
        handlers.forEach(h => {
            this.#handlers.push(h);
        });
    }

    async #handleError (error) {
        console.log({error});
    }

    async #executeMiddleware (res , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(res);
        }
        await next();
    }

    async #executeHandlers (res) {
        this.#handlers.forEach(h => {
            h(res);
        });
    }

    #url;
    #method;
    #handlers;
    #middleware;

    constructor ({url , method = 'get' , handlers = [] , middleware = []}) {
        if(!url) {
            throw new Error('url is not provided');
        }
        this.#url = url; 
        this.#method = method ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;
    }
}

const htmlelems = {
    FORM_HTML:{
        id:'form--main' ,
    } ,
}

const formPostRequest = new RequestManager({
    method:'post' ,url:'/handle-form' , 
    handlers:[
        async (res) => {
            const json = await res.json(); 
            console.log({json});
        } ,
    ] , middleware:[

    ] ,
}) ;

const updatePlayListRequest = new RequestManager({
    url:'/get-all-files' , method:'post' ,
    handlers:[
        async (res) => {
            const json = await res.json(); 
            console.log({json});
        }
    ] , middleware:[] ,
});

// -- main --

window.addEventListener("DOMContentLoaded" , async () => {

    const formHTML = document.getElementById(htmlelems.FORM_HTML.id);

    if(formHTML instanceof HTMLFormElement === false) {

        throw new Error(`${htmlelems.FORM_HTML.id} is not exist`);
    } 

    await updatePlayList();

    const formdata = new FormData (formHTML) ;

    formHTML.onsubmit = async (ev) => {
        ev.preventDefault();
        await formPostRequest.exec({body:formdata}) ;
    }

});

// -- end main --

async function updatePlayList () {
    
    updatePlayListRequest.use(() => {});
    await updatePlayListRequest.exec({});


}

// utils

async function useFetch({url , method:_m = 'get' , body = {}}) {

    if(!url) {

        throw new Error('url is not provided');
    }

    const method = _m.toLowerCase();

    try {
        const response = await fetch(url , {
            method:method , 
            body:method === 'get' ? {} : body ,
        });
        return {
            response ,
        }
    }
    catch (e) {

        console.log({e})
        return {
            error:{
                details:e ,
            }
        }
    }
}
