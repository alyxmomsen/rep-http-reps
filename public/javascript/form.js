window.addEventListener("DOMContentLoaded" , () => {

    const mainFormHTML = document.getElementById('form--main');

    mainFormHTML.onsubmit = (e) => handleSubmit(e , {mainFormHTML}) ;
    // mainFormHTML.onsubmit = (e) => {
    //     e.preventDefault();
    // } ;

});

async function handleSubmit(ev , payload) {

    const statusColors = {
        'DEFAULT':'#ffe4c4' , 
        'RED':'red' , 
        'GREEN':'green' ,
        'YELLOW':'yellow' ,
    }
    
    const { mainFormHTML } = payload ;

    const statusHTML = document.getElementById('status');

    ev.preventDefault();

    const formdata = new FormData(mainFormHTML);

    statusHTML.style.color = statusColors.YELLOW ;
    statusHTML.innerHTML = 'uploading...'
    try {
        const response = await fetch('/api/handle-form' , {method:'post' , body:formdata});
        const responseJSON = await response.json();

        statusHTML.style.color = statusColors.GREEN ;
        statusHTML.innerHTML = 'done!!'.toUpperCase() ;
        console.log({responseJSON});
    }
    catch (e) {

        statusHTML.style.color = statusColors.RED ;
        statusHTML.innerHTML = 'smth went wrong'.toUpperCase();
        console.log({e});
    }
    
    statusHTML.style.color = statusColors.DEFAULT ;
    statusHTML.innerHTML = '' ;
}