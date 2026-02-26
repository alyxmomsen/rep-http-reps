
window.addEventListener('DOMContentLoaded' , async () => {

    const htmlElements = new Map();
    
    // grab html

    const video = document.getElementById('video--main');
    const videocontainer = document.getElementById('video--video-container');

    // =====
    
    const videoId = localStorage.getItem('video-id');

    htmlElements.set('videoelement' , new VideoElement(video , videocontainer, '/api/video-stream' , videoId));
    
    if(videoId) {
        video.src = `/api/video-stream/${videoId}` ;
        video.load();
        // console.log({videoId});
        // htmlElements.get('videoelement')?.load(videoId);
    }

    const response = await fetch('/api/get-all-files', {
        method:'get' ,
    });

    const { files } = await response.json() ;

    const playlist =document.getElementById('video--playlist');
    files.forEach(file => {

        const { rowId , rowData } = file ;

        const { title , description } = rowData || {} ;

        htmlElements
            .set(rowId , new PlaylistItem(playlist , title  , description))

        const elem = htmlElements.get(rowId);
        elem?.addEventListener('mousemove' , (e) => {
            if(e.currentTarget !== elem.getBaseHTMLelem()) return ;
            const x = e.clientX + 10 * 2 ;
            const y = e.clientY * 1 ;
            elem?.render({position:{x , y}});
        });
        elem?.addEventListener('mouseleave' , (e) => {
            elem?.render({display:'none'});
        });
        elem?.addEventListener('mouseenter' , () => {
            elem?.render({display:'flex'});
        });
        elem?.addEventListener('click' , () => {
            // video.src = `/api/video-stream/${rowId}` ;
            // video.load();
            // video.addEventListener('playing' , (e) => {
            //     console.log(e);
            // })
            htmlElements.get('videoelement')?.load(rowId);

        });
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


class PlaylistItem {

    remove() {
        this.#baseHTMLelem.remove();
    }

    update() {

    }

    render ({position , display}) {
        const {x , y} = position || {} ; 
        console.log({x,y , display});
        (y !== undefined) && (this.#description.style.top = `${y}px`) ;
        (x !== undefined) && (this.#description.style.left = `${x}px`) ;
        display && (this.#description.style.display = display) ;

    }

    getBaseHTMLelem () {
        return this.#baseHTMLelem ;
    }

    /**
     * 
     * @param {string} eventName 
     * @param {(e:Event) => Promise<void>} handler 
     */
    addEventListener (eventName , handler) {
        this.#baseHTMLelem.addEventListener(eventName , handler);
    }

    #baseHTMLelem ;
    #description ;

    /**
     * 
     * @param {HTMLElement} nest 
     * @param {string} title 
     * @param {string} description 
     */
    constructor (nest , title , description) {

        this.#baseHTMLelem = document.createElement('div');
        this.#baseHTMLelem.className = 'playlist-item';

        const titleHTML = document.createElement('span');
        titleHTML.innerText = title ;

        this.#description = document.createElement('div');
        this.#description.innerText = description ;
        this.#description.className = 'playlist-description'

        this.#baseHTMLelem.appendChild(titleHTML);
        this.#baseHTMLelem.appendChild(this.#description);

        this.#baseHTMLelem.className = 'playlist-item';

        nest.appendChild(this.#baseHTMLelem);

    }
}

class VideoElement {

    #rootElement;

    #srcId;
    #url;


    #curtain;

    /**
     * 
     * @param {string} testId 
     */
    compareSrcId(testId) {
        return this.#srcId === testId ;
    }

    /**
     * 
     * @param {string} [srcId] 
     */
    load(srcId) {
        if(srcId) {
            this.#srcId = srcId ;
        }

        this.#rootElement.load(this.#url + '/' + this.#srcId);

        console.log(this.#url , this.#srcId);
        this.#curtain.style.display = 'flex'
        this.#curtain.style.backgroundImage
    }

    /**
     * 
     * @param {HTMLVideoElement} videoElement 
     * @param {string} src 
     * @param {string} srcId 
     */
    constructor (videoElement , vidoContainer ,src , srcId) {
        this.#rootElement = videoElement;
        this.#srcId = srcId ;
        this.#url = `/api/video-stream`;

        this.#rootElement.src = src ;

        this.#curtain = document.createElement('div');
        this.#curtain.id = 'curtain';

        vidoContainer.appendChild(this.#curtain);
        console.log(vidoContainer);

        this.#rootElement.addEventListener('loadeddata' , (e) => {
            this.#curtain.style.display = 'none';
        })

        this.#rootElement.addEventListener('load' , (e) => {
            this.#curtain.style.display = 'flex';
        })
    }
}