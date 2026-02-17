window.addEventListener('DOMContentLoaded' , () => {

    (function () {
    
        class Request  {
        
            async exec({body={} , url=undefined}) {
                console.log(this.#url);
                const { response , error } = await useFetch({
                    url:url || this.#url , 
                    body:this.#method === 'get' ? {} : body , 
                    method:this.#method});
    
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
                console.log({_m , url , handlers , middleware});
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
    
        // --------------------------- main ---------------------------
    
        const html = {
            btn: {
                addform:{
                    id:'btn--add' ,
                }
            }
        }

        // ---
        
        const updatePlaylist = new Request({
            url:'/api/get-all-files' ,
            handlers:[] ,
            method:'get' ,
            middleware:[] ,
        });

        updatePlaylist.exec({});

        // ---

        const videoIdLocalstorageData = searchLocalStorage('video-id');
        const videoelem = document.getElementById('video--main');
        if(videoelem instanceof HTMLVideoElement === false) return ;
        
        videoelem.onload = () => {
            console.log('load');
        }
        
        videoelem.onloadstart = () => {
            
            console.log('load stafrt');
        }
        
        videoelem.onloadeddata = () => {
            
            console.log('loaded data');
        }

        (videoIdLocalstorageData && videoelem) && (videoelem.src = `/api/video-stream/${videoIdLocalstorageData}`) && videoelem.load() ;



        // ------------------------------------------------------------
    
        async function useFetch ({url , body = {} , method:_m = 'get'}) {
            
            const method = _m.toUpperCase();
    
            if(!url) {
                throw new Error('no url provided');
            }
    
            try {
                const response = await fetch(url , {
                    method ,
                    ...(method === 'get' ? {} : body) ,
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

function searchLocalStorage (itemName) {

    const vid = localStorage.getItem(itemName);

    return vid ;

}