
class RequestManager {

    async exec (body = {}) {
        const { error , response } = await useFetch({ 
            url:this.#url , 
            method:this.#method ,
            body ,
        });

        if(error) {
            this.handleError(error);
            return ;
        }

        await this.#executeMiddleware(response , [...this.#middleware]);
        await this.#executeHandlers(response , [...this.#handlers]);
    }

    addHandles (...handlers) {
        handlers.forEach(hr => {
            this.#handlers.push(hr);
        });
    }

    use (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }

    handleError (error) {
        console.log({error});
    }

    async #executeHandlers (response , handlers) {
        handlers.forEach(async (handler) => {
            await handler(response);
        });
    }

    async #executeMiddleware (response , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(response , next);
        }
        await next() ;
    }

    #url;
    #method;
    #handlers;
    #middleware ;

    constructor ({method = 'get' , url , handlers = [] , middleware = []}) {

        if(!url) {
            throw new Error('no url provided') ;
        }

        this.#url = url ;
        this.#method = method ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;
    }
}

const htmlElements = {
    'FORM_MAIN':{
        id:'form--main' ,
    }
}

const formsubmit = new RequestManager({
    url:'/handle-form' , 
    method:'post' ,
    handlers:[
        async (response) => {
            const json = await response.json();
            console.log({response , json});
        }
    ] ,
    middleware:[] ,
});

document.addEventListener('DOMContentLoaded' , async () => {


    const formHTML = document.getElementById(htmlElements.FORM_MAIN.id);
    
    const form = new FormData(formHTML);

    const response = await fetch('/handle-form' , {method:'post' , body:form});
    
    console.log({formHTML , response:await response.json()});

    const formdata = new FormData(formHTML);

    formHTML.onsubmit = async (ev) => {
        ev.preventDefault();
        await formsubmit.exec(form);
    }

});

async function useFetch ({url , method:_m = 'get'  , body = {}}) {

    if(!url) {
        throw new Error ('no url');
    }

    const method = _m.toLowerCase();

    console.log({url , method , body});

    try {
        const response = await fetch(url , {
            method , 
            body: method === 'get' ? {} : body ,
        });

        return {
            response,
        } ;
    }
    catch (e) {
        console.log({e});
        return {
            error:{
                details:e,
            } ,
        }
    }

}