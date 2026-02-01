
window.addEventListener("DOMContentLoaded" , async () => {

    const mainFormHTML = document.getElementById('form--main');

    mainFormHTML.onsubmit = (e) => handleSubmit(e , {mainFormHTML}) ;
    // mainFormHTML.onsubmit = (e) => {
    //     e.preventDefault();
    // } ;

    await updatePlayList();

});



async function handleSubmit(ev , payload) {

    const cssColors = {
        'DEFAULT':'#ffe4c4' , 
        'RED':'red' , 
        'GREEN':'green' ,
        'YELLOW':'yellow' ,
    }
    
    const { mainFormHTML } = payload ;

    const statusHTML = document.getElementById('status');
    const notUploadedHTML = document.getElementById('not-uploaded-list');

    ev.preventDefault();

    const formdata = new FormData(mainFormHTML);

    statusHTML.style.color = cssColors.YELLOW ;
    statusHTML.innerHTML = 'uploading...'
    try {
        const response = await fetch('/api/handle-form' , {method:'post' , body:formdata});
        const responseJSON = await response.json();

        statusHTML.style.color = cssColors.GREEN ;
        statusHTML.innerHTML = 'done!!'.toUpperCase() ;
        
        const { notUploaded } = responseJSON.payload ;

        console.log({notUploaded})

        
        notUploadedHTML.innerHTML = notUploaded.join('; ');
        notUploadedHTML.style.color = cssColors.RED ;

    }
    catch (e) {

        statusHTML.style.color = cssColors.RED ;
        statusHTML.innerHTML = 'smth went wrong'.toUpperCase();
        console.log({e});
    }

    await updatePlayList();
}

async function updatePlayList () {
    
    const playlistHTML = document.getElementById('playlist');

    try {
    
        playlistHTML.innerHTML = 'updating...' 

        const response = await fetch('/api/get-playlist' , {method:'post'});
        const responseJSON = await response.json();

        console.log({responseJSON});

        const {payload:{files}} = responseJSON ;
    
        
        playlistHTML.innerHTML = '' ; // clear conttainer
        for (const file of files) {
            playlistHTML.appendChild(await createPlaylistItem(file))
        }
        
        console.log({files});
    }
    catch(e) {
        console.log({e});
    }
}

async function createPlaylistItem(file , wrapperstyle = '') {
    
    let style = '';

    if(!wrapperstyle) {
        style = ''
    }


    const { id, filename , contentType , description } = file ;

    const wrapperHTML = document.createElement('div');
    wrapperHTML.classList.add('wrapper');
    wrapperHTML.className = 'wrapper brd--dft flex flex-gap' ;

    const descriptionHTML = document.createElement('div');
    descriptionHTML.innerHTML = description ;
    
    const titleHTML = document.createElement('div');
    titleHTML.innerHTML = filename;

    wrapperHTML.setAttribute('x-id' , id);
    wrapperHTML.setAttribute('x-content-type' , contentType);
    wrapperHTML.onclick = () => {alert(id)}

    wrapperHTML.appendChild(titleHTML);
    wrapperHTML.appendChild(descriptionHTML);

    return wrapperHTML ;
}