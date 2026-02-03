
window.addEventListener("DOMContentLoaded" , () => {

    
    const formHTML = document.getElementById('form--main');
    
    formHTML.onsubmit = handleFormSubmit;
    
    
});

async function handleFormSubmit(ev , ...params) {
    
    ev.preventDefault();

    const formElem = ev.currentTarget;

    const formdata = new FormData(formElem);

    console.log({formdata});

    try {   
        
        const  response = await fetch('/api/handle-form' , {method:'post' , body:formdata});

        const jsonResponse = await response.json();

        console.log({jsonResponse});
    }
    catch (e) {
        console.log({e});
    }



}