class RequestRouter {

    async exec (body = {}) {

        const { error , response } = await RequestRouter.UseFetch(this.#url , this.#method , body);

        if(error) {
            console.error({error});
            return ;
        }

        await this.#executeMiddleware(response , [...this.#middleware]);
        for (const handler of this.#handlers) {
            await handler(response);
        }    
    }

    
    
    useMiddleware (...middleware) {
        middleware.forEach(mw => {
            this.#middleware.push(mw);
        });
    }
    
    addHandlers (...handlers) {
        handlers.forEach((handler) => {
            this.#handlers.push(handler);
        });
    }
    
    static async UseFetch (url , method = 'get' , body = {}) {
        
        if(!url) throw new Error('usefetch :: incorrect url provided');
        if(!method) throw new Error('usefetch :: incorrect method provided');

        const _method = method.toLowerCase();

        try {

            const response = await fetch (url , {
                method:_method ,
                ...(_method === 'get' ? {} : {body}) ,
            }) ;

            return {
                response ,
            }
        }
        catch (e) {
            return {
                error:{
                    message:{
                        native:e ,
                    } ,
                } ,
            }
        }
    } 

    #handleError (err) {
        console.log({err});
    }
    
    async #executeMiddleware (responseByFetch , middleware) {
        let index = 0 ;
        const next = async () => {
            const handler = middleware[index++] ;
            if(!handler) return ;
            await handler(responseByFetch);
        }
        await next();
    }

    #url ;
    #method ;
    #handlers ;
    #middleware ;
    
    constructor (url , method , handlers , middleware) {
        
        if(!url) throw new Error('router :: incorrect url provided ');
        
        if(!method) throw new Error('router :: incorrect method provided');

        const _method = method.toLowerCase();

        this.#url = url ;
        this.#method = method ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;
    }
}

// ------------------------------ main ------------------------------

window.addEventListener("DOMContentLoaded" , () => {

    const form = document.getElementById('form--main');

    form.addEventListener("submit" , async (e) => {

        const r = new RequestRouter('/api/handle-form' , 'post' , [async (res) => {console.log(await res.json())}] , [async (res , next) => {alert('mw')}]);
        
        e.preventDefault();
        
        const formdata = new FormData (form) ;
        
        await r.exec(formdata);
        
        // const {response  , error} = await RequestRouter.UseFetch('/api/handle-form' ,'post' ,formdata) ;

        // console.log({response:await response.json() , error});

    });

});

// ------------------------------------------------------------------