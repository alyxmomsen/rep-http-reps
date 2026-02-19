window.addEventListener('DOMContentLoaded' , () => {

    (function () {
    
        // --------------------------- main ---------------------------
    
        const html = {
            btn: {
                addform:{
                    id:'btn--add' ,
                }
            }
        }

        // ---
        
        const updatePlaylist = new RequestRouter({
            url:'/api/get-all-files' ,
            handlers:[] ,
            method:'get' ,
            middleware:[] ,
        });

        updatePlaylist.exec();

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