
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

    console.log({files});


    const playlist =document.getElementById('video--playlist');
    files.forEach(file => {

        const { rowId , rowData } = file ;

        const { title } = rowData || {} ;

        const newElem = createElement('div' , title , [], [['class' ,'playlist-item']] , ['click' , () => {
            video.src = `/api/video-stream/${rowId}` ;
            video.load();
        }]);

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