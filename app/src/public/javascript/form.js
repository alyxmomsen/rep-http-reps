
window.addEventListener("DOMContentLoaded" , () => {

    const formHTML = document.getElementById('form--main');

    formHTML.onsubmit = async (e) => {
        e.preventDefault();

        const formdata = new FormData(formHTML);
        
        try {

            const response = await fetch('/api/handle-form' , {method:'post' , body:formdata});
            const responseJSON = await response.json();

            console.log({responseJSON});
        }
        catch (e) {
            console.log({e});
        }
    }

});