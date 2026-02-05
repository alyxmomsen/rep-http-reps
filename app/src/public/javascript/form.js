
window.addEventListener("DOMContentLoaded" , () => {

    const formHTML = document.getElementById('form--main');
    const uploadStatusHTML = document.getElementById('status--upload');
    uploadStatusHTML.innerHTML = '---';
    formHTML.reset();

    formHTML.onsubmit = async (e) => {

        e.preventDefault();

        uploadStatusHTML.innerHTML = 'loading...';

        const formdata = new FormData(formHTML);
        
        try {

            const response = await fetch('/api/handle-form' , {method:'post' , body:formdata});
            const responseJSON = await response.json();

            uploadStatusHTML.innerHTML = 'done'.toUpperCase();

            console.log({responseJSON});
        }
        catch (e) {
            console.log({e});
        }
    }

});