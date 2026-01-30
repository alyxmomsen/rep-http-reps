

window.addEventListener("DOMContentLoaded", async () => {
    
    await initForm();

    // hard code

    const playlist = document.getElementById('playlist');
    
    const response = await fetch('/api/get-playlist', { method: 'post' });
    const jsondata = await response.json();

    const { playlist:_playlist } = jsondata;

    _playlist.forEach(elem => {

        const newElem = document.createElement('div');

        newElem.innerHTML = elem;

        playlist.appendChild(newElem);

    });

    console.log({jsondata});

});

async function initForm() {
    
    const formelement = document.getElementById('form');

    if (!formelement || formelement instanceof HTMLFormElement === false) return;
    
    formelement.addEventListener('submit', handleFormSubmit);
    
}

async function handleFormSubmit(ev) {
    
    if (ev instanceof SubmitEvent === false) return;

    ev.preventDefault();
    

    const responseResolver = {
        'bar': {
            handler() {
                // const divelement = document.createElement('div')

                // divelement.
                const statuselem = document.getElementById('status-display');
                statuselem.innerHTML = 'DONE';
                statuselem.style.color = 'red'
            }            
        } , 
        'message': {
            handler(payload) {
                console.log({payload});
                const statuselem = document.getElementById('status-display');
                statuselem.innerHTML = 'DONE';
                statuselem.style.color = 'red'
            }
        }
    }
    
    try {
        
        const formdata = new FormData(ev.target);
        const response = await fetch('/api/handle-form', { method: "post", body: formdata });
        
        const jsonResponse = await response.json();

        console.log({ jsonResponse });
        
        const code = jsonResponse['foo'];

        const { handler: handlerLike } = responseResolver[code];
        
        ev.target.reset();

        handlerLike(jsonResponse);

    }
    catch (err) {
        
        console.log({err});
    }

    
    console.log(formdata  ,ev.target);

}