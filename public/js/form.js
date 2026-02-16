
window.addEventListener("DOMContentLoaded"  , () => {

    (() => {
    
        const globals = {
            rest: {
                method: {
                    'GET':{
                        fetch:'get',
                    }
                }
            }
        }  
        
        // --------------------------
        
        class Request {
         
            async exec ({body}) {
        
                const {response , error } = await useFetch({url:this.#url , body , method:this.#method});
    
                if(error) {
                    this.#handleError(error);
                    return;
                }
    
                await this.#executeMiddleware(response , [...this.#middleware]);
                await this.#executeHandlers(response , [...this.#handlers]);
            }
    
            use (...middleware) {
                middleware.forEach(mw => {
                    this.#middleware.push();
                });
            }

            addHandlers (...handlers) {
                handlers.forEach(h => this.#handlers.push(h));
            }
    
            #handleError (error) {
                console.log({error});
            }
    
            async #executeHandlers (response  , handlers) {
                handlers.forEach(async (h) => await h(response));
            }
            
            async #executeMiddleware (response , middleware) {
                let index = 0 ;
                const next = async () => {
                    const handlerLike = middleware[index++] ;
                    if(!handlerLike) return ;
                    handlerLike(response , next);
                }
                await next();
            }
    
            #url;
            #method;
            #handlers;
            #middleware ;
            
            constructor (url , method = globals.rest.method.GET.fetch , middleware = [] , handlers = []) {
                const _m = method.toLowerCase();
                this.#method = _m ;
                this.#url = url ;    
                this.#middleware = [...middleware] ;
                this.#handlers = [...handlers] ;
            }
        }

        // main =========
    
        const formsubmitRequest = new Request('/handle-form' , 'post' , [] , [async (res) => console.log({res:await res.json()})]) ;

        const formHTML = document.getElementById('form--main');

        const formdata = new FormData(formHTML);

        formHTML.onsubmit = async (ev) => {
            ev.preventDefault();
            await formsubmitRequest.exec({body:formdata});
        }
        
    
        // ==============
        
        async function useFetch ({url , method:m = globals.rest.method.GET.fetch , body = {}}) {
            
            const method = m.toLowerCase();
        
            try {
        
                const response = await fetch(url , {
                    method ,
                    body:method === globals.rest.method.GET.fetch ? {} : body ,
                });
                return {
                    response ,
                }
            }
            catch (e) {
                console.log({e});
                return {
                    error: {
                        details:e ,
                    } ,
                }
            }
        
        }
    
    })();

});