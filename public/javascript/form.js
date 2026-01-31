

window.addEventListener("DOMContentLoaded", async () => {

    await formhandler ();

    

});

async function getVideoStreamById (id) {
    const body = document.body 
    const videoHTML  = document.createElement('video');
    videoHTML.style.width = '300px';
    videoHTML.style.position = 'absolute';
    videoHTML.style.top = 0;
    videoHTML.style.right = 0;
    videoHTML.style.backgroundColor = 'black';
    

    videoHTML.controls = true ;

    body.appendChild(videoHTML);


    videoHTML.src = `/api/video-stream/${id}`;
    videoHTML.load();

}

async function updatePlayList () {
    
    const playlisContainerHTML = document.getElementById('playlist');
    // playlisContainerHTML = 'updating...' ;
    
    const response = await fetch('/api/get-media-data' , {method:'post'});

    const responseJSON = await response.json();

    const { message , payload , status: customStatus } = responseJSON ;

    console.log({responseJSON});

    const {audio, video, images} = payload ;

    await handleMediaContent('video' , video );
    await handleMediaContent('audio' , audio);
    await handleMediaContent('images' , images);

}

async function formhandler (params) {

    const playlisContainerHTML = document.getElementById('playlist');
    
    await updatePlayList();

    const formhtml  = document.getElementById('form');
    formhtml.onsubmit = async (ev) => {

        ev.preventDefault();

        
        try {
            
            playlisContainerHTML.innerHTML = 'update...' ;
            const form = new FormData(formhtml);
            const response = await fetch('/api/handle-form' , {method:'post' , body:form});

            const responseJSON = await response.json();

            const { message , payload , status: customStatus } = responseJSON ;

            console.log({responseJSON});

            const {audio, video, images} = payload ;
            playlisContainerHTML.innerHTML = '' ;
            await handleMediaContent('video' , video );
            await handleMediaContent('audio' , audio);
            await handleMediaContent('images' , images);
        }
        catch (e) {
            console.log('smth wrong');
        }
    }
}

async function  handleMediaContent (title , dataArray) {

    console.log({dataArray});

    const playlisTargetElement = document.getElementById('playlist');
    
    const mediacontentwrapper =  document.createElement('div');
    mediacontentwrapper.classList.add(['wrapper',  'bdr', 'bdr-r-4']);
    
    const header = document.createElement('h3');
    header.innerHTML = title ;
    
    const contentContainer = document.createElement('div');
    contentContainer.classList.add(['wrapper',  'bdr', 'bdr-r-4']);
    
    mediacontentwrapper.appendChild(header);
    mediacontentwrapper.appendChild(contentContainer);

    dataArray.forEach(elem => {

        const item = document.createElement('div');
        item.setAttribute('x-item-id' , elem.id);

        item.onclick = async (ev) => {
            const mediaid = ev.target.getAttribute('x-item-id') ;
            console.log(mediaid);
            getVideoStreamById(mediaid);
        }

        item.innerHTML = elem.filename ;

        contentContainer.appendChild(item);
    });

    playlisTargetElement.appendChild(mediacontentwrapper);
}