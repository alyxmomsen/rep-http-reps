
class Request_ {

    async exec(body = {}) {

        const { error , response } = await useFetch(this.#url , {method:this.#method , body});

        await this.#executeMiddleware(response , [...this.#middleware]);
        
        if(error) {
            await this.#handleResponseError(error) ;
            return ;
        }

        for (const handler of this.#handlers) {
            await handler(response);
        }
    }

    use (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw) ;
        });
    }

    async #handleResponseError (error) {
        console.log({error});
    }   

    async #executeMiddleware (response , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(response , next);
        }

        await next();
    }

    // #body;
    #url;
    #middleware ;
    #handlers;
    #method;

    constructor ({url , method , handlers = [] , middleware = []}) {

        if(!url || !method) {
            throw new Error('provided no url or method');
        }
        
        this.#url = url ;
        this.#method  = method ;
        this.#middleware = [...middleware] ;
        this.#handlers = [...handlers] ;
    }
}

const htmlelems = {
    FORM_HTML:{
        id:'form--main' ,
    } ,
}

const formPostRequest = new Request_({
    method:'post' ,url:'/handle-form' , 
    handlers:[
        async (res) => {
            const json = await res.json(); 
            console.log({json});
        } ,
    ] , middleware:[

    ] ,
}) ;

const updatePlayListRequest = new Request_({
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
        await formPostRequest.exec(formdata) ;
    }

});

// -- end main --

async function updatePlayList () {
    
    updatePlayListRequest.use();
    await updatePlayListRequest.exec();


}

// utils

async function useFetch(url , {method:_m = 'get' , body = {}}) {

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
