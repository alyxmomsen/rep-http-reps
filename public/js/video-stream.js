
window.addEventListener('DOMContentLoaded' , async () => {
    
    // grab html

    const video = document.getElementById('video--main');

    // =====
    const videoId = localStorage.getItem('video-id');

    if(videoId) {
        video.src = `/api/video-stream/${videoId}` ;
        video.load();
    }

    const response = await fetch('/api/get-all-files', {
        method:'get' ,
    });

    const { files } = await response.json() ;

    const playlist =document.getElementById('video--playlist');
    files.forEach(file => {

        const { rowId , rowData } = file ;

        const { title , description } = rowData || {} ;

        let elem = null ;

        const newElem = createElement(
            'div' , 
            title , 
            [], 
            [['class' ,'playlist-item']] , 
            ['click' , () => {
                video.src = `/api/video-stream/${rowId}` ;video.load();
            }] ,
            ['mouseenter' , (e) => {
                e.stopPropagation();
                elem = createElement('div' , description , [] , [['class' , 'elem-tool-tip']] , ['mouseenter' ,(e) => {
                    e.stopPropagation();
                }]);
                newElem.appendChild(elem);
            }] ,
            ['mouseleave' , () => {
                elem.remove();
                elem = null ;
            }] ,
        );

        playlist.appendChild(newElem);

        console.log(file, newElem);
    });

    


});

// new RequestRouter('')

function createElement (type , innerHTML = '' , styles = [] , attr = [] , ...eventListeners) {
    try {
        const elem = document.createElement(type);
        elem.innerHTML = innerHTML ;

        eventListeners.forEach(listener => {
            const [evName , handler] = listener ;
            elem.addEventListener(evName , handler);
        });

        attr.forEach(([key , value]) => {
            elem.setAttribute(key , value);
        });

        return elem ;
    }
    catch (e) {
        console.error({e});
        return null ;
    }
}