window.addEventListener('DOMContentLoaded' , () => {

    (function () {
    
        class Request  {
        
            async exec({body = {}}) {
                const { response , error } = await useFetch({url:this.#url , body , method:this.#method});
    
                if(error) {
                    this.handleError(error);
                    return ;
                }
    
                await this.#executeMiddleware(response , [...this.#middleware]);
                await this.#executeHandlers(response , [...this.#handlers]);
            }
    
            use (...middleware) {
                middleware.forEach(mw => {
                    this.#middleware.push(mw);
                });
            }
    
            addHandlers(...handlers) {
                handlers.forEach(h => {
                    this.#handlers.push(h) ;
                });
            }
    
            handleError (error) {
                console.log({error});
            }
    
            async #executeMiddleware (response , middleware) {
                let index = 0;
                const next = async () => {
                    const handlerLike =  middleware[index++] ;
                    if(!handlerLike) return ;
                    await handlerLike(response , next);
                }
                await next();
            }
    
            async #executeHandlers (response , handlers) {
                for (const handler of handlers) {
                    await handler(response);
                }
            }
    
            #method ;
            #url ;
            #handlers ;
            #middleware ;
    
            constructor ({method:_m = 'get' , url , handlers = [] , middleware = []}) {
    
                if(!url) {
                    throw new Error('no url provided');
                }
    
                const method = _m.toUpperCase();
    
                this.#method = method ;
                this.#url = url ;
                this.#handlers = [...handlers] ;
                this.#middleware = [...middleware] ;
            }        
        }
    
        // ----- main ----------------------------------------
    
        // const html = {
        //     form: {
        //         main:{
        //             id:'form--main' ,
        //         } ,
        //     } ,
        //     btn: {
        //         addform:{
        //             id:'btn--add' ,
        //         }
        //     }
        // }

        const formelem = document.getElementById(html.form.main.id);
        const addFormButton = document.getElementById(html.btn.addform.id);

        formelem.onsubmit = (ev) => {
            const formData = new FormData(formelem);
            ev.preventDefault();
            onformsubmit.exec({body:formData});
        }

        // -----------------------------------------------------
    
        async function useFetch ({url , body = {} , method:_m = 'get'}) {
            
            const method = _m.toUpperCase();
    
            if(!url) {
                throw new Error('no url provided');
            }
    
            try {
                const response = await fetch(url , {
                    method ,
                    body:method === 'get' ? {} : body , 
                });
    
                return {
                    response ,
                }
            }
            catch (e) {
                console.log({e});
                return {
                    error:{
                        details:e ,
                    } ,
                }
            }
    
        }
    
    })()


});