window.addEventListener("DOMContentLoaded" , async () => {

    
    updatePlaylist();


});

async function handlePlaylistItemClick(ev) {
    
    const playlistitem = ev.currentTarget;

    const preloadScreen = document.getElementById('preload-screen');
    
    preloadScreen.ontransitionend = () => {
        preloadScreen.zIndex = -1 ;          
    }

    preloadScreen.style.zIndex = 1 ;
    preloadScreen.style.backgroundColor = '#1e1a22ff'
    
    const id = playlistitem.getAttribute('x-id');
    
    const videoHTML = document.getElementById('video--html');
    videoHTML.src = `/api/get-video-stream-by-id/${id}` ;
    videoHTML.load();
    videoHTML.onloadeddata = () => {
        preloadScreen.style.backgroundColor = '#1e1a2200';
        preloadScreen.style.zIndex  = -1 ;
    }

    console.log({id});

    // const response = await fetch(`/api/get-video-stream-by-id/${id}` , {method:'post'});

    

}

async function updatePlaylist () {

    try {
        
        const preloadScreen = document.getElementById('preload-screen');
        preloadScreen.zIndex = -1 ;

        preloadScreen.ontransitionend = () => {
            preloadScreen.zIndex = -1 ;          
        }

        preloadScreen.style.zIndex = 1 ;
        preloadScreen.style.backgroundColor = '#1e1a22ff'

        // ----------------------------------------

        const playlistHTML = document.getElementById('playlist--video');
        playlistHTML.innerHTML = 'loading playlist...' 
    
        const response = await fetch('/api/update-playlist');
        const responseJSON = await response.json();

        // console.log({responseJSON});
        console.log({res:responseJSON.payload});

        const playlistItems = responseJSON.payload ;

        playlistHTML.innerHTML = '' ;

        for (const plItemBundle of playlistItems) {

            playlistHTML.appendChild(createPlaylistItem(plItemBundle , handlePlaylistItemClick));
        }

    }
    catch (e) {
        console.log({e});
    }


}

function createPlaylistItem (plItemBundle , onclick = f=>f) {
    
    console.log({plItemBundle});

    const {filename , id} = plItemBundle; 

    const playlistItemContainer = document.createElement('div');

    // mutate playlist item
    playlistItemContainer.setAttribute('x-id' , id);
    playlistItemContainer.innerHTML = filename ;
    playlistItemContainer.onclick = onclick ;
    playlistItemContainer.className = 'playlist-item--container';

    return playlistItemContainer ;
}

class App {


    constructor () {

    }
}